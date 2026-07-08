---
name: r3f-view-architecture
description: The single-persistent-canvas + drei View pattern for R3F sites - one Canvas that never unmounts, many DOM-tracked 3D viewports, tunnel-rat, SSR/mount guarding, and lazy-loading the WebGL layer. Use when composing 3D across a page/site, tracking 3D to DOM elements, building the persistent-canvas architecture, or the square-viewport pattern.
---

# R3F View Architecture (persistent canvas + drei View)

This is the core architecture of THIS project and the pattern behind award-tier R3F sites. General and stable across R3F/drei versions. Verify `View` against installed `@react-three/drei` (confirmed present) or drei.docs.pmnd.rs/portals/view.

## The rule: one Canvas, many Views
A site should mount ONE `<Canvas>` once, fixed and full-viewport, that never unmounts across navigation. Per-section 3D is rendered through drei `<View>` components that track DOM elements. Reasons:
- Browsers cap WebGL contexts (~8-16); one canvas is the only scalable choice.
- Separate canvases share no GPU data (textures, geometries).
- A persistent canvas survives route changes, which is what makes cross-page 3D transitions feel continuous.

## Shape (matches this project)
```tsx
// CanvasRoot.tsx — Layer 1, mounted once in RootLayout, never unmounts
import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'

export function CanvasRoot() {
  if (!useMounted()) return null           // client-only: keeps WebGL out of prerendered HTML
  return (
    <Canvas className="fixed inset-0 -z-10" eventSource={document.body} eventPrefix="client">
      <View.Port />                         {/* renders every tracked <View> in the DOM */}
    </Canvas>
  )
}
```
```tsx
// Anywhere in the DOM (Layer 2) — a viewport pinned to a DOM element
function SquareView({ track }: { track: RefObject<HTMLElement | null> }) {
  return (
    <View track={track as RefObject<HTMLElement>}>
      <ambientLight intensity={0.4} />
      {/* the square's media plane + light shader live here */}
    </View>
  )
}
```
Each `<View track={ref}>` reads its DOM element's position/size and scissors that region of the shared canvas — so 3D "lives inside" a `<div>` and scrolls/resizes with it. This is exactly the brand's square-container-viewport (`Generative ■ Haus`): a DOM anchor drives a `<View>` that plays video / runs the light shader.

## SSR / prerender safety (this project uses SSG)
WebGL needs `document`. Guard the canvas so it renders `null` on the server and mounts only on the client (the `useMounted` / `useSyncExternalStore` pattern in `CanvasRoot`). The content (Layer 2, real DOM) prerenders; the canvas hydrates in after. Never render Three elements on the server.

## Lazy-load the canvas
The three/R3F bundle is heavy (~300KB gzip). Load it AFTER the content shell paints so it stays off the critical path — `React.lazy` the CanvasRoot behind `<Suspense fallback={null}>` (already done in `RootLayout`). The canvas still mounts once and persists; only the fetch is deferred. See `r3f-performance` and the project's `bundle-dynamic-imports` policy.

## tunnel-rat (portal DOM-side React into the canvas, or vice versa)
When a deep component needs to inject 3D into the single canvas without prop-drilling, use `tunnel-rat` (separate install). Define a tunnel, render `<tunnel.In>` from anywhere in the tree and `<tunnel.Out>` inside the Canvas. drei's `<View>` covers most needs; reach for tunnel-rat only for dynamic, non-tracked injection.

## Guardrails (do not regress)
- One `<Canvas>`. Add Views, never canvases.
- All readable text stays in DOM (Layer 2), never rendered as WebGL geometry/texture — required for SEO/AI crawlers.
- Keep the canvas client-only and lazy.

## See also
`r3f-fundamentals`, `r3f-textures-video` (video into a View), `r3f-shaders` (the light shader), `r3f-performance`.
