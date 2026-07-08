# Textures (crisp text) & depth (pop, layering, compositing)

## Baking text + gradients into a CanvasTexture

three.js has no text. Draw the label to a 2D canvas, wrap it in a `CanvasTexture`, map it onto a `PlaneGeometry`. The full helper is `assets/makeLabelTexture.ts`; the rules that make it crisp:

- **Bake at a LARGE font size** (e.g. 360px) regardless of on-screen size. The plane scales the texture down; baking big + mipmaps = sharp at any distance. Baking at the final small size looks soft and shimmers.
- **`minFilter = LinearMipmapLinearFilter`, `magFilter = LinearFilter`, `anisotropy = 8`.** Mipmaps fix scaled-down shimmer; anisotropy keeps tilted cards sharp at grazing angles.
- **`colorSpace = SRGBColorSpace`** so your sRGB hex gradients render at the right gamma (skip this and colours look washed/dark).
- **Size the plane to the texture aspect:** `makeLabelTexture` returns `{texture, aspect}`; build `new PlaneGeometry(worldHeight * aspect, worldHeight)` so the text never stretches.
- **Repaint on `document.fonts.ready`.** The first `paint()` may run before the webfont loads → fallback metrics/shape. Keep `paint` as a closure and call it again on ready, then `texture.needsUpdate = true`. (The render harness also waits for fonts before frame 0 — belt and suspenders.)
- **Per-element gradients:** each card carries its own `colorTop → colorBottom` (canvas top = plane top). Distinct gradients per card read as playful, premium, and help the eye separate stacked elements.

```ts
const {texture, aspect} = makeLabelTexture('two', '#38BDF8', '#1D4ED8');
const mat = new THREE.MeshBasicMaterial({
  map: texture, transparent: true, opacity: 0,
  depthTest: false, depthWrite: false, side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wd.h * aspect, wd.h), mat);
```

`MeshBasicMaterial` (unlit) is right for flat typographic cards — there are no lights, the gradient *is* the shading. Add real lights + `MeshStandardMaterial` only if you want physical surfaces.

## Depth-pop entrance

Drive a per-element entrance signal `appear[i]: 0→1` and read it in `apply()` to combine opacity + scale + a **z-rush from back to rest**:

```ts
const Z_TRAVEL = 0.95; // world units a card starts behind its resting z
meshes[i].material.opacity = Math.min(1, a * 1.4);     // fade in slightly ahead of the move
meshes[i].scale.setScalar(0.55 + 0.45 * a);            // grow into place
meshes[i].position.z = wd.z - Z_TRAVEL * (1 - a);      // starts far, rushes forward to wd.z
meshes[i].visible = a > 0.001;                          // cull until it starts
```

Tween `appear[i]` with `OUT` (decisive arrival). The z-rush is what makes it read as *3D* depth rather than a flat fade — the card flies toward the viewer.

## Layering: sticker vs true depth

Two valid modes — choose deliberately:

- **Sticker layering** (what stacked typographic cards usually want): `depthTest: false`, `depthWrite: false`, and set `mesh.renderOrder = i` so paint order, not Z, decides who's on top. Overlapping cards then layer like cut paper in a fixed order — clean, no z-fighting, even when their planes intersect.
- **True 3D overlap:** leave depth testing on. Cards occlude each other by actual Z. Use when you want genuine intersection/parallax, and accept that you must keep planes from co-planar z-fighting.

Mixing them in one scene sorts unpredictably — pick one per group.

## 2D / 3D compositing in one scene

The `Three` node blits with a **transparent** buffer, so:

- A 2D `Rect` added **before** the `Three` node shows **through** wherever the 3D is transparent — your background.
- 2D nodes added **after** the `Three` node (or as its children) draw **on top** of the 3D — overlays, UI, captions.

This is what lets a flat 2D headline sit *over* a 3D card stack, and lets the 3D recede behind a 2D element. For a reveal that should feel like the camera moving through depth, don't drop the 2D element in flat — **scale it from huge → 1 over a real camera pull-back** while the 3D content shrinks; the flat overlay then reads as part of the same recession (see `references/kinetic-3d-typography.md`).
