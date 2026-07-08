# Rendering WebGL headlessly

Headless Chrome has **no GPU** by default, so three.js renders **nothing** (blank/black 3D) unless you force a software GL backend. This bites every CI / no-display render of a `Three`-bridge scene.

## The launch flags (required)

Launch Chrome (via Playwright) with SwiftShader — Chrome's software GL:

```js
const browser = await chromium.launch({
  channel: 'chrome',          // system Chrome — Playwright's bundled browsers often aren't installed
  headless: true,
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--enable-webgl',
  ],
});
```

Without `--use-angle=swiftshader` (+ `--enable-unsafe-swiftshader` on recent Chrome) the WebGL context either fails to create or renders empty. `--ignore-gpu-blocklist` stops Chrome disabling WebGL on "unsupported" headless configs.

Verify the context actually came up — a smoke check that reads back `gl.getParameter(VERSION)` and asserts `pageerrors: 0` catches a dead GL backend before you render 500 frames into the void.

## Fonts before frame 0

Baked text textures (`makeLabelTexture`) paint with the **fallback face** if the webfont isn't loaded yet. Two safeguards, use both:

1. In the texture helper, repaint on `document.fonts.ready` and set `needsUpdate` (already in `assets/makeLabelTexture.ts`).
2. In the render harness, after navigation wait for `document.fonts.ready` **and** a short settle (~3.5s) before clicking render, so the very first captured frame already has the real face.

## Harness shape (what worked here)

- The render script lives in the **Canvas Commons package dir** so `import {chromium} from 'playwright'` and `vite` resolve from its node_modules, then `process.chdir()` into the target project and `createServer({})` (no root/config) so Vite picks up the project's own config exactly like `npm start`.
- First `goto` triggers Vite dep pre-bundling (can 504) → wait, `reload`, then wait for the editor + fonts.
- Click the editor's `#render` button, wait for `#render:not([data-rendering="true"])`; the image-sequence exporter writes `output/project/NNNNNN.png`. Stitch with ffmpeg (`-framerate 60 -pix_fmt yuv420p -crf 17`).
- A stale `.vite` cache can cause a **silently truncated** render (far fewer frames than expected, "complete" printed, no error). If the frame count is short with no error, `rm -rf node_modules/.vite` and re-render.

## Quick GPU-less pre-check

Before a full render, a tiny headless load that asserts the GL version string, the render button exists, and `pageerrors === 0` is the fastest way to confirm the SwiftShader flags + scene compile are good. Keep one such `smoke-*.mjs` alongside the render script and run it after every edit.
