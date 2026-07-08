---
name: r3f-shaders
description: Custom GLSL shaders in R3F - drei shaderMaterial, uniforms, varyings, updating uniforms in useFrame, onBeforeCompile to patch built-ins, video/texture-driven shaders, and common patterns (fresnel, gradient, dissolve, noise). Use when writing fragment/vertex shaders, custom visual effects, chiaroscuro/light effects, or GPU-driven distortion.
---

# R3F Shaders

General GLSL + R3F patterns; stable across versions. drei's `shaderMaterial` is confirmed in the installed build. This is central to the brand's "Architecture of Light" (real-time sculpted highlights) and the square viewport's video treatment.

## drei shaderMaterial (the idiomatic path)
Creates a `ShaderMaterial` subclass with typed uniforms, HMR support, and JSX usability.

```tsx
import { shaderMaterial } from '@react-three/drei'
import { extend, type ThreeElement } from '@react-three/fiber'
import * as THREE from 'three'

const LightMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#ff2700'), uMap: null as THREE.Texture | null },
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      float light = clamp(dot(vNormal, normalize(vec3(0.4, 0.8, 0.6))), 0.0, 1.0);
      gl_FragColor = vec4(uColor * pow(light, 2.0), 1.0);   // sculpted chiaroscuro falloff
    }`,
)
extend({ LightMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements { lightMaterial: ThreeElement<typeof LightMaterial> }
}

function Surface() {
  const mat = useRef<THREE.ShaderMaterial & { uTime: number }>(null!)
  useFrame(({ clock }) => { mat.current.uTime = clock.elapsedTime })
  return (
    <mesh>
      <planeGeometry args={[1, 1, 64, 64]} />
      <lightMaterial ref={mat} key={LightMaterial.key} />  {/* key enables shader HMR */}
    </mesh>
  )
}
```
`Material.key` on the element enables hot-reload of shader source during dev. Update uniforms by mutating the ref in `useFrame` (never setState per frame).

## Uniform types (JS → GLSL)
`number → float`, `THREE.Vector2/3/4 → vec2/3/4`, `THREE.Color → vec3`, `THREE.Matrix4 → mat4`, `THREE.Texture → sampler2D`. Group related scalars into vectors to minimize uniform count.

## Varyings
Pass per-vertex data to the fragment stage: declare `varying` in both shaders, write in vertex, read (interpolated) in fragment. Common: `vUv`, `vNormal`, `vWorldPosition = (modelMatrix * vec4(position,1.0)).xyz`.

## Video / texture into a shader
Feed a `useVideoTexture` result (see `r3f-textures-video`) as a `sampler2D` uniform and sample with `texture2D(uMap, vUv)`. This is how the square viewport plays a background loop that you can then distort, tint, or light. Keep the source loop muted/`playsInline` (see the video skill).

## Patterns (drop-in GLSL)
- Fresnel (rim/edge glow): `float f = pow(1.0 - dot(normalize(cameraPosition - vWorldPosition), vNormal), 3.0);`
- Gradient: `mix(colorA, colorB, smoothstep(0.0, 1.0, vUv.y));`
- Dissolve: sample noise, `if (n < uProgress) discard;` then tint the edge band.
- Value noise / fbm: hash `fract(sin(dot(...)) * 43758.5453)`, then bilinear + octaves.

## Extend a built-in instead of writing everything: onBeforeCompile
Keep PBR lighting from `meshStandardMaterial` but inject custom vertex/fragment code:
```tsx
material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = { value: 0 }
  shader.vertexShader = 'uniform float uTime;\n' + shader.vertexShader.replace(
    '#include <begin_vertex>',
    '#include <begin_vertex>\n transformed.y += sin(position.x * 10.0 + uTime) * 0.1;'
  )
  materialRef.current.userData.shader = shader   // keep a handle to update uTime in useFrame
}
```

## Performance
Avoid `if/else` in fragment shaders — use `mix`/`step`/`smoothstep`. Move constants out of the shader into uniforms. Prefer texture lookups for expensive functions.

## See also
`r3f-materials`, `r3f-textures-video`, `r3f-postprocessing` (full-screen shader effects), `r3f-lighting-environment`.
