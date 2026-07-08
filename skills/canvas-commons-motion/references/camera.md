# Camera control

## Two camera options — pick deliberately

Canvas Commons ships a dedicated **`Camera`** component that does internal bookkeeping to keep zoom/rotation/pan animations composing correctly when they overlap. There's also the DIY pattern — a plain `Node` wrapper whose position and scale you animate directly. The scoutai-explainer uses the DIY pattern. Each has trade-offs.

### Option A — built-in `Camera` (recommended for overlapping moves)

```ts
import {Camera} from '@canvas-commons/2d';

const camera = createRef<Camera>();
view.add(
  <Camera ref={camera}>
    {/* all scenes */}
  </Camera>,
);

// Pan to a node or coordinate
yield* camera().centerOn(targetNode, 1.0);
yield* camera().centerOn([0, 1140], 1.0);

// Zoom (do NOT touch .scale directly — use .zoom)
yield* camera().zoom(1.55, 0.55);

// Reset to defaults in one move
yield* camera().reset(1.0);

// Chaining works
yield* camera().zoom(2, 1).to(0.5, 1.5).to(1, 1);

// Follow a curve
yield* camera().followCurve(bezier, 2.5);
```

Use this when **zoom + pan animate at the same time**, or when later animations need to compose cleanly with earlier camera moves.

### Option B — DIY `Node` wrapper (simpler, no zoom-compounding)

```ts
const camera = createRef<Node>();
view.add(<Node ref={camera}>{/* all scenes */}</Node>);
```

Camera position is the **negated** focal world position. To focus on world `(0, 1140)`, set `camera.position` to `(0, -1140)`. To zoom in, scale > 1.

Use this when camera moves are sequential and never overlap (e.g. flyTo cuts). Cheaper to reason about. The whole scoutai-explainer is built this way and it's fine for that scope.

**Migration tip:** if you find yourself fighting compounding bugs between zoom and pan in the DIY version, switch to `<Camera>` and use `.centerOn(...)` + `.zoom(...)` instead of writing `.position()` and `.scale()` directly.

The background should sit **outside** the camera so it never pans:

```ts
view.add(<Rect size={[1920, 1080]} fill={BG} />);  // outside camera — stays put
view.add(<Node ref={camera}>{/* ...scenes... */}</Node>);
```

## Scene anchors

Lay scenes out in a single vertical column. Each scene's anchor is a fixed world coordinate; the camera moves between them. No horizontal sweeps — they always feel disorienting.

```ts
const SCENES = [
  {x: 0, y: 0},
  {x: 0, y: 1140},
  {x: 0, y: 2900},
  {x: 0, y: 4040},
];
```

Each scene's content lives in a Node positioned at its anchor; inner positions are relative:

```ts
<Node position={[SCENES[1].x, SCENES[1].y]}>
  {/* Scene 2 content. y=-290 here is 290px above the Scene 2 anchor. */}
  <Txt text="Pull nearby spots." position={[0, -290]} />
</Node>
```

Space scenes far enough apart that earlier scene's content scrolls off before the next one enters. ~1100–1500px between anchors is typical for a 1080-tall viewport.

## `flyTo` helper — hard cuts between scenes

For clean cuts to a specific scene anchor, lerp position AND scale together with IN_OUT:

```ts
function* flyTo(toScene: number, duration = 1.05) {
  const target = SCENES[toScene];
  yield* all(
    camera().position([-target.x, -target.y], duration, IN_OUT),
    camera().scale(1.0, duration, IN_OUT),
  );
}
```

Always lands at scale 1.0 regardless of starting zoom — this is the rest framing.

## Camera locked to a leading element (the cinematic technique)

When an element is the visual focal point (a dot riding a line, a cursor crossing the screen, a connector drawing), the camera must lock to it.

**Rule:** camera and leading element share THREE things:
1. Same easing function
2. Same duration
3. Same start time

Concretely — both inside one `yield* all()` block, both using `IN_OUT`, both running the same number of seconds:

```ts
yield* all(
  camera().position.y(-1840, 3.5, IN_OUT),   // camera glides 700px
  mapConnector().end(1, 3.5, IN_OUT),         // line draws 1108px
  // dot is bound to line tip via signal:
  // lineTipDot().position.y(() => -28 + mapConnector().end() * 1108)
);
```

### Same distance vs. different distance

When camera and leading element cover the **same** world distance, the leading element stays exactly at screen center.

When they cover **different** distances (e.g. camera 700px, dot 1108px), they drift apart predictably. The faster-mover drifts toward the bottom (or wherever it's heading) — a natural "leading the eye" feel rather than a flat track.

**Pick the camera distance based on final framing**, not based on the leading element. Ask: "where does the audience need to be looking when this lands?" Lock the camera to *that*; let the leading element drift.

### Binding the tip to a draw signal

When a line's `end` signal animates 0 → 1, bind a Circle's position to it so the Circle always sits exactly at the leading edge:

```ts
lineTipDot().position.y(() => -28 + mapConnector().end() * 1108);
```

The multiplier (`1108`) must equal `(endPoint - startPoint)` of the line. If they mismatch, the dot lags or floats — a common bug. Compute it from the actual line points, don't hardcode.

## Punch zoom (focus moment during a click)

A camera punch-in uses simultaneous scale + position. For the leading element doing the click (e.g. a cursor), use different curves/durations on x and y to create an arc:

```ts
yield* all(
  cursor().opacity(1, 0.2, OUT),
  cursor().position.x(316, 0.5, IN_OUT),   // x: longer, S-curve
  cursor().position.y(1064, 0.42, OUT),    // y: shorter, settles first
  camera().scale(1.55, 0.55, IN_OUT),
  camera().position.y(-1674, 0.55, IN_OUT),
);
```

The x/y mismatch makes the cursor arc instead of running on a flat diagonal — same AE trick used in motion design tutorials. y settling faster than x produces a "drop in and slide over" feel.

## Click reactions — only the clicked elements respond

During a click, *only* the cursor and the target react (e.g. both scale down to 0.88 then back). The rest of the UI must stay completely still. No background dim, no card pulse, no text shift.

```ts
yield* all(
  cursor().scale(0.88, 0.07, OUT),
  searchIcon().scale(0.88, 0.07, OUT),
);
yield* all(
  cursor().scale(1, 0.18, OUT),
  searchIcon().scale(1, 0.18, OUT),
);
```

Asymmetric timing — fast press (0.07s), slower release (0.18s) — makes it feel tactile.

## Avoid mid-scene horizontal pans

The column layout has a reason: any horizontal camera motion between two pieces of content reads as "this is a different thing now" and breaks continuity. Keep all scene-to-scene motion vertical.

The ONLY horizontal motion in the project is intra-scene (e.g. spots sliding in from off-screen left/right). Inter-scene is always pure vertical.
