---
name: r3f-materials
description: Three.js/R3F materials - MeshStandardMaterial, MeshPhysicalMaterial, Basic, transparency, PBR, color space, toneMapped, and drei material helpers. Use when choosing or configuring a material, setting up PBR surfaces, transparency/blending, or emissive/metalness looks.
---

# R3F Materials

General reference; material APIs are stable Three.js surface. Verify drei material helpers against the installed `@react-three/drei`.

## Choosing a material
- `meshBasicMaterial` — unlit, flat color/texture. Ignores lights. Use for UI-ish planes, video screens where you don't want lighting to affect the image, or debugging.
- `meshStandardMaterial` — PBR (metalness/roughness). The default workhorse. Reacts to lights and Environment.
- `meshPhysicalMaterial` — Standard + clearcoat, transmission (glass), iridescence, sheen. For premium surfaces (car paint, glass) — heavier.
- `meshLambertMaterial` / `meshPhongMaterial` — cheaper legacy lighting models; rarely needed over Standard.
- drei `MeshTransmissionMaterial` — high-quality glass/refraction beyond physical transmission.

## PBR basics
```tsx
<meshStandardMaterial
  color="#212121"
  metalness={0.9}
  roughness={0.25}
  envMapIntensity={1}     // how strongly the Environment reflects (see r3f-lighting-environment)
  emissive="#ff2700"
  emissiveIntensity={0.4}
/>
```
Metalness near 1 + low roughness = mirror-like; needs an Environment to reflect or it looks black. This matters for the brand's clinical/automotive chiaroscuro look — pair metallic surfaces with an HDRI environment.

## Color space and tone mapping (get this right or colors look washed/dull)
- Color inputs (`color`, `emissive`) are treated as sRGB. Color/albedo textures must be `SRGBColorSpace`; data textures (normal, roughness, metalness, AO) must be `NoColorSpace`/linear. drei's `useTexture` sets albedo correctly; set others manually if needed (see `r3f-textures-video`).
- `toneMapped={false}` on a material opts it out of the renderer's tone mapping — use it when a color must render exactly (e.g. a pure brand `#ff2700` accent, or a video screen that must not be dimmed).
- Renderer tone mapping (ACESFilmic by default in modern three) shapes the whole look; tune it in postprocessing (`r3f-postprocessing`).

## Transparency
```tsx
<meshStandardMaterial transparent opacity={0.5} depthWrite={false} />
```
`transparent` enables alpha blending; `depthWrite={false}` avoids sorting artifacts for overlapping transparent surfaces. `side={THREE.DoubleSide}` renders back faces (needed for planes viewed from behind, open shells).

## Reusing / mutating materials
Assign via ref and mutate in `useFrame` (e.g. `materialRef.current.opacity = x`) rather than recreating props each frame. For many identical materials, share one instance (see instancing in `r3f-performance`).

## When you outgrow built-ins
For custom looks (gradients, fresnel, dissolve, video-driven distortion, the "Architecture of Light" chiaroscuro), move to a shader material or extend a built-in with `onBeforeCompile` — see `r3f-shaders`.

## See also
`r3f-shaders`, `r3f-lighting-environment`, `r3f-textures-video`.
