# The three.js ↔ Canvas Commons bridge node

The whole 3D capability is one custom node: `assets/Three.ts`, a `Layout` subclass that owns an offscreen `WebGLRenderer` and blits its output into the 2D canvas each frame.

## How a frame flows

Canvas Commons calls every node's `draw(context)` once per rendered frame. The `Three` node's `draw`:

1. Reads its own box `size()` and the `quality`, `scene`, `camera`, `background` signals.
2. Sets the renderer size to `width*quality × height*quality` (supersample) with `updateStyle=false` (the canvas is detached; we don't want CSS sizing).
3. Locks the camera aspect/extents to the node box (`PerspectiveCamera.aspect = w/h`, or the ortho frustum from `zoom`), and `updateProjectionMatrix()`.
4. `renderer.render(scene, camera)` → pixels land in the renderer's detached `domElement`.
5. `context.drawImage(renderer.domElement, …)` blits that buffer into the 2D canvas, **origin-centred** (`-width/2, -height/2`), downsampling from the supersampled source with `imageSmoothingQuality = 'high'`.
6. `super.draw(context)` draws the node's **children on top** — so 2D overlays nested inside `<Three>` composite over the 3D.

Because it's a `Layout`, the 3D viewport behaves like any 2D node: give it `width`/`height`, `position`, `scale`, `opacity`, animate them, nest children.

## Mounting it

```tsx
view.add(<Rect size={[1920, 1080]} fill="#FFFFFF" />); // 2D background under the 3D
view.add(
  <Three scene={scene} camera={camera} quality={2} width={1920} height={1080} />,
);
// 2D overlays added AFTER (or as children) render above the 3D blit.
```

`scene` and `camera` are plain three.js objects you construct in the generator (`new THREE.Scene()`, `new THREE.PerspectiveCamera(...)`). The node just renders whatever you hand it; you mutate the scene from `apply()`.

## Key constructor choices (and why)

- `alpha: true` + `setClearColor(0x000000, 0)` → the WebGL buffer is **transparent**, so it composites over the 2D content beneath it. Set the `background` prop only if you want an opaque 3D backdrop.
- `premultipliedAlpha: true` → matches the 2D canvas blend so transparent edges don't fringe.
- `antialias: true` + `quality: 2` supersample → two layers of smoothing; text edges stay crisp.
- `setPixelRatio(1)` → `quality` is the only supersample knob; don't double-count device pixel ratio.

## Sizing & supersample

The blit source is `width*quality`; the destination is `width`. `quality: 2` means the 3D is rendered at 2× and downsampled — the cheap, reliable way to kill aliasing on tilted gradient cards and baked text. `quality: 1` looks soft/jaggy; `quality: 3+` rarely pays for itself. **Default 2.**

The node box defines the projection aspect every frame, so if you animate the `Three` node's own `size`/`scale`, the camera reframes correctly with it.

## Gotchas

- **One renderer per `Three` node.** It's created in the constructor and reused; `dispose()` on teardown. Don't create renderers in `draw()`.
- **No `@computed` in `draw`** — this port recomputes config inline each frame for simplicity; that's fine, `draw` is already per-frame.
- **`three` must resolve from the project's node_modules.** In this project three 0.169 was copied in, dependency-free. Any recent three works.
- **Headless rendering needs GPU flags** (SwiftShader) — see `references/headless-webgl.md`, or the buffer is blank.
- The node draws nothing until `width>0 && height>0 && scene && camera` — if your 3D is invisible, check those four first.
