---
name: r3f-postprocessing
description: Post-processing effects in R3F via @react-three/postprocessing - EffectComposer, Bloom, Vignette, Noise/grain, ChromaticAberration, DepthOfField, SMAA, tone mapping, and selective effects. Use when adding a full-screen filmic grade, glow, grain, vignette, or DoF to a 3D scene.
---

# R3F Post-processing

General patterns for `@react-three/postprocessing` (wraps the `postprocessing` library). NOTE: this package is NOT installed yet in the project — add it when you build the filmic grade: `npm i @react-three/postprocessing postprocessing`. It's the layer that turns a correct scene into the brand's cinematic look (grain, vignette, subtle glow).

## EffectComposer
Replaces the default render with a composed pass chain. Effects are combined efficiently (merged into as few passes as possible).
```tsx
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration, SMAA } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

<EffectComposer multisampling={0}>   {/* use SMAA instead of MSAA for effect chains */}
  <Bloom intensity={0.4} luminanceThreshold={0.85} luminanceSmoothing={0.2} mipmapBlur />
  <Vignette eskil={false} offset={0.3} darkness={0.8} />
  <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.06} />   {/* film grain */}
  <ChromaticAberration offset={[0.0006, 0.0006]} />
  <SMAA />
</EffectComposer>
```

## Effects that fit this brand
- **Bloom** — restrained glow on the sculpted highlights. Keep `luminanceThreshold` high so only the brightest edges bloom (chiaroscuro, not haze).
- **Vignette** — pulls focus, darkens edges. Core to the cinematic frame.
- **Noise / grain** — subtle film grain over the near-black backgrounds. Low opacity, `SOFT_LIGHT` or `OVERLAY` blend.
- **ChromaticAberration** — a whisper of lens fringing on transitions. Overdone it screams "shader demo"; keep it tiny.
- **DepthOfField** — cinematic focus falloff on a hero object.
- **ToneMapping** — an effect pass can set the final tone map (ACESFilmic) and exposure for the whole frame.

## Cost and interaction
- Post-processing forces the canvas to render every frame; it fights `frameloop="demand"`. Budget for it and profile on mobile (see `r3f-performance`).
- Effects apply to the whole canvas — including every `<View>`. For a persistent multi-View site, verify the grade reads well across all viewports, or use `Selection`/`Selective*` effects to scope glow to specific objects.
- Order matters: anti-aliasing (SMAA) usually last; grain/vignette after color-shaping effects.

## Restraint
Award-tier looks come from ONE or two tuned effects (grain + vignette + a touch of bloom), not a stack of ten. Match the identity: clinical, high-contrast, filmic — not psychedelic.

## See also
`r3f-lighting-environment` (tone mapping/exposure), `r3f-shaders` (per-object effects), `r3f-performance` (render cost).
