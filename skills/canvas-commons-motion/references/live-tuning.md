# Live tuning — build the human a slider panel, don't judge frames

The single most important process lesson: **you cannot dial in motion by rendering frames and judging them.** Taste lives with the human. When a beat needs to *feel* right (a stretch, a whip, a crash, spacing, timing), stop guessing numbers and round-tripping renders — **expose every tunable as a live slider and let the person drag it.** It converged in minutes what a dozen render-and-eyeball cycles couldn't.

Your job is correctness + tooling: make the geometry/easing *parameterizable and live*, verify it *compiles and runs* (a headless smoke check), and verify *facts* from the engine source (see below) — not aesthetics.

## The pattern

### 1. One params object, localStorage-backed

```ts
export const DEFAULTS = { MAX_Y: 10, O_W: 120, PAN_DUR: 3, /* …every magic number… */ };
export const P = { ...DEFAULTS, ...loadOverrides() };   // overrides persisted to localStorage
```
Persist only the diff from `DEFAULTS`. The scene reads **everything** from `P` — no literals buried in the scene.

### 2. Live vs structural params

- **Live** — read inside per-frame reactive bindings (`node.scale(() => f(P))`). Drag → repaint shows it instantly. Shape, size, spacing-stretch, opacity, trail, pivots.
- **Structural** — read once when the generator runs (node count, layout pitch, tween durations, easings). Changing them needs a **rebuild** = `location.reload()` (localStorage survives). Mark them in the UI (e.g. orange) so it's obvious a rebuild is pending.

### 3. Force a repaint of the PAUSED frame

The editor's run loop only redraws a paused frame when `requestedRender` is set. So a live edit needs two things: invalidate the reactive bindings, then ask the player to render.

- Add a `tick = createSignal(0)`; **every reactive binding reads `tick()`** (plain `P.foo` changes don't invalidate a computed — `P` isn't a signal). The panel bumps `tick(tick()+1)`.
- Grab the `Player` via the **public plugin hook** (no engine edits): a plugin object `{ name, player(p){ playerRef.current = p } }` added to `makeProject({ plugins: [...] })`. After bumping `tick`, call `playerRef.current.requestRender()`.

```ts
// params module
export const playerRef = { current: null as null | { requestRender(): void } };
export const capturePlayerPlugin = () => ({ name: 'debug-capture', player: (p:any) => (playerRef.current = p) });
// panel onChange (live param): P[key] = v; persist(); tick(tick()+1); playerRef.current?.requestRender();
```

### 4. The panel

A plain DOM overlay (`document.body.appendChild`) — a `range` + number input per param, grouped, with min/max/step metadata. It does **not** pollute renders (the exporter captures the canvas, not the DOM). Buttons: **Reset** (clears overrides), **Copy** (dumps `JSON.stringify(P)` to clipboard).

### 5. Close the loop for renders

Headless renders run in a **fresh browser profile → empty localStorage → DEFAULTS.** So the live-tuned values in *your* browser don't reach the render. Flow: human tunes → clicks **Copy** → pastes the JSON back → you bake it into `DEFAULTS`. Now the render matches the editor.

## Variant rounds — range before depth (don't start with sliders)

Sliders explore a *neighborhood*; they can't tell you the neighborhood is wrong. Starting a taste session by dragging sliders from one seed risks polishing a local maximum. Borrow the designer's "range and depth" discipline (Josh Puckett): first explore meaningfully different *concepts*, then refine *within* the winner. You generate the variants (systematic spread is your strength); the human picks (taste is theirs).

**Round 1 — range (3 variants).** Differ in *kind*, not amount: what leads the motion (camera-led vs element-led vs morph-led), which curve family carries the beat, what the focal element is. Each must be defensible as shippable — no strawmen to make a favourite win.

**Round 2 — depth (up to 3×3).** Within the winning concept, build a grid from **two named perceptual axes** — e.g. *aggression* (how hard the whip hits) × *texture* (how much secondary motion). Implement each axis as a **meta-param 0→1 that maps onto several raw params together**:

```ts
// an axis is a master signal in PARAM space — one knob, many raw params moving coherently
const aggression = (t: number) => ({
  PAN_DUR: lerp(1.4, 0.7, t),      // faster…
  CURVE: t < 0.5 ? RAMP : RAMP_LONG, // …harder linger
  SMEAR: lerp(0.2, 1.0, t),        // …more stretch on the whip
});
// the 3×3 grid = sampling two axes at {0, 0.5, 1}; a cell = merged overrides on DEFAULTS
```

**Round 3 — polish.** After a cell wins, the two axes *become sliders* — the human drags continuously between variants instead of between raw numbers. Raw-param sliders remain for the last few percent.

**Why axes, not 9 arbitrary presets:** motion can't be glanced at like 9 static mockups — comparison is sequential, and recognition memory holds ~2–3 motions. A grid where one step changes one named quality stays navigable at 9; nine unrelated presets don't.

**Label panel controls in plain language, not craft jargon.** The person tuning doesn't share your vocabulary: "beat start / beat len" confused in practice; "loop from / loop length / play loop" didn't. Same for axis names — pick words that describe what the eye sees. And give the variant grid a *visible clickable face* (3×3 buttons, active cell highlighted) — keyboard-only variants are undiscoverable.

**Panel support this needs** (cheap on top of the existing pattern — a variant is just a named overrides object):
- Number keys **1–9** apply a cell's overrides (`persist(); tick++; requestRender()`), flagging cells whose *structural* params differ (rebuild pending).
- **Replay-the-beat on switch**: seek to the beat's start time event and play its 1–2s window, every keypress. Comparing motions without instant same-beat replay is worthless.
- **Copy** dumps the current cell + slider state as usual; bake the winner into `DEFAULTS`.

Static tie-in: for the *spacing* and composition aspects (not feel), tile the same frame — or an onion-skin strip — from all 9 cells into one contact sheet (`rendering.md` pipeline at low res). Those aspects genuinely can be judged in a glance; use it to kill obviously-wrong cells before the human plays anything.

## Verify facts from engine source, not memory

This stack has surprises (`anchor` not `offset`; `layout={false}` position ignored; nodes scale about origin; the player only repaints paused frames on `requestRender`). When behaviour is baffling, **grep the Canvas Commons source** (`packages/2d/src/lib/components/*.ts`, `packages/core/src/app/Player.ts`) and confirm — every "why is this off" in this project was settled by reading `localToParent`, `TxtLeaf.draw`, or `Player.run`, not by guessing. Pair that with a one-shot compile/WebGL **smoke check** (load the page headless, assert `pageerrors: 0` and the render button exists) after every edit.
