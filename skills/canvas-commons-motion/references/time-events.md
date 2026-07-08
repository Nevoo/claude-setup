# Time events — never hardcode timeline times

The most common mistake in the scoutai-explainer codebase: it shadows the built-in `waitUntil` with a custom helper that takes a *number*:

```ts
// WRONG — defeats the entire editable-timeline system
function* waitUntil(target: number) {
  yield* waitFor(Math.max(0, target - useThread().time()));
}
yield* waitUntil(3.9);   // hardcoded — can't be tuned without editing code
```

The built-in `waitUntil` takes a **string** — the name of a time event — and the editor lets you drag the event on the timeline. The duration persists in the scene's `.meta` file. You re-time without touching code.

## The right way

```ts
import {waitUntil} from '@canvas-commons/core';

yield* heroIntro();
yield* waitUntil('after_intro');        // editor-adjustable
yield* morphSearchToPill();
yield* waitUntil('after_morph');
yield* connectorDrawAndSpots();
yield* waitUntil('after_spots');
yield* scoreCards();
```

The first run shows each event as a draggable pill on the timeline at offset 0. Drag each one to set its duration (relative to the previous one). The values land in `.meta`'s `timeEvents` array.

## Use `useDuration` to drive tween lengths from events

When an animation should match the editor-set duration of a labelled event, use `useDuration(name)`:

```ts
import {useDuration, waitUntil} from '@canvas-commons/core';

yield* card().scale(1, useDuration('card_in'), BOUNCE);
// the editor controls how long the scale-up runs
```

Combine with `waitUntil` to anchor a beat and animate inside it:

```ts
yield* waitUntil('card_in');
yield* card().scale(1, useDuration('card_in'), BOUNCE);
// 'card_in' becomes both an arrival cue AND the duration of the scale-in
```

## Workflow with narration

1. Drop the voiceover audio into the project (`audio: '...'` in project setup).
2. Place `waitUntil('cue_name')` calls in the timeline code at each narration beat.
3. Play the preview. Drag each event pill until the visual cue lands on the spoken cue.
4. Re-record the VO later? Drag the same pills, no code changes.

This is the entire reason time events exist. Hardcoded numbers force you to recompile your mental model every time the audio shifts by a beat.

## Naming conventions

- **Snake_case, action-oriented:** `intro_done`, `morph_starts`, `spots_revealed`, `winner_emphasised`.
- **Avoid timing in the name** (`wait_3s` is a smell — the whole point is that the duration is editable).
- **Co-name with narration cues** when possible — `"and then it would pull..."` → `pull_begins`.

## Shift-drag to lock subsequent events

Dragging an event in the editor by default *shifts* all later events forward/back by the same amount (preserves spacing). Hold SHIFT while dragging to only move that one event and squash/expand the gap.

This is why the workflow is usually: place all events, then drag the first one to align with narration, then go down the list — each later drag is local.

## When you DO want hardcoded times

- Tiny intra-beat micro-delays (e.g. the 0.08s stagger between title and sublabel). Use `waitFor(0.08)` for those — they're not editor-tunable concepts, they're fixed motion rhythm.
- Sub-second delays inside an `all()` block via `chain(waitFor(0.3), ...)`. Same reasoning.

The rule: every BEAT (a narration-anchored moment) gets a `waitUntil('name')`. Everything inside a beat is hardcoded micro-timing.

## Migrating existing code

If you're looking at a scene that uses `waitUntil(number)`, rip out the custom helper and replace each call:

```ts
// before
yield* waitUntil(3.9);
yield* waitUntil(8.119);
yield* waitUntil(13.239);

// after — names match the narration moments
yield* waitUntil('morph');
yield* waitUntil('gemini_evaluates');
yield* waitUntil('left_with_results');
```

Initial event durations default to 0, so the first preview will play the animation back-to-back. Drag pills to add the narration-driven pauses.
