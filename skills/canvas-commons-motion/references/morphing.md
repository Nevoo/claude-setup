# Morphing one element into another

A morph turns element A into element B by tweening every shared property simultaneously. **Don't crossfade A out and B in** — that loses the spatial relationship and reads as "two unrelated elements," not "the same thing changed."

## The search → pill case study

Scene 1 has a large search input: 820×116 white rect, 58 radius, magnifying-glass icon, "Tokyo" text (fontSize 36, ink color), caret.

Scene 2 has a small Tokyo pill: 164×54 black rect, 27 radius, blue dot, "Tokyo" text (fontSize 22, white).

They share their primitive structure (a Rect, a Txt, a positioned Circle). So instead of swapping them, morph the searchCard's children INTO the pill's appearance, in place:

```ts
const MORPH = 0.5;
yield* all(
  // Camera repositions in parallel — slightly longer so it settles AFTER the pill snaps
  camera().scale(1.0, 0.65, IN_OUT),
  camera().position.y(-1140, 0.65, IN_OUT),

  // === Physical landings — BOUNCE on the SAME duration so they snap together
  searchRect().size([164, 54], MORPH, BOUNCE),
  searchRect().radius(27, MORPH, BOUNCE),

  // === Color / weight / spacing — IN_OUT at same duration, finish on time
  searchRect().fill(INK, MORPH, IN_OUT),
  searchRect().stroke('rgba(0, 0, 0, 0)', 0.32, OUT),

  // === Text physical (size, position) on OUT — shares front-loaded timing with BOUNCE
  searchText().fontSize(22, MORPH, OUT),
  searchText().position([-50, 0], MORPH, OUT),
  // Non-physical on IN_OUT
  searchText().fontWeight(600, MORPH, IN_OUT),
  searchText().fill('#FFFFFF', MORPH, IN_OUT),
  searchText().letterSpacing(-0.3, MORPH, IN_OUT),

  // === Icon dissolves; a new dot appears at the icon's exact spot then
  // rides the pill's contraction (OUT) to its rest spot
  searchIcon().opacity(0, 0.18, OUT),
  chain(
    waitFor(0.08),
    all(
      cityDot().opacity(1, 0.22, OUT),
      cityDot().position([50, 0], MORPH - 0.08, OUT),
    ),
  ),

  // === Cursor exits with the morph — it was the cause, now it's done
  cursor().opacity(0, 0.18, OUT),
);
```

## Why this works

1. **One `all()` block** — everything happens in lockstep, not as a sequence of beats.
2. **Same duration for physical properties** (`MORPH = 0.5`) — they overshoot and arrive together.
3. **Same curve for paired properties** — size + radius both BOUNCE, fontSize + position both OUT.
4. **Asymmetric handling of "physical" vs "intangible"** — see the pairing rule in `easing.md`.
5. **A "satellite" element (the new dot) is staged precisely** — it starts at the OLD element's position (the icon's spot) so the morph reads as "the icon became the dot," then rides the parent's contraction to its final rest.
6. **The cursor exits during the morph** — same 0.18s opacity tween, lets it dissolve as the next visual takes over.

## Cause-and-effect timing

A morph that follows a cause (a click, a button press) must happen IMMEDIATELY AFTER the cause, with no gap. The click reads as the trigger for the transformation only if they're temporally adjacent.

```ts
// Click press
yield* all(
  cursor().scale(0.88, 0.07, OUT),
  searchIcon().scale(0.88, 0.07, OUT),
);
// Click release
yield* all(
  cursor().scale(1, 0.18, OUT),
  searchIcon().scale(1, 0.18, OUT),
);
// Morph IMMEDIATELY — no waitFor between release and morph
yield* all(/* MORPH */);
```

If the morph were 0.3s later, it would feel like an unrelated event. The narration cue ("…and it would pull…") can land mid-morph, syncing voiceover to the visual transformation.

## During a click — keep the rest of the UI still

A precise interaction is precise. Only the elements being touched react. The card itself does NOT pulse. The text does NOT shift. The background does NOT dim. The page does NOT flash. This is critical — a click is an interaction, not a vibe.

## When NOT to morph

Morph when A and B are conceptually the SAME thing in a different state. Cut (with `flyTo`) when they're different things in different places.

- "Search input becomes a city tag" → MORPH (same content, transformed).
- "Search results page becomes a map view" → CUT (different scenes, different focus).
- "Card A's value becomes Card B's value" → MORPH if A and B occupy the same slot; otherwise it's two separate cards animating.
