---
name: r3f-lighting-environment
description: Lighting and image-based lighting in R3F - light types, shadows, drei Environment/HDRI, tone mapping, and chiaroscuro/high-contrast setups. Use when lighting a scene, configuring shadows, adding reflections/IBL, or building a dark cinematic look.
---

# R3F Lighting & Environment

General, stable patterns. drei `Environment` is confirmed in the installed build. This project's identity is chiaroscuro ("Architecture of Light" — calibrated highlights against deep shadow), so lighting is a first-class design tool here, not an afterthought.

## Light types
```tsx
<ambientLight intensity={0.15} />                         {/* flat fill; keep LOW for chiaroscuro */}
<directionalLight position={[4, 6, 3]} intensity={3} castShadow />  {/* sun; sharp shadows */}
<spotLight position={[3, 5, 2]} angle={0.3} penumbra={0.8} intensity={40} castShadow />
<pointLight position={[0, 2, 0]} intensity={20} distance={10} decay={2} />
```
Modern three uses physically-based light units, so intensities are often larger than legacy examples. `directionalLight` is a parallel "sun"; `spotLight` (with `penumbra`) sculpts a pool of light — ideal for isolating a subject the way the brand isolates product from background.

## Shadows
Enable on the Canvas (`shadows`), then per-light `castShadow` and per-mesh `castShadow`/`receiveShadow`. Tune the shadow camera to the scene bounds and raise map size for crisp edges:
```tsx
<directionalLight castShadow shadow-mapSize={[2048, 2048]}
  shadow-camera-near={1} shadow-camera-far={20}
  shadow-camera-top={5} shadow-camera-bottom={-5} shadow-camera-left={-5} shadow-camera-right={5} />
```
For static scenes, `BakeShadows` (drei) freezes shadow maps for perf (see `r3f-performance`).

## Environment / image-based lighting (IBL)
The single biggest quality lever for metallic/reflective surfaces. drei `<Environment>` provides reflections and soft ambient from an HDRI, without adding a visible background unless you ask.
```tsx
import { Environment } from '@react-three/drei'
<Environment preset="studio" environmentIntensity={0.6} />         {/* preset HDRI */}
<Environment files="/hdri/night.hdr" background={false} blur={0.4} />  {/* custom, hidden bg */}
```
`environmentIntensity` (and per-material `envMapIntensity`) controls reflection strength. For a clinical dark look, a low-key studio or custom dark HDRI gives believable metal reflections while the scene stays near-black. Metallic materials render black WITHOUT an environment — always pair `metalness` with an Environment.

## Tone mapping and exposure
The renderer applies tone mapping (ACESFilmic by default) which shapes highlight rolloff — essential for a filmic chiaroscuro. Control global exposure via the renderer (`gl.toneMappingExposure`) or shape it in postprocessing. Materials that must render an exact color use `toneMapped={false}` (see `r3f-materials`).

## Chiaroscuro recipe (project-specific)
1. Very low `ambientLight` (or none) + a dark/low-key `Environment` for base reflections.
2. One strong keyed `directionalLight` or `spotLight` with penumbra to carve the highlight.
3. Metallic/low-roughness surfaces so the light reads as a sculpted edge.
4. Filmic tone mapping + a subtle vignette/grain in postprocessing.

## See also
`r3f-materials`, `r3f-shaders` (custom light falloff), `r3f-postprocessing` (grain, vignette, tone), `r3f-performance` (BakeShadows).
