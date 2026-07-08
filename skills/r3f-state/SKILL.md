---
name: r3f-state
description: State management for R3F with zustand - a store shared between DOM (Layer 2) and the persistent canvas (Layer 1), transient getState/subscribe reads inside useFrame (no re-renders), selectors + useShallow, and when to reach for a store vs a ref. Use when sharing state between HTML UI and 3D, driving the scene from DOM controls (or vice versa), avoiding re-render churn, or wiring global 3D state (active section, quality tier, scroll progress).
---

# R3F State (zustand)

zustand is the pmndrs state library and the idiomatic choice for R3F. It solves the two problems `useState`/Context can't: **sharing state across the DOM↔canvas boundary without prop-drilling**, and **reading/writing state every frame without re-rendering React**. Grounded in the installed `zustand` v5 (verify with `require('zustand/package.json').version`); v5 needs React 18+ and works with this project's React 19.

## When to use a store vs a ref
This extends the `r3f-fundamentals` rule ("refs, not state, for transient values"):
- **Per-frame, transient values** (a mesh's position, a shader uniform, raw scroll) → a **ref**, mutated in `useFrame`. Never a React state setter at 60fps.
- **Reactive app state that UI and 3D both care about** (active section, menu open, quality tier, "reduced motion", a hovered id) → a **store**. DOM writes it, the canvas reads it, or the reverse.
- Need a frame-rate value in the canvas that also originates from React state? Put it in the store and read it **transiently** (below) — you get the shared value without the re-render.

## Create a store (typed, v5)
The curried `create<T>()(...)` form is required for correct TypeScript inference in v5.
```ts
// stores/scene.ts
import { create } from 'zustand'

interface SceneState {
  activeSection: string | null
  quality: 'high' | 'low'
  scroll: number                          // 0..1, written every frame — read transiently
  setActiveSection: (id: string | null) => void
  setQuality: (q: SceneState['quality']) => void
  setScroll: (v: number) => void
}

export const useScene = create<SceneState>()((set) => ({
  activeSection: null,
  quality: 'high',
  scroll: 0,
  setActiveSection: (activeSection) => set({ activeSection }),
  setQuality: (quality) => set({ quality }),
  setScroll: (scroll) => set({ scroll }),      // do NOT subscribe to this reactively
}))
```
The store is a module singleton — import `useScene` anywhere in the DOM tree OR inside the Canvas and it's the same instance. That single import IS the DOM↔canvas bridge; no provider, no tunnel needed for plain data.

## The transient pattern (the R3F reason to use zustand)
Reading store values with the hook subscribes the component and re-renders on change — fatal for per-frame values. Inside `useFrame`, read the **current** value imperatively via `getState()` instead. Zero re-renders:
```tsx
function Rig() {
  useFrame((state) => {
    const { scroll, quality } = useScene.getState()   // live value, no subscription
    state.camera.position.y = -scroll * 10
  })
  return null
}
```
Write from a DOM handler the same way — no component re-renders just to push a value into the scene:
```ts
useScene.setState({ scroll: lenis.progress })         // e.g. from the Lenis/GSAP tick
```
For "run a side-effect when a specific slice changes" (outside the frame loop), subscribe imperatively and clean up:
```tsx
useEffect(() => useScene.subscribe((s) => {           // returns the unsubscribe fn
  document.body.dataset.section = s.activeSection ?? ''
}), [])
```
Want the previous value or to fire only when one slice changes? Add the `subscribeWithSelector` middleware:
```ts
import { subscribeWithSelector } from 'zustand/middleware'
export const useScene = create<SceneState>()(subscribeWithSelector((set) => ({ /* ... */ })))
// store.subscribe((s) => s.activeSection, (id, prev) => { ... })
```

## Reactive reads (when a re-render is what you want)
For DOM UI or 3D components that *should* re-render on change, select the narrowest slice — a selector returning a primitive only re-renders when that primitive changes:
```tsx
const quality = useScene((s) => s.quality)            // re-renders only when quality flips
```
Selecting an object/array creates a new reference each call and re-renders every time. Use `useShallow` (v5 removed the old equality-fn second argument to the hook):
```tsx
import { useShallow } from 'zustand/react/shallow'
const { activeSection, quality } = useScene(
  useShallow((s) => ({ activeSection: s.activeSection, quality: s.quality })),
)
```

## Fits this project's architecture
- **DOM (Layer 2) ↔ canvas (Layer 1):** DOM controls call `setState`; `<View>` contents read via `getState()` in `useFrame` or a narrow selector. This is the data counterpart to the DOM-tracked `<View>` geometry in `r3f-view-architecture` — reach for `tunnel-rat` only to inject *JSX/3D*, use the store for *values*.
- **One animation loop:** feed Lenis/GSAP output into the store (`setScroll`) on the existing single ticker (see `r3f-animation-motion`); the canvas reads it transiently. Don't stand up a second RAF.
- **`frameloop="demand"`:** if the canvas is demand-driven (see `r3f-performance`), call `invalidate()` after a `setState` that must repaint — a store write alone won't schedule a frame.
- **SSG / client-only canvas:** the store is a plain client singleton, fine with the SSG setup since the canvas is client-only. Store **plain serializable data**, not Three objects (meshes, materials, geometries) — keep those in refs; a store full of GPU objects leaks and complicates disposal (`r3f-fundamentals`).

## Guardrails (do not regress)
- Never call `setState` from a store subscription that the same slice feeds — infinite loop.
- Never read store values with the hook inside `useFrame`; that's `getState()`'s job.
- One store per concern (scene, ui, media) beats one mega-store — smaller selectors, fewer wasted renders.
- Keep Three.js instances out of the store; store data, animate refs.

## See also
`r3f-fundamentals` (refs vs state, dispose), `r3f-view-architecture` (the DOM↔canvas boundary, tunnel-rat), `r3f-animation-motion` (single loop, Lenis/GSAP), `r3f-performance` (demand frameloop, invalidate).
