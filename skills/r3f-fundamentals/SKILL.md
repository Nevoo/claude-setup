---
name: r3f-fundamentals
description: React Three Fiber core - Canvas, the render loop (useFrame), useThree, extend, JSX/TypeScript typing, refs, pointer events, and dispose. Use when setting up an R3F scene, wiring the frame loop, accessing Three.js internals, typing custom elements, or handling 3D events.
---

# React Three Fiber Fundamentals

General, idiom-first reference for modern R3F (v9, React 19). Not pinned to a patch version — these patterns are stable across releases. Verify any exact signature against the installed `@react-three/fiber` in `node_modules` or the official docs (r3f.docs.pmnd.rs). In this project the Canvas is handled by `src/canvas/CanvasRoot.tsx`; read that before adding 3D.

## Mental model
R3F is a React renderer for Three.js. You describe the scene as JSX; R3F reconciles it into a Three scene graph. Three classes become camelCase elements (`<mesh>`, `<boxGeometry>`, `<meshStandardMaterial>`). Constructor args go through `args={[...]}`. Nested properties use dashes (`position-x`, `shadow-mapSize-width`).

## Canvas
The root that creates renderer, scene, camera, and the loop.

```tsx
<Canvas
  camera={{ position: [0, 0, 5], fov: 50 }}
  gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
  dpr={[1, 2]}                 // clamp device pixel ratio (perf)
  frameloop="always"          // "always" | "demand" | "never" (see r3f-performance)
  onCreated={({ gl, scene, camera }) => {}}
>
  {/* scene graph */}
</Canvas>
```

Project note: there is exactly ONE `<Canvas>`, mounted once in `CanvasRoot` and never unmounted. Never add a second Canvas — browsers cap WebGL contexts and canvases share no GPU state. Add drei `<View>` viewports instead (see `r3f-view-architecture`).

## The render loop: useFrame
Runs every frame. Mutate refs here; do NOT setState per frame.

```tsx
const ref = useRef<THREE.Mesh>(null!)
useFrame((state, delta) => {
  ref.current.rotation.y += delta            // delta = seconds since last frame (frame-rate independent)
  ref.current.position.y = Math.sin(state.clock.elapsedTime)
}, /* priority */ 0)
```

- `delta` keeps motion frame-rate independent — prefer it over fixed increments.
- Priority orders callbacks; a positive priority means you take over rendering (`state.gl.render(...)`).
- Bail early when idle (`if (!active) return`) to save cycles.

## useThree: access internals
```tsx
const camera = useThree((s) => s.camera)     // selector = subscribe to one slice (preferred)
const size = useThree((s) => s.size)         // pixels
const viewport = useThree((s) => s.viewport) // three units
const invalidate = useThree((s) => s.invalidate) // request a frame in frameloop="demand"
```
Calling `useThree()` with no selector subscribes to everything and re-renders on any change — use selectors.

## Refs, not state, for transient values
Reading or animating `ref.current` in the loop avoids re-renders. This is the R3F equivalent of `rerender-use-ref-transient-values` from the project's review policy. React 19: `ref` is a plain prop — no `forwardRef` needed for custom components.

## extend + custom elements + TypeScript
Register non-core Three classes to use them as JSX, and type them via `ThreeElements` module augmentation (modern R3F — NOT the old global `JSX.IntrinsicElements`).

```tsx
import { extend, type ThreeElement } from '@react-three/fiber'
import { OrbitControls } from 'three-stdlib'

extend({ OrbitControls })

declare module '@react-three/fiber' {
  interface ThreeElements {
    orbitControls: ThreeElement<typeof OrbitControls>
  }
}
```
drei's `shaderMaterial` returns a class you `extend(...)` the same way (see `r3f-shaders`).

## Pointer events
R3F raycasts and gives React-style events on meshes. Keep text/UI in the DOM (project rule) — use 3D events only for genuinely 3D interactions.

```tsx
<mesh
  onPointerOver={(e) => { e.stopPropagation(); setHover(true) }}
  onPointerOut={() => setHover(false)}
  onClick={(e) => { e.stopPropagation(); /* e.point, e.object, e.uv, e.distance */ }}
/>
```
`e.stopPropagation()` stops it bubbling through overlapping meshes. `onPointerMissed` on the Canvas fires for background clicks.

## Dispose
R3F auto-disposes geometries/materials/textures when they unmount. Objects you create imperatively (in `useMemo`/effects) you dispose yourself. `<primitive object={...} />` does NOT dispose the object you passed in.

## See also
`r3f-view-architecture` (persistent canvas + View), `r3f-materials`, `r3f-shaders`, `r3f-animation-motion`, `r3f-performance`.
