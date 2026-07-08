---
name: r3f-animation-motion
description: Animation and motion in R3F - useFrame idioms, driving R3F from GSAP (Flip/ScrollTrigger) and Lenis on a single ticker, camera choreography, scroll-linked uniforms, drei useAnimations for GLTF clips, and spring easing. Use when animating 3D, syncing WebGL to scroll or a GSAP timeline, choreographing the camera, or the entry-sequence motion.
---

# R3F Animation & Motion

General patterns for driving 3D. This project's motion system is GSAP (Flip + ScrollTrigger) + Lenis, so the key skill is making R3F share ONE loop with them rather than fighting over the frame.

## Two sources of motion, one loop
- `useFrame` — continuous, per-frame motion inside the canvas (rotations, shader `uTime`, idle drift).
- GSAP/Lenis — timeline- and scroll-driven motion for the whole page, including the WebGL layer.

Do NOT run GSAP's ticker and R3F's loop independently and also run Lenis' own rAF — that's three loops. Drive Lenis from the GSAP ticker (the project already does this in `src/motion/SmoothScroll.tsx`), and read scroll/timeline values inside `useFrame` or write to refs GSAP animates.

## useFrame idioms
```tsx
useFrame((state, delta) => {
  ref.current.rotation.y += delta * 0.2                 // frame-rate independent
  mat.current.uTime = state.clock.elapsedTime           // advance shader time
  // damp toward a target instead of snapping:
  ref.current.position.x = THREE.MathUtils.damp(ref.current.position.x, targetX, 4, delta)
})
```
`MathUtils.damp`/`lerp` give framerate-independent smoothing — prefer over hardcoded lerp factors.

## Driving R3F from a GSAP timeline
Animate a plain object or a ref's properties with GSAP; read them in `useFrame`, or let GSAP write directly to the Three object (it can tween `mesh.position`, `material.uniforms.uProgress.value`, `camera.position`, etc.).
```tsx
// e.g. the entry sequence: GSAP Flip morphs the DOM square; a paired timeline moves the camera / a uniform
gsap.to(materialRef.current, { uProgress: 1, duration: 1.2, ease: 'power3.inOut' })
gsap.to(camera.position, { z: 3, ease: 'none', scrollTrigger: { trigger: el, scrub: true } })
```
Call `invalidate()` after GSAP updates when the canvas is `frameloop="demand"` so the change renders (see `r3f-performance`).

## Scroll-linked 3D
Use ScrollTrigger (already registered in `src/motion/gsap.ts`) with `scrub: true` to bind scroll progress to camera moves, uniform values, or `<View>` transitions. For the reel/browse mechanic, map scroll to the media index / camera dolly. Keep the scroll source consistent with Lenis so native and smooth scroll agree.

## Camera choreography
Animate `camera.position` / `camera.lookAt` (or a target the camera damps toward). For cuts between framings, tween a target object and damp the camera to it in `useFrame` for a filmic ease. drei `CameraControls` supports imperative `setLookAt(...)` with built-in smoothing if you need controls plus scripted moves.

## GLTF clips (if models arrive)
```tsx
const { scene, animations } = useGLTF('/model.glb')
const { actions } = useAnimations(animations, ref)
useEffect(() => { actions['Idle']?.reset().fadeIn(0.3).play() }, [actions])
```

## Reduced motion
Honor `prefers-reduced-motion` (the project's SmoothScroll already checks it) — gate ambient `useFrame` motion and scroll scrubbing so the experience degrades gracefully.

## See also
`r3f-fundamentals` (useFrame, refs), `r3f-view-architecture` (View transitions), `r3f-shaders` (uTime), `r3f-performance` (frameloop/invalidate).
