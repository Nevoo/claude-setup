# Easing curves

The vocabulary is eight named cubic-bezier curves in two families: four **calm** curves (the explainer register) and four **editorial speed ramps** (the reel register). Every tween must use one of them. All eight ship in `assets/curves.ts`.

Never use Canvas Commons' named ease functions (`linear`, `easeInOut`, etc.). They approximate; bezier hits the exact AE/Apple curves. The implementation (`assets/curves.ts`) is a Newton-Raphson solver of `x(t) = value` that returns `y(t)`.

## The four calm curves (explainer register)

### `OUT` — `cubicBezier(0.16, 1, 0.3, 1)`

Calm, decisive settle. Front-loaded — most of the distance is covered quickly, then settles into the final value.

**Use for**: anything ENTERING or ARRIVING.
- opacity fade-ins
- titles sliding into place
- icons appearing
- elements arriving from off-frame
- secondary settle moves after a primary motion
- cursor moves where you want immediate response then a calm landing

### `IN_OUT` — `cubicBezier(0.65, 0, 0.35, 1)`

Symmetric S-curve. Slow start, accelerates through middle, slow end.

**Use for**: CAMERA and POSITION transitions.
- camera glides between scenes (`flyTo`)
- camera zooms in/out
- node positions changing across the frame
- line draws (`end` signal)
- anything where the start AND end states are static and the middle should feel "in motion"

### `DRAG` — `cubicBezier(0.72, 0, 0.18, 1)`

Heavy resistance at start, decisive arrival at end. **No tail bounce.** Like a sticker peeled from the start position then snapped into the new one.

**Use for**: secondary elements that should LAG behind primary motion, without overshooting at the end.
- hero text being dragged off-screen by a camera pan
- elements that should feel "pushed" or "pulled" by another element's motion
- when you want mid-motion lag without a post-camera tail

The trick: when DRAG is paired with IN_OUT at the SAME duration, the two elements move together but the DRAG element lags through the middle, giving a sense that the IN_OUT element is "leading" — without either of them overshooting.

### `BOUNCE` — `cubicBezier(0.34, 1.45, 0.5, 1)`

Subtle overshoot. `y` peaks at ~1.066 mid-curve and settles at 1.0. Exact peak is around `t ≈ 0.6`.

**Use for**: landing scales of SMALL elements only.
- a card scaling from 0.9 to 1.0 on entry
- a small icon snapping into place
- a search input scaling up from 0 to 1
- a chip morphing size when both start and end are deliberately "physical"

**NEVER use BOUNCE for**:
- **position transitions** — looks janky, the overshoot reads as "wrong"
- **camera moves** — induces motion sickness, breaks immersion
- **text** — overshoot makes letters wobble, kills readability
- **widths/heights bounded by another element** — the overshoot will visibly exceed the bound (e.g. a progress bar peeking past its background track)

## Editorial speed-ramp curves (kinetic / reel work)

The four calm curves above are the explainer vocabulary. **Launch reels and kinetic typography** need a second family — editorial "speed ramps" that linger, *whip*, and settle. They are still exact beziers; reach for them when the motion itself is the show (camera punches, whole-frame pans, comet smears). They ship in `assets/curves.ts` alongside the calm four.

### `RAMP` — `cubicBezier(0.85, 0, 0.15, 1)`
Lingers, then **whips**, then decelerates hard. The workhorse for camera punches/glides and big whole-frame moves where you want a held beat → snap → settle.

### `RAMP_LONG` — `cubicBezier(0.9, 0, 0.16, 1)`
Lingers *harder* so the whip lands later and hits harder by contrast, then still settles smoothly. For a long pan whose payoff is the **build**, not the move (e.g. holding on a word, then whipping across a row of stretched glyphs).

### `ACCEL` — `cubicBezier(0.55, 0.055, 0.675, 0.19)`
Pure ease-**IN**: lingers, accelerates, and **exits at full speed (no decel tail)**. Use only when the momentum should *carry into the next beat*. ⚠️ Because it ends at full velocity, if nothing continues the motion it reads as an **abrupt stop** — don't use it as the last move of a sequence.

### `GLIDE` — `cubicBezier(0.25, 0.1, 0.2, 1)`
Starts **moving immediately** — nonzero initial velocity, no dead-start linger — builds into a whip, then settles. For a continuous slide that should flow *into* a ramp instead of starting from a stop. This is the curve for "keep the motion stable, then transition into the ramp."

**Continuity tip:** to avoid a dead stop between an entry and a pan, make them **one tween** (e.g. `world.x(end, ENTRY_DUR + PAN_DUR, GLIDE)`) rather than two chained tweens — chained tweens hit a velocity discontinuity at the seam unless you hand-match slopes. One easing over the whole distance can't have an internal stop, and reveal/position-driven events still fire correctly because they key off the *value* swept, not time.

## The pairing rule (multi-property tweens)

When animating multiple properties of one element simultaneously, split between "physical landings" and "intangible properties":

- **Physical landings** (size, position, scale, radius) → share one curve so they overshoot/arrive together. Often BOUNCE or OUT.
- **Intangible properties** (color, fontWeight, letterSpacing, opacity, fill) → use IN_OUT or OUT at the SAME duration so they finish in step but don't try to overshoot.

Example from the search → pill morph:

```ts
// Physical landings — share BOUNCE so they snap together
searchRect().size([164, 54], MORPH, BOUNCE),
searchRect().radius(27, MORPH, BOUNCE),

// Color / weight / spacing — IN_OUT at same duration, finish on time
searchRect().fill(INK, MORPH, IN_OUT),
searchText().fontWeight(600, MORPH, IN_OUT),
searchText().letterSpacing(-0.3, MORPH, IN_OUT),
```

`fontSize` is borderline — it's "physical" enough to track with size/position on OUT. Don't bounce it.

## Width animations: prefer OUT, not BOUNCE

A bar fill (e.g. score progress) is morally a scale, but it's usually bounded by a background track. BOUNCE will overshoot the track by ~6% briefly. Use OUT — decelerates cleanly into the target width.

```ts
bar.width(targetWidth, 0.62, OUT)  // not BOUNCE
```

If you need a "snap" feel without overshoot, OUT is sufficient — it's already front-loaded.

## Numerical count-ups

When ticking a number up to a final value with `waitFor` steps, the steps are linear by default. To match the rest of the animation's feel, ease the count too:

```ts
function* countTo(node: Txt, value: number, duration: number, ease = OUT) {
  const steps = 22;
  for (let i = 1; i <= steps; i++) {
    const eased = ease(i / steps); // returns 0..1
    node.text(`${Math.round(value * eased)}`.padStart(2, '0'));
    yield* waitFor(duration / steps);
  }
}
```

Without easing, the count rushes uniformly. With OUT, it approaches the answer quickly then refines — feels premium.

## `.to()` chaining for sequential tweens on one property

Two consecutive tweens on the same property chain via `.to(...)`:

```ts
yield* camera().zoom(2, 1, IN_OUT).to(0.5, 1.5, IN_OUT).to(1, 1, IN_OUT);
yield* circle().fill(ACCENT, 0.4, OUT).to(GREEN, 0.4, OUT);
```

This is one yielded statement, not three — the chain is sequenced internally. Use it for "punch in, hold, settle back" sequences without nesting them in `chain()`.

## `tween()` for custom interpolation

When the built-in property tweens aren't enough (e.g. interpolating along a Bezier path, mapping a value to a non-property expression), use the lower-level `tween` primitive with a normalized 0→1 progress:

```ts
import {tween, map} from '@canvas-commons/core';

yield* tween(2, value => {
  const eased = OUT(value);
  circle().position.x(map(-300, 300, eased));
});
```

This is the escape hatch — most of the time, property tweens with named curves cover it.

## How to compute the linear time for a target eased value

When you need an event to fire at a specific eased value (e.g. "the dot reaches y=500 when end=0.476"), you can't just multiply linear time. With IN_OUT, the middle is compressed.

For IN_OUT, numerically:

```
yAt(t) = -2t³ + 3t²
xAt(t) = 1.9t³ - 2.85t² + 1.95t
```

Given a target eased value `v`:
1. Solve `yAt(t) = v` for `t` (binary search or Newton)
2. Compute `xAt(t)` — that is the linear time fraction
3. Multiply by duration

Worked example (IN_OUT, duration 3.5s, target end value 0.476):
- `yAt(0.487) ≈ 0.476` → `t ≈ 0.487`
- `xAt(0.487) ≈ 0.493`
- Event time = `0.493 × 3.5 = 1.73s` after the tween starts
