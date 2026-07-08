# Pacing & continuous motion

The single biggest "Apple vs. not Apple" lever is whether motion reads as **one continuous thing** or as **a sequence of discrete beats**. This file is how to make it the former.

## One `yield* all()` per coherent moment

Anything that should feel like one moment goes in one `all()` block. Inside, use `chain(waitFor(x), ...)` for delayed reactions — they're still part of the same block.

```ts
yield* all(
  // primary motion
  camera().position.y(-1840, 3.5, IN_OUT),
  mapConnector().end(1, 3.5, IN_OUT),

  // delayed reactions — same block, just offset
  chain(waitFor(1.73), all(
    spotCards[0].opacity(1, 0.45, OUT),
    spotCards[0].position.x(-200, 0.6, OUT),
  )),
  chain(waitFor(1.95), all(
    spotCards[1].opacity(1, 0.45, OUT),
    spotCards[1].position.x(200, 0.6, OUT),
  )),
);
```

This reads as ONE motion. Don't replace it with `yield* sequence(...)` of small separate `all()` blocks — that introduces beats and breaks the flow.

## Avoid the move → hold → move camera pattern

This is the most common "doesn't feel Apple" pattern. The camera glides somewhere, holds for 2–3 seconds, then glides again. During the hold, *other things keep moving* (a dot continues drawing, an animation plays). The camera and those elements are now decoupled, and the hold feels dead.

**Replace with one continuous glide** that shares the leading element's duration.

If the audience needs a beat to read content, add a SHORT (~0.4s) `waitFor` AFTER the `all()` block — not inside the camera path:

```ts
yield* all(/* camera + line + spots, all 3.5s */);
yield* waitFor(0.4);  // brief read beat
yield* all(/* camera continues to next scene */);
```

The `waitFor` between `all()` blocks is fine — it's a deliberate pause between moments. The hold inside one moment is not fine.

## Synced events: compute timings from the curve, not linear time

When something should fire as a leading element passes a position (e.g. "this spot animates in when the dot reaches y=500"), you can't use the linear time fraction. With IN_OUT, the middle of the duration covers more value than the start or end.

For an IN_OUT tween of `end` 0 → 1 over 3.5s, on a line whose `end` maps to dot y via `y = start + end × range`:

- `end = 0.476` happens at linear time fraction ≈ **0.493** (not 0.476)
- `end = 0.657` at linear ≈ **0.558**
- `end = 0.838` at linear ≈ **0.657**

Multiply by duration to get event time:

- `0.493 × 3.5 = 1.73s`
- `0.558 × 3.5 = 1.95s`
- `0.657 × 3.5 = 2.30s`

See `easing.md` for the inversion math. If you skip this and just use `endValue × duration`, events will fire too late.

## Hand-off pacing between scenes

Two scenes that should feel like a continuation should:

- **Move in the same direction** (down → down, never down → right)
- **Use the same easing** (IN_OUT both ends)
- **Have a minimal gap** between them — a 0.3–0.5s read beat is plenty
- **Overlap title fade-ins with the camera arrival** — start the title fade ~0.3s into the camera move

```ts
yield* all(
  camera().position.y(-2900, 1.3, IN_OUT),
  chain(
    waitFor(0.3),
    all(
      scoreTitle().opacity(1, 0.45, OUT),
      scoreLabel().opacity(1, 0.5, OUT),
    ),
  ),
);
```

A new scene that's a hard CUT (different topic, fresh framing) can use `flyTo` with a faster duration (~0.9s) and no overlap — the cut is the beat.

## Title arrival pattern

Titles slide UP into their final position (a few px) while fading in. Position and opacity in the same `all()`:

```ts
yield* all(
  heroTitle().opacity(1, 0.6, OUT),
  heroTitle().position.y(-60, 0).to(-40, 0.7, OUT),
);
```

The `position.y(-60, 0).to(-40, 0.7, OUT)` pattern: snap to -60 instantly, then tween to -40 over 0.7s. The "snap then tween" is how you set a starting position and animate from it in one go.

Subtitles follow with a small stagger:

```ts
yield* sequence(0.08, /* title */, /* label */);
```

## Camera pan kicking text off-screen

When the camera pans and text needs to leave the frame because of the pan, use DRAG on the text at the SAME duration as the camera IN_OUT. The text lags through the middle but arrives without bouncing:

```ts
yield* all(
  camera().position.y(-1080, 0.85, IN_OUT),
  heroTitle().position.y(60, 0.85, DRAG),
  heroLabel().position.y(170, 0.85, DRAG),
  // ...next scene's first element appears mid-pan with chain(waitFor(0.38), ...)
);
```

The next scene's content starts entering BEFORE the previous text finishes leaving — overlapping handoff so there's no empty beat.

## Typing animation

Per-character typing with a caret. Compute caret x from a fixed advance width so the caret sits flush against the right edge of the last typed letter:

```ts
function* typeText(text: string, interval = 0.085) {
  searchText().text('');
  caret().opacity(1);
  const baseX = -342;    // matches searchText's left-edge position
  const advance = 20;    // tuned per font/size
  for (let i = 0; i < text.length; i++) {
    searchText().text(text.slice(0, i + 1));
    caret().position.x(baseX + (i + 1) * advance);
    yield* all(
      caret().opacity(0.3, interval * 0.45),  // brief blink during keystroke
      waitFor(interval),
    );
    caret().opacity(1);
  }
  yield* caret().opacity(0, 0.16);  // fades out when done typing
}
```

The caret blink (full → 0.3 → full) per keystroke gives a tactile rhythm. The fadeout signals "typing is done, focus elsewhere now."

## Stagger sizing

For sequenced reveals (cards arriving, rows appearing), the stagger interval should be smaller than the per-item duration so items overlap:

- 3 cards, each fading in over 0.34s: stagger ~0.09s (massive overlap, reads as one wave)
- 3 rows, each 0.32s: stagger ~0.08s
- 4+ items: stagger 0.12–0.18s

If stagger > per-item duration, items finish before the next starts — that's a sequence of beats, not a wave.
