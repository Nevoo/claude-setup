---
name: canvas-commons-3d
description: 3D motion graphics INSIDE Canvas Commons / Motion Canvas via a three.js bridge — render a real three.js scene into the 2D canvas and drive it from Canvas Commons signals. Use when building 3D-native kinetic typography (stacked gradient cards/pills, depth-pop entrances, perspective-camera punches, pull-back reveals), compositing 3D content under/over 2D overlays in one scene, baking text+gradients into three.js textures, animating a PerspectiveCamera/OrthographicCamera from CC signals, or rendering WebGL headlessly. Complements `canvas-commons-motion` (which is 2D/general). Triggers on "three.js in motion canvas", "3D text", "3D kinetic typography", "perspective camera", "depth pop", "camera punch", "WebGLRenderer", "CanvasTexture", "render three into canvas commons", "3D card stack", "pull back to reveal", "headless webgl", "swiftshader", "3D motion graphics", "z-depth", "PlaneGeometry text", or when a frame shows 3D-looking type/cards in a Canvas Commons render.
---

# 3D motion graphics in Canvas Commons (three.js bridge)

How to do **real 3D** inside a Canvas Commons scene: a three.js `Scene` rendered offscreen and blitted into the 2D canvas, with every 3D object driven by Canvas Commons signals. This is what gives perspective depth, true camera punches, and "pull back through the text" reveals that a flat 2D zoom can't fake.

This skill is the 3D companion to `canvas-commons-motion`. The motion *discipline* (named bezier curves, master signals, continuous-over-cut, "build the human a live panel") still applies — read that skill for easing and tuning. This one is about the **3D plumbing and the 3D-native motifs**.

## The architecture in one breath

A custom `Three` node (a `Layout` subclass, in `assets/Three.ts`) owns an **offscreen `WebGLRenderer`**. In its `draw(context)` it renders the three.js scene into the renderer's detached canvas, then `context.drawImage()`s that buffer into Canvas Commons' 2D canvas, sized to the node's box. Because it's a `Layout`, the 3D viewport is a **first-class 2D node** — fade/scale/position it, and nest 2D overlays as children (they draw on top via `super.draw()`).

You never tween three.js objects directly. You create Canvas Commons **signals** (`camX`, `camY`, `camZ`, `appear[i]`, …), tween *those* with named curves, and an `apply()` function — subscribed to `onBeginRender` — copies their current values onto the three.js camera/meshes every frame. **CC signals are the single source of truth; three.js is just the renderer.**

```ts
const apply = () => {
  camera.position.set(camX(), camY(), camZ());
  camera.lookAt(tgtX(), tgtY(), tgtZ());
  group.rotation.y = rotY();
  group.scale.setScalar(scale());
  WORDS.forEach((wd, i) => {
    const a = appear[i]();                       // 0→1 entrance signal
    meshes[i].material.opacity = a;
    meshes[i].position.z = wd.z - Z_TRAVEL * (1 - a); // depth-pop: starts back, rushes to rest
  });
};
useScene().lifecycleEvents.onBeginRender.subscribe(apply);
// …later, in the generator timeline:
yield* all(camZ(allZ, 1.1, RAMP), appear[0](1, 0.34, OUT));  // tween the SIGNALS, not three
```

## The cardinal rules

1. **Drive three.js from CC signals via an `apply()` on `onBeginRender` — never `yield*` a three.js property.** All timing, easing, and the editor timeline live in Canvas Commons.
2. **One `apply()` reads every signal and writes every object, once per frame.** Don't scatter per-object subscriptions.
3. **The `Three` node's `quality` is a supersample factor — keep it at 2** for crisp text/edges (renders the WebGL buffer at 2× the node box, downsamples on blit).
4. **Bake text into a `CanvasTexture` at a LARGE font size, with mipmaps + anisotropy, and repaint on `document.fonts.ready`.** The first paint may use the fallback face. See `references/textures-and-depth.md`.
5. **Position the camera by world units, frame by `distFor(height, fillFraction)`.** Don't hand-pick Z — compute the distance that makes a world-height object fill a chosen fraction of frame. See `references/camera-rig.md`.
6. **Animate `camera.position` AND the `lookAt` target together** (two signal triples). Moving only one rotates/skews; moving both translates the view cleanly.
7. **For flat cards that should layer like stickers, use `renderOrder` + `depthTest:false`. For true 3D overlap, leave depth on.** Pick deliberately — see `references/textures-and-depth.md`.
8. **Headless WebGL needs SwiftShader flags** on the Chrome launch, or three renders nothing. See `references/headless-webgl.md`.

## When to read what

| Question | Read |
|---|---|
| How does the bridge node work? Sizing, supersample, transparent alpha, 2D overlays on top? | `references/three-bridge.md` |
| How do I frame/punch/pull-back a PerspectiveCamera? `distFor`? position vs lookAt? the `apply()` pattern? | `references/camera-rig.md` |
| Baking text+gradient to a texture, crisp scaling, fonts.ready, depth-pop, renderOrder vs depthTest, 2D/3D compositing | `references/textures-and-depth.md` |
| The 3D-native motifs: stacked gradient cards, depth-pop entrance, perspective punch, pull-back-through-text reveal, playful tilts/pops | `references/kinetic-3d-typography.md` |
| Rendering WebGL headlessly (CI / no-GPU), SwiftShader flags, fonts before frame 0 | `references/headless-webgl.md` |
| Easing curves, master-signal discipline, tuning by live panel | the **`canvas-commons-motion`** skill |

## Drop-in assets

- `assets/Three.ts` — the bridge node (offscreen `WebGLRenderer` → blit). Copy as-is; needs `three` in node_modules.
- `assets/makeLabelTexture.ts` — bake a gradient text label / pill into a `CanvasTexture` (crisp, font-ready aware).

## Reviewing a 3D Canvas Commons scene

1. **Is anything tweening a three.js property directly?** Move it to a CC signal + `apply()`. The editor timeline must own the motion.
2. **Is the camera framed by a magic Z number?** Replace with `distFor(worldHeight, fill)` so reframing is intent-driven.
3. **Does a camera move change only position OR only target?** Unless you *want* a swing, move both so the view translates.
4. **Is the text blurry / shimmering when small?** quality < 2, no mipmaps, or baked at too small a font. See `references/textures-and-depth.md`.
5. **Do flat cards z-fight or sort wrong?** Decide sticker-layering (`renderOrder` + `depthTest:false`) vs real depth, and be consistent.
6. **Does a 2D reveal want to feel like it's emerging from depth?** Don't drop it in 2D — scale it from huge → 1 over a real camera pull-back. See `references/kinetic-3d-typography.md`.
7. **Renders blank/black headless?** Missing SwiftShader flags or you didn't wait for `document.fonts.ready` before frame 0.
