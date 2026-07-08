# Kinetic glyphs — scaling, stretching & morphing real type

Hard-won rules for animating **real font glyphs** in Canvas Commons (stretching, squashing, comet smears). Use real `Txt` glyphs, not `Circle`/`Rect` stand-ins — viewers can tell a fake "o" from the font's "o" instantly, and so can the client.

## The transform gotchas (this fork bit us repeatedly)

1. **A `Txt` scales about its LINE-BOX centre, not the glyph's optical centre.** The line box includes ascender/descender slack, so its centre sits *above* the visible glyph. Scale a `Txt` directly and it grows **downward** / off-centre. This is the #1 cause of "the stretch is offset to the bottom."

2. **The origin/pivot signal is `anchor`, not `offset`.** `node.offset(...)` throws `offset is not a function`. Use `node.anchor([x, y])` — normalized `[-1..1]` relative to half-size.

3. **`position.y` on a `layout={false}` child is silently ignored** when its parent is a layout container — the layout pass wins and your `y` does nothing. Don't fight it: **wrap the glyph in a plain `Node`** and put scale/position/opacity on the *wrapper*. A plain `Node`'s `localToParent` is `translate · rotate · scale` about its **own origin (0,0)** (verified in `Node.ts`), so transforms behave predictably. The inner `Txt` only carries `fontSize`/`fill`.

4. **A stroke is centred on the path.** A `Circle`'s real footprint is `width + lineWidth`, so two rings collide even when their *widths* don't. Account for stroke in any spacing / overlap math.

## Symmetric stretch about the glyph's optical centre

To stretch a glyph and have it grow **equally up and down**, you must scale about its *optical* centre, which you have to measure — the engine won't tell you.

**Measure it** (replicate Canvas Commons' own `TxtLeaf` draw math — DOM line box + canvas ink metrics):

```ts
function glyphCenterY(fontSize: number, family: string): number {
  const el = document.createElement('div');
  el.style.cssText =
    `position:absolute;visibility:hidden;white-space:pre;margin:0;padding:0;` +
    `font:800 ${fontSize}px ${family};line-height:normal`;
  el.textContent = 'o';
  document.body.appendChild(el);
  const pr = el.getBoundingClientRect();
  const range = document.createRange(); range.selectNodeContents(el);
  const rr = range.getBoundingClientRect();
  const H = pr.height, topOffset = rr.top - pr.top;          // DOM line box
  document.body.removeChild(el);
  const ctx = document.createElement('canvas').getContext('2d')!;
  ctx.font = `800 ${fontSize}px ${family}`;
  ctx.textBaseline = 'bottom';                                // matches TxtLeaf
  const yBottom = -H / 2 + topOffset + ctx.measureText('').fontBoundingBoxAscent;
  const m = ctx.measureText('o');
  const inkTop = yBottom - m.actualBoundingBoxAscent;
  const inkBottom = yBottom + m.actualBoundingBoxDescent;
  return (inkTop + inkBottom) / 2;                            // optical centre, node-local (+y down)
}
```
Re-measure on `document.fonts.ready` (fallback-font metrics differ from the real face) and cache by `fontSize`.

**Pin it with a counter-translation on the wrapper Node** (NOT by offsetting the inner Txt — see gotcha #3):

```ts
const gc = glyphCenterY(P.O_FONT, FAMILY);
pivot.y(() => BASE_Y - gc * scaleY());   // pivot.scale.y = scaleY; glyph centre stays at BASE_Y
```
The glyph centre after scaling is `gc·scaleY` below the pivot origin; subtracting it pins the centre at `BASE_Y` for **every** scale → symmetric stretch by construction.

### The amplification trap (and the fix)

A measurement error `ε` in `gc` shows up as `ε · scaleY` of drift. At `scaleY ≈ 11` a harmless ~12px pivot error becomes **~130px** of drift on the biggest glyph. Do **not** try to fix that by moving the whole line (that drags the static text too) and do **not** expect to eyeball the pivot at high scale.

Add a knob that touches **only the scaled glyphs**, weighted so it's zero at rest:

```ts
pivot.y(() => BASE_Y + gc * (1 - sy) + (P.STRETCH_Y * (sy - 1)) / Math.max(0.001, P.MAX_Y));
//                                       └─ 0 when sy==1 (round), == STRETCH_Y at full stretch ─┘
```
`STRETCH_Y` recentres the fully-stretched glyph without moving round glyphs or surrounding text. Expose it as a slider (see `live-tuning.md`).

### Aligning synthetic glyphs to real ones, and centring the line

- **Optical vs box centre applies to the whole line too.** A flex-centred word sits low because flexbox centres its *box*. Shift the line up by `glyphCenterY(...)` so the *text* is optically centred in the frame.
- To line trailing/animated glyphs up with a static word's glyph, pin them at `glyphCentre + nudge` (so `nudge = 0` = aligned), not at `nudge` from the box centre.

## The kinetic-stretch "comet" (let's-goooo motif)

A run of glyphs that reveal, stretch tall as a wave passes through, and trail off. What actually worked:

- **One laid-out row of real glyphs.** Each animated glyph lives in a **fixed-width cell** (cell width = the pitch) so spacing never drifts; the glyph is `layout={false}` inside, free to scale/move.
- **Bind everything to ONE moving thing** (the world/camera `x`) read every frame — reveal, stretch, trail all derive from each glyph's screen position. Don't hand-orchestrate per-glyph timings.
- **Height grows, width stays ≈ constant.** Growing width with the stretch makes glyphs overlap and the stroke read thin. Keep `scaleX ≈ 1` (a small bounded bulge at most); only `scaleY` ramps.
- **Steep ramp that PLATEAUS.** `peak = pow(clamp01(i / (N - FULL_COUNT)), POW) * MAX` — early glyphs barely move, then it climbs hard and the **last `FULL_COUNT` all hit MAX** (a fat comet head, not a single spike).
- **The stretch HOLDS, it doesn't deflate.** A stretch gated to a band that grows *and* shrinks reads as a travelling "hill." Grow it in, then clamp — it stays stretched until it exits.
- **Tonal trail** = opacity rises on entry, holds full for its moment, then decays to a faint floor as it ages → fresh glyphs dark, old ones pale; a moving gradient that shows direction and speed.
- **Spread to de-pile.** When stretched footprints exceed the pitch, fan them apart by the *excess footprint* (remember stroke!), anchored on one end so the head stays put.

## Reveal-in-3D ("camera pulls back through the text")

The 2D half of the trick: start the text **huge** (e.g. `scale 5`, overflowing frame) and invisible, then `scale → 1` over the same easing/duration as the camera pull-back, popping opacity in ~15% through (the moment the camera "passes the plane"). **The canonical full recipe** — the signal-driven code, the 3D stack shrinking/straightening behind it, and the 3D→2D hand-off — lives in `canvas-commons-3d` → `references/kinetic-3d-typography.md` §"Pull-back THROUGH the text reveal". If you change the recipe, change it there.
