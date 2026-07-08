# Rendering — headless MP4 pipeline & failure modes

Canvas Commons renders in the browser: the editor's render button drives the exporter, which writes a PNG sequence. Headless rendering = drive that same button with Playwright against system Chrome, then stitch with ffmpeg. There is no CLI renderer — don't go looking for one.

## The pipeline

One script, five steps. Keep the script *inside the Canvas Commons monorepo directory* so `playwright` and `vite` resolve from its `node_modules` (showcase projects often symlink or share theirs); have it `process.chdir()` into the target project before starting Vite.

```js
// render.mjs — lives in the canvas-commons/ dir, run by ABSOLUTE path (cwd drifts)
import { chromium } from 'playwright';
import { createServer } from 'vite';

process.chdir(TARGET_PROJECT);                    // 1. become the project
const server = await createServer({});            //    no root/configFile → picks up
await server.listen();                             //    the project's own vite config,
                                                   //    exactly like `npm start` there
const browser = await chromium.launch({
  channel: 'chrome',                               // 2. SYSTEM Chrome — Playwright's own
  headless: true,                                  //    browsers are usually not downloaded
  // For scenes with a three.js bridge, WebGL needs SwiftShader flags —
  // see canvas-commons-3d → references/headless-webgl.md
});
const page = await browser.newPage();

await page.goto(url);                              // 3. first load triggers Vite dep
await page.waitForTimeout(4000);                   //    pre-bundling and can 504 —
await page.reload();                               //    wait, reload, then wait for main
await page.waitForSelector('main');
await page.evaluate(() => document.fonts.ready);   //    fonts BEFORE frame 0
await page.waitForTimeout(3500);                   //    (first frames bake the fallback face otherwise)

await page.click('#render');                       // 4. the editor's render button
await page.waitForSelector('#render:not([data-rendering="true"])', { timeout: 0 });
// PNG sequence lands in <project>/output/<name>/NNNNNN.png
// (image-sequence exporter configured in project.meta)
```

```bash
# 5. stitch
ffmpeg -framerate 60 -i output/project/%06d.png \
  -c:v libx264 -pix_fmt yuv420p -crf 17 -movflags +faststart out.mp4
```

## Verify the render — every time, before reporting success

A render can *say* it completed and still be wrong. The exporter prints "render complete" even when it silently truncated. Run this loop after every render:

1. **Count frames** and compare to `duration × fps`:
   ```bash
   ls output/project/*.png | wc -l    # must ≈ duration_seconds × 60
   ```
2. **Read PNGs directly** (first, one mid-scene per beat, last) — check fonts loaded (no fallback face), 3D content present (not black/blank), nothing clipped.
3. **Probe the MP4**:
   ```bash
   ffprobe -v error -show_entries format=duration -of csv=p=0 out.mp4
   ```

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Frame count way short, "render complete", no error in log | **Stale `.vite` cache — silent truncation** | `rm -rf <each project's>/node_modules/.vite`, re-render. This is the #1 gotcha. |
| First `goto` 504s / hangs | Vite dep pre-bundling on cold start | Wait ~4s → `reload`. If it persists: kill stray Vite (`lsof -ti tcp:9000 \| xargs kill`) and clear `.vite` caches. |
| First frames show wrong/fallback font | Render started before fonts loaded | Await `document.fonts.ready` **plus** a few seconds before clicking render. |
| 3D content renders black/blank headless | Missing SwiftShader flags on the Chrome launch | `canvas-commons-3d` → `references/headless-webgl.md`. |
| Render ignores your live-tuned values | Headless = fresh profile = empty localStorage = `DEFAULTS` | Bake tuned params into `DEFAULTS` first — see `live-tuning.md` §"Close the loop for renders". |
| A left-anchored bar grows from its centre | `offset={[-1,0]}` on a Rect doesn't pin the edge reliably | Tween `width` 0→W **and** `x` −W/2→0 together. |

## Iteration cost

A full render is minutes, not seconds. Don't render-and-eyeball to tune feel — that's what the live panel is for (`live-tuning.md`). Render to **verify** (compile, fonts, layout, completeness), tune by **slider**.
