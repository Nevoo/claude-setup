---
name: canvas-commons-motion
description: Motion design and library-idiomatic patterns for Canvas Commons / Motion Canvas — calm Apple-style explainers and bold kinetic launch reels. Use when writing or reviewing Canvas Commons code (`@canvas-commons/2d`, `makeScene2D`, generator timelines, signals, layout, time events), designing easing or speed ramps, building morphs between UI elements, choreographing camera moves, pacing scenes across cuts, or building reel motifs (dot burst, cursor-as-character, kinetic word-by-word type, pixel dissolve). Triggers: "motion canvas", "easing", "cubic bezier", "speed ramp", "morph", "kinetic typography", "launch reel", "hype video", "Apple motion", "camera pull-back reveal", "createSignal", "waitUntil", "live tuning", "variant matrix", "render to mp4", "headless render", "ffmpeg stitch", "make it premium", or when shown a frame from a Canvas Commons render and asked to feel sharper, more cinematic, or more kinetic.
---

# Canvas Commons motion design

Opinionated principles for Apple-style explainer animations in Canvas Commons / Motion Canvas. Distilled from a working production scene and from the library author's own demos. Read with conviction: when the rules say "never", they mean it.

## The cardinal rules

1. **Every tween uses one of the eight named cubic-bezier curves** — four calm (`OUT`, `IN_OUT`, `DRAG`, `BOUNCE`) for the explainer register, four editorial ramps (`RAMP`, `RAMP_LONG`, `ACCEL`, `GLIDE`) for reel whips and speed-ramped moves. Never use Canvas Commons' built-in `easeInOut` etc. — they approximate; bezier hits the exact curve. Which curve when: `references/easing.md`.
2. **BOUNCE only on landing scales of small elements.** Never on position, camera, or text.
3. **IN_OUT for camera and position transitions** — that is its whole job.
4. **OUT for anything entering or arriving** — fade-ins, settles, titles sliding in.
5. **One `yield* all()` over discrete beats.** If two motions should feel like one moment, put them in one block.
6. **Camera locked to a leading element** means same easing + same duration + same start time. All three, every time.
7. **`waitUntil` takes a STRING, not a number.** Never shadow it with a custom number-taking helper — that defeats the editor's editable timeline. Every narration beat is a named time event.
8. **Reach for signals before you write imperative state.** If many properties move together, drive them from one master signal — don't tween each one separately.
9. **Use the layout engine for repeated card/row internals.** Manual x/y is fine for scenes and free-floating elements; flexbox is the answer for card content, lists, and anything whose structure could change.
10. **When you copy-paste a JSX block, make it a component.** Function components (closure over scene state) for 2–3× reuse; custom Node subclasses with `@signal`-decorated props for novel drawing or cross-scene reuse. Every internal property binds to the public signal.

## Two aesthetics, one discipline

This skill builds in two registers. The motion discipline below (the cardinal rules, named curves, master signals, "morph don't crossfade") applies to **both** — only the energy and palette change.

- **Calm explainer** (the default, most of this skill) — one idea per camera move, lots of breathing room, the cool Apple-light palette. The content is the star.
- **Launch reel / hype piece** — fast and kinetic, headlines that build word by word, a warm bold palette, and **one signature motif used as the spine**. Almost no hard cuts — everything morphs.

Pick one register per piece and don't mix palettes. When the brief is a product launch, sizzle reel, or "make it feel premium/kinetic," read `references/signature-motifs.md` first. It also carries the reel checklist.

## You cannot judge motion by rendering frames — build the human a panel

The hardest lesson from real iteration: **taste lives with the person, not with you.** When a beat needs to *feel* right (a stretch, whip, crash, spacing, timing), do **not** render-and-eyeball in a loop — it burns time and trust and you'll still be wrong. Instead make the geometry/easing **parameterized and live**, and let the human drag sliders. Your job is correctness + tooling: keep it compiling (a headless smoke check, `pageerrors: 0`), verify *facts* from the engine source (not memory), and expose every magic number. See `references/live-tuning.md` for the params-object + DOM-panel + `requestRender` pattern that turns a dozen failed render cycles into a few minutes of dragging — and for the **variant rounds** discipline (range → depth: 3 concepts, then a 3×3 axis grid, then sliders) that keeps the sliders from polishing the wrong concept.

## When to read what

| Question | Read |
|---|---|
| Which curve do I use here? Why is this property using BOUNCE wrong? | `references/easing.md` |
| Building a launch reel / hype piece? Dot-burst, cursor character, kinetic headlines, pixel dissolve? | `references/signature-motifs.md` |
| How do I make a camera follow a moving element? `centerOn`? Scene anchors? | `references/camera.md` |
| How do I morph one UI element into another (search → pill)? | `references/morphing.md` |
| Does this feel too choppy / discrete / unsynced? | `references/pacing.md` |
| Which colors / sizes / hierarchies for cards and typography? | `references/design.md` |
| How do signals work? What's the "master signal" pattern? | `references/signals.md` |
| Should this be flexbox? How do I animate layouts? | `references/layout.md` |
| How do I sync to narration without hardcoded times? | `references/time-events.md` |
| When should I make a custom component? `@signal` decorators? `tween()`? `clampRemap`? Three.js bridge? | `references/custom-components.md` |
| Stretching/squashing/morphing **real font glyphs**? "o grows off-centre"? `offset` throws? Kinetic-stretch comet? Reveal type in 3D? | `references/kinetic-glyphs.md` |
| The motion needs to *feel* right and I'm guessing numbers / rendering to judge? Build a live slider panel. Exploring variants (range → depth rounds, 3×3 axis grid, A/B presets)? | `references/live-tuning.md` |
| Rendering to MP4 headlessly? Render truncated / blank / wrong fonts / ignoring tuned values? | `references/rendering.md` |
| Real **3D** — three.js inside the scene, perspective camera, depth-pop, 3D card stacks, pull-back reveals, WebGL render? | the **`canvas-commons-3d`** skill |

## Drop-in assets

Copy these into the target project as-is. **The skill's copies are canonical** — individual projects may carry older subsets (e.g. only the calm four curves); sync from here, not from another project.

- `assets/curves.ts` — the `cubicBezier` Newton-Raphson solver and all eight named curves (calm + ramps)
- `assets/palette.ts` — the Apple-light palette and font stack

**Launch-reel motifs** (drop in and wire up — patterns derived from a real launch reel, tune the constants to your scene):

- `assets/palette-reel.ts` — the warm cream + bold-accent palette (use *instead of* `palette.ts` for a reel)
- `assets/DotBurst.tsx` — the "thinking/analyzing" ring→starburst motif, one `progress` signal
- `assets/Cursor.tsx` — the cursor-as-character (arrow + `moveCursor` / `clickCursor` generators)
- The block/pixel dissolve component lives as a recipe in `references/signature-motifs.md` (§5)

## Reviewing an animation that "doesn't feel like Apple"

Walk this checklist in order.

1. **Is anything using BOUNCE on position, camera, or text?** Swap to OUT or IN_OUT.
2. **Is the camera moving while a key element is also moving, but they're not locked?** Make them share easing + duration + start time. See `references/camera.md`.
3. **Is there a move → hold → move camera path?** Replace with one continuous glide that shares the leading element's duration. See `references/pacing.md`.
4. **Are decorative elements doing work that hierarchy should?** (Halos behind dots, big colored auras, sliding scan glows.) Cut them; let typography and color carry it. See `references/design.md`.
5. **Are widths/sizes using BOUNCE and overshooting their backgrounds?** Switch to OUT.
6. **Is a "morph" actually a crossfade?** (A fades out while B fades in at the same spot.) Replace with a true morph — tween every shared property simultaneously. See `references/morphing.md`.
7. **Are timed events (e.g. "card appears when dot passes it") computed from linear time?** With IN_OUT they will fire wrong. Compute from the curve. See `references/pacing.md`.

## Reviewing for library idiom

A second checklist — these aren't about the motion *feel*, they're about whether the code is using Canvas Commons the way the library wants to be used.

8. **Does the scene use `waitUntil(someNumber)`?** That's a custom helper masking the real API. Replace with `waitUntil('event_name')` strings + editor-driven durations. See `references/time-events.md`.
9. **Are the same values being typed into multiple props?** (e.g. `width={() => radius * 2}` written out three times.) That's a master signal. See `references/signals.md`.
10. **Is a card's internal structure built with absolute x/y on every Txt/Rect/Circle?** Convert to a `<Layout direction="column" gap={...}>` so the content reflows when sizes change. See `references/layout.md`.
11. **Is the DIY `<Node ref={camera}>` wrapper used for compounded zoom + pan animations?** Switch to the built-in `<Camera>` component — it composes overlapping camera moves correctly. See `references/camera.md`.
12. **Is the same JSX block (a card, a title pattern, a row) repeated 3+ times?** Extract a function component or a Node subclass. The repeated block becomes one line; future changes happen in one place. See `references/custom-components.md`.
13. **Is a `Txt` being scaled/stretched directly, or positioned with `.offset(...)`, or transformed via `layout={false}` `position`?** All three bite: text scales about its line-box centre (grows off-centre), the pivot signal is `anchor` not `offset`, and `position` on a `layout={false}` child is ignored. Wrap the glyph in a plain `Node` and transform the wrapper; pivot on the *measured* optical centre. See `references/kinetic-glyphs.md`.

## When writing new animation

Before touching code, decide:

- **Which register — calm explainer or launch reel?** That picks the palette (`palette.ts` vs `palette-reel.ts`), the beat density, and whether the camera or the elements carry the motion. For a reel, also pick your **one signature motif** (the dot-burst, the cursor, a recurring shape) before anything else — it's the spine. See `references/signature-motifs.md`.
- **What is the focal element of this scene?** (The dot, the cursor, the morphing pill.) That element drives the camera.
- **What is one continuous motion vs a hard cut?** Continuations share direction and easing; cuts use `flyTo` / `Camera.reset`.
- **Where does the eye need to land at the end?** Camera target frames *that*, not the leading element's endpoint.
- **What signals would unify this?** If you're about to tween three things in parallel by hand, those three things probably want to derive from one signal.
- **Which narration beats are time events?** Name them now; defer their durations to the editor.

Then write one `yield* all()` per coherent moment, with delayed reactions as `chain(waitFor(x), ...)` inside it, and `waitUntil('beat_name')` between coherent moments.
