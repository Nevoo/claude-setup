---
name: r3f-textures-video
description: Textures and video in R3F - useTexture, useVideoTexture, color space, wrapping/repeat/anisotropy, Suspense and preloading, and mapping a muted background loop onto a plane or into a shader. Use when loading image textures, playing video in a 3D surface, configuring texture color/repeat, or the background-video-in-square pattern.
---

# R3F Textures & Video

General patterns; `useTexture` and `useVideoTexture` are confirmed in the installed `@react-three/drei`. Video-into-a-surface is core to this project's square viewport (a muted loop plays inside the brand's square container, optionally distorted by a shader).

## Image textures: useTexture
```tsx
import { useTexture } from '@react-three/drei'

function Surface() {
  const props = useTexture({
    map: '/tex/albedo.jpg',
    normalMap: '/tex/normal.jpg',
    roughnessMap: '/tex/rough.jpg',
  })
  return <meshStandardMaterial {...props} />
}
```
`useTexture` suspends until loaded (wrap in `<Suspense>`), and sets the albedo `map` to sRGB automatically. Data maps (normal/roughness/metalness/AO) stay linear — correct by default. Preload with `useTexture.preload('/tex/albedo.jpg')` at module scope to warm the cache.

## Texture config
```tsx
tex.wrapS = tex.wrapT = THREE.RepeatWrapping
tex.repeat.set(4, 4)
tex.anisotropy = gl.capabilities.getMaxAnisotropy()   // crisp at grazing angles
tex.colorSpace = THREE.SRGBColorSpace                  // only for color/albedo maps
tex.needsUpdate = true                                 // after mutating an existing texture
```

## Video texture: useVideoTexture (the square-viewport loop)
Verified signature (drei): `useVideoTexture(srcOrSrcObject, { unsuspend, start, crossOrigin, muted, loop, playsInline, hls, onVideoFrame, ...videoProps })`.

```tsx
import { useVideoTexture } from '@react-three/drei'

function VideoPlane({ src }: { src: string }) {
  const texture = useVideoTexture(src, {
    muted: true,        // REQUIRED for autoplay (esp. iOS)
    loop: true,
    playsInline: true,  // REQUIRED for iOS inline autoplay
    start: true,
    crossOrigin: 'anonymous',
  })
  return (
    <mesh>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}
```
Notes:
- `meshBasicMaterial` + `toneMapped={false}` shows the footage as-is (unlit, un-dimmed). Use a `meshStandardMaterial` only if you want scene lighting to affect the video.
- For a shader treatment (tint, distortion, chiaroscuro), pass `texture` as a `sampler2D` uniform instead and sample it in GLSL (see `r3f-shaders`).
- Match plane aspect to the video, or handle UV cover-fit in the shader, to avoid stretching.

## Self-hosted loops vs streaming (project rule)
Short, muted BACKGROUND loops are self-hosted, optimized files (WebM/AV1 + MP4) — feed the file URL to `useVideoTexture`. Longer showreels with audio go through Mux/HLS (drei's `useVideoTexture` accepts an `hls` config for HLS sources). Keep loops short and compressed; they run on the GPU as a live texture every frame.

## Environment/HDRI textures
For reflections use drei `<Environment>` rather than loading an HDRI by hand (see `r3f-lighting-environment`).

## See also
`r3f-shaders` (video-driven shaders), `r3f-materials` (color space), `r3f-view-architecture` (video inside a View), `r3f-performance`.
