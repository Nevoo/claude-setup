# 3D-native kinetic typography motifs

These are the patterns this stack was built for — words as real planes in perspective, punched, popped, and pulled. Each is signal-driven (see `camera-rig.md`) and uses the editorial speed-ramp curves from `canvas-commons-motion` → `easing.md`.

## The stacked gradient-card count / wordmark

A vertical stack of word-planes, each its own gradient, punched through one at a time. The spine of an intro ("one / two / three", "a / new / type / of").

**Build the stack** — compute y-centres top→bottom with a slight overlap, then re-centre on the origin:

```ts
const OVERLAP = 0.12; // world units adjacent cards overlap
const centers: number[] = [];
WORDS.forEach((wd, i) => i === 0
  ? centers.push(0)
  : centers.push(centers[i-1] - (WORDS[i-1].h/2 + wd.h/2 - OVERLAP)));
const mid = (centers[0] + WORDS[0].h/2 + centers.at(-1)! - WORDS.at(-1)!.h/2) / 2;
const Y = centers.map(c => c - mid);                  // resting y per card
const stackH = (centers[0] + WORDS[0].h/2) - (centers.at(-1)! - WORDS.at(-1)!.h/2);
```

Each card: `{ text, h /*world height*/, z /*resting depth*/, angle /*in-plane tilt °*/, top, bottom /*gradient*/ }`. Distinct gradient + a small per-card tilt is what reads as **playful** rather than a flat list.

## Perspective punch through the stack

Camera punches word-to-word as each pops in — see `punchTo()` in `camera-rig.md`. The combination of `distFor`-framed Z punches + depth-pop entrances + per-card gradients is the whole "3D kinetic count" look.

## Playful "light" without lights

There are no lights (`MeshBasicMaterial`). You fake liveliness with motion against the baked gradients:

- **Per-card tilt** (`mesh.rotation.z = baseAngle`) — cards lean, catch their gradient differently.
- **Rotational pop on entrance** — drive rotation from the entrance signal so each card *unwinds* an extra lean as it lands:
  ```ts
  const popTilt = WORDS.map((_, i) => (i % 2 ? -1 : 1) * 0.26); // alternating extra lean
  meshes[i].rotation.z = baseAngle[i] + (1 - a) * popTilt[i];   // a = appear[i](); unwinds to rest
  ```
- **Group 3D turn** — a small persistent `rotY`/`rotX` during the sequence (e.g. 0.13 / 0.05 rad) makes the stack read as objects in space; **straighten to 0 on the reveal** for a clean frontal payoff.

## Pull-back THROUGH the text reveal (the signature transition)

Reveal a 2D headline as if the camera recedes through it, while the 3D content behind shrinks away — one continuous recession:

1. The 2D headline starts **huge** (`scale ≈ 5`, overflowing frame) and **invisible**, parked at its final framed position.
2. Run **one pull-back**: camera `camZ → allZ` (RAMP), the 3D stack **shrinks** (`group.scale → small`) and **fades**, the group **straightens** (`rotY/rotX → 0`), and the headline **`scale → 1`** over the *same* duration/curve.
3. Pop the headline's opacity in ~15% into the pull-back — the instant the "camera passes its plane."

```ts
goGroup().scale(P.LETS_BIG); goGroup().opacity(0);            // huge + hidden
yield* all(
  camZ(allZ, P.ZOOM_DUR, RAMP),
  scale(P.COUNT_SHRINK, P.ZOOM_DUR, RAMP),                    // 3D recedes
  rotY(0, P.ZOOM_DUR, RAMP), rotX(0, P.ZOOM_DUR, RAMP),       // straighten
  goGroup().scale(1, P.ZOOM_DUR, RAMP),                       // headline recedes to readable
  chain(waitFor(P.ZOOM_DUR * 0.15), goGroup().opacity(1, P.ZOOM_DUR * 0.3, OUT)),
);
```

Because the flat headline and the 3D stack both *shrink toward readable/away* on the same easing, the 2D overlay reads as part of the 3D recession. This beats any 2D drop/slam for "emerge from depth." (If the count should leave by fading too, just add its `opacity → 0` to the block — the recession sells the camera move either way.)

## Hand off 3D → 2D continuation

After the pull-back reveals the flat headline, the rest of the beat is usually 2D (a pan/whip across kinetic glyphs — see `canvas-commons-motion` → `kinetic-glyphs.md`). Keep it continuous: the 3D recession settles, the 2D motion picks up. Don't cut to black or crossfade — the camera recession *is* the transition.
