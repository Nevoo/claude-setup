---
name: r3f-performance
description: R3F performance - lazy-loading the canvas, frameloop demand + invalidate, instancing, geometry/material reuse, disposal, DPR clamping, AdaptiveDpr/PerformanceMonitor, BakeShadows, and keeping the content layer light. Use when a 3D scene is heavy, janky, draining battery, or bloating the bundle.
---

# R3F Performance

General, stable optimization patterns. These reinforce the project's `CLAUDE.md` review policy and the Vercel React best-practices skill (`bundle-dynamic-imports`, `rerender-use-ref-transient-values`). drei helpers referenced (`PerformanceMonitor`, `AdaptiveDpr`, `BakeShadows`, `Instances`) are confirmed in the installed build.

## Bundle: lazy-load the WebGL layer (highest impact)
The three/R3F stack is ~300KB gzip. Load it AFTER the content shell so it's off the critical path — `React.lazy` the canvas behind `<Suspense fallback={null}>` (done in `RootLayout`). The persistent canvas still mounts once; only the fetch defers. Never let a content-only route pull three eagerly.

## Frame loop: render on demand
If the scene is often idle, set `frameloop="demand"` on the Canvas and call `invalidate()` when something changes (after a GSAP tween, a state change, a pointer move). This drops idle GPU/CPU to near zero.
- Caveat: continuous `useFrame` animation and post-processing both force `"always"`. Use `"demand"` for mostly-static scenes; use `"always"` when the loop genuinely runs every frame.

## Don't re-render React per frame
Animate `ref.current` in `useFrame`; never `setState` at 60fps. Isolate animated objects into small components so a moving mesh doesn't re-render its parents. Pass primitive/memoized props.

## Instancing (many similar objects)
Render thousands of meshes in one draw call.
```tsx
import { Instances, Instance } from '@react-three/drei'
<Instances limit={1000}>
  <boxGeometry /><meshStandardMaterial />
  {items.map((it) => <Instance key={it.id} position={it.pos} color={it.color} />)}
</Instances>
```
Or a raw `THREE.InstancedMesh` with per-instance matrices for full control (particles, reels).

## Reuse geometries/materials
Create shared geometry/material once (module scope or `useMemo`) and reuse across meshes instead of recreating per render. Recreating a material each frame leaks and stalls.

## Disposal and leaks
R3F auto-disposes on unmount. Objects made imperatively (in effects/`useMemo`), and anything passed to `<primitive>`, you dispose yourself. Watch shader materials and render targets especially.

## DPR and adaptivity
Clamp pixel ratio: `dpr={[1, 2]}` (2 is plenty; 3 melts phones). drei helpers:
- `<AdaptiveDpr pixelated />` — drops resolution while moving, restores when still.
- `<PerformanceMonitor onDecline={...}>` — react to sustained frame drops (lower dpr, cut effects).
- `<BakeShadows />` — freeze shadow maps for static lighting.

## Textures and video
Compress textures; cap dimensions to what's on screen. Video textures upload to the GPU every frame — keep loops short/small and only render Views that are in the viewport. drei `<View>` already scissors offscreen viewports; still, gate expensive Views on visibility.

## Measure, then optimize
Use `r3f-perf` (drei-adjacent) or the `PerformanceMonitor`, plus Chrome DevTools Performance + Spector.js for GPU. Don't guess — the usual culprits are overdraw (transparency), too-high DPR, uncompressed textures, and post-processing on mobile.

## Mobile / Safari
Test on a real device: iOS caps memory and is strict about WebGL context loss. Lower dpr and effect budget on small screens; verify the persistent canvas survives orientation changes.

## See also
`r3f-view-architecture` (lazy/persistent canvas), `r3f-postprocessing` (render cost), `r3f-animation-motion` (invalidate), `r3f-textures-video`.
