# The camera rig & the signal-driven `apply()` pattern

## Signals are the source of truth

You never tween three.js objects. Create Canvas Commons signals for everything that moves, tween *those* in the generator with named curves, and copy them onto three.js objects once per frame in `apply()`:

```ts
const camX = createSignal(0), camY = createSignal(0), camZ = createSignal(0);
const tgtX = createSignal(0), tgtY = createSignal(0), tgtZ = createSignal(0); // lookAt target
const rotY = createSignal(0), rotX = createSignal(0); // group orientation
const scale = createSignal(1);                          // group scale (recede/grow)
const appear = WORDS.map(() => createSignal(0));        // per-element entrance 0→1

const apply = () => {
  group.rotation.y = rotY();
  group.rotation.x = rotX();
  group.scale.setScalar(scale());
  camera.position.set(camX(), camY(), camZ());
  camera.lookAt(tgtX(), tgtY(), tgtZ());
  WORDS.forEach((wd, i) => { /* per-mesh: opacity, scale, z, rotation from appear[i]() */ });
};
useScene().lifecycleEvents.onBeginRender.subscribe(apply);
apply(); // call once to set the opening pose before frame 0
```

Then the timeline is pure Canvas Commons — fully editor-scrubbable, all easing in named curves:

```ts
yield* all(camZ(allZ, 1.1, RAMP), camY(0, 1.1, RAMP), tgtY(0, 1.1, RAMP));
```

**Why this matters:** the editor timeline, scrubbing, and the live-tuning panel (`canvas-commons-motion` → `live-tuning.md`) all work because the motion lives in CC signals. Tween a three.js property directly and you lose all of that.

## Frame by intent, not by Z — `distFor`

Don't guess camera distance. Compute the distance at which a world-height object fills a chosen fraction of the frame, from the camera FOV:

```ts
const FOV = 38;
const VHALF = Math.tan(((FOV / 2) * Math.PI) / 180);
// distance so a pill of world-height `h` fills `fill` (0..1) of the vertical frame:
const distFor = (h: number, fill: number) => h / fill / 2 / VHALF;
```

Now camera moves read as intent:

```ts
const open = { y: Y[0], z: WORDS[0].z + distFor(WORDS[0].h, 0.46) }; // top word fills 46%
const allZ = distFor(stackH, 0.82);                                   // whole stack fills 82%
```

`distFor` is the single most useful helper in 3D typography — every "punch in / pull back" becomes a target *fill fraction*, not a magic number you re-tune whenever sizes change.

## Position vs lookAt — move both

The camera has a **position** (`camX/Y/Z`) and a **target** (`tgtX/Y/Z`, fed to `lookAt`). To translate the view laterally/vertically without skew, move **both** together. Move only the position and the camera *swings* (rotates toward a fixed target) — sometimes you want that (a parallax turn), usually you don't.

- **Vertical punch down a stack:** `camY` and `tgtY` to `Y[i]` together → the view slides down, frontal.
- **Pull back / zoom out:** `camZ → larger`, with `camX/Y` and `tgtX/Y` to the stack centre → recede, re-centre.
- **A deliberate 3D swing:** animate `rotY`/`rotX` (group orientation) or move `camX` *without* `tgtX` → the stack turns and catches its gradients at an angle (playful). Straighten (`rotY → 0`) for a clean frontal reveal.

## The camera punch

A punch reframes the camera onto element `i` *as it pops in* — one coherent moment:

```ts
function* punchTo(i: number, fill: number) {
  const z = WORDS[i].z + distFor(WORDS[i].h, fill);
  yield* all(
    camY(Y[i], 0.42, RAMP),
    tgtY(Y[i], 0.42, RAMP),
    camZ(z, 0.42, RAMP),
    chain(waitFor(0.06), appear[i](1, 0.34, OUT)), // the element pops a beat into the move
  );
}
```

Use the editorial speed-ramp curves (`RAMP`/`RAMP_LONG`, see `canvas-commons-motion` → `easing.md`) for punches — linger → whip → settle reads as "snap to the next word." `OUT` for the element's own pop.

## Orientation & scale for life

- `rotY`/`rotX` on the group give the whole rig a 3D turn — a small persistent tilt during a sequence makes flat cards read as **objects**, not stickers. Straighten it to frontal for the payoff.
- `scale` on the group is your "recede" / "approach" handle independent of camera Z — e.g. shrink a finished element toward nothing while the camera does something else.
