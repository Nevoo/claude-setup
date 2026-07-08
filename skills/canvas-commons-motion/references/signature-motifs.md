# Signature motifs — premium launch-reel vocabulary

The rest of this skill teaches the *calm explainer* (one idea at a time, camera glides, lots of breathing room). This file teaches the *launch reel* — the fast, kinetic, hype-piece register. Same motion discipline (named curves, master signals, continuous morphs); higher energy and a denser beat.

Distilled from a 44s AI-agent launch reel (Replit / Browserbase). The whole film had **fewer than four hard cuts** — everything was a morph. That's the headline lesson: reel energy is not fast *cutting*, it's fast *morphing*.

## The structural principle: one signature motif as the spine

A good reel picks **one repeating visual** and reuses it as a rhythm beat. In the reference film it was the dot-burst (below) — it returned three or four times, each time meaning "the agent is thinking." That repetition is what keeps a dense montage from feeling like noise. The eye learns the motif and uses it to parse the rest.

Rule: **decide your one signature motif before you animate anything.** Everything else orbits it.

## Which aesthetic am I in?

| | Calm explainer (rest of skill) | Launch reel (this file) |
|---|---|---|
| Palette | `assets/palette.ts` (cool Apple-light) | `assets/palette-reel.ts` (warm cream + bold accents) |
| Beat density | one idea per camera move | many beats, constant motion |
| Camera | leads the eye, long glides | often static; motion comes from the elements |
| Type | titles slide in, settle, hold | headlines **build word by word** |
| Transitions | morphs + deliberate cuts | morphs almost exclusively |
| Signature | the content is the star | one repeating motif is the spine |

Both share the named-curve discipline (the reel leans on the RAMP family, the explainer on the calm four — see `easing.md`), the master-signal pattern, and "morph, don't crossfade." Don't mix palettes within one piece.

---

## 1. The dot-burst ("thinking / analyzing")

A ring of dots collapses to a center point, then explodes into a fine radial starburst while a counter ticks up. The reel's metaphor for the agent processing. Drop-in: `assets/DotBurst.tsx` — one public `progress` signal (0→1) drives all three phases.

```ts
import {DotBurst} from './DotBurst';
import {REEL_BLUE} from './palette-reel';

const burst = createRef<DotBurst>();
const count = createRef<Txt>();
view.add(<DotBurst ref={burst} rays={56} color={REEL_BLUE} ringRadius={90} rayLength={260} />);
view.add(<Txt ref={count} fontWeight={700} fontSize={56} fill={REEL_BLUE} />);

// The burst expands while the number tracks the SAME progress — one moment, not two.
yield* all(
  burst().progress(1, 1.4, IN_OUT),
  tween(1.4, v => count().text(`${Math.round(IN_OUT(v) * 380)}`)),
);
```

Bind the counter to the same tween (don't run a separate `countTo` afterward) so the number and the rays peak together. For an eased standalone counter, see `easing.md` → "Numerical count-ups".

## 2. The cursor as a character

A single pointer that glides between UI elements, presses to click, and drags things. It personifies the agent and — crucially — **stitches otherwise unrelated scenes into one continuous space**. Drop-in: `assets/Cursor.tsx` (the arrow + `moveCursor` / `clickCursor` generators).

Rules:
- **One consistent color, reserved for the cursor only** (lilac `REEL_CURSOR` in the reel palette). Never reuse that hue elsewhere — the cursor must always read as the cursor.
- **Move on OUT, never IN_OUT.** A pointer should feel intentional (immediate response, calm landing), not floaty.
- **On click, only the cursor and the thing it touches react.** The card doesn't pulse, the page doesn't flash. See the "keep the rest of the UI still" rule in `morphing.md`.
- **The cursor causes morphs.** A click immediately triggers a transform (no gap), then the cursor fades out as the new visual takes over — exactly the morph hand-off in `morphing.md`.

```ts
yield* moveCursor(cursor, [120, -40]);   // glide to the button
yield* clickCursor(cursor);              // press + release
yield* all(/* the morph the click triggers — fires immediately */);
```

## 3. Kinetic word-by-word headlines

Reel headlines **assemble one word at a time**, and one word carries an accent color. ("What if your agents were as capable as **you?**" / "Turn your ideas into **pixel perfect** slides.") Far more energy than a single slide-in title, costs nothing extra.

Build each word as its own `Txt` in a row `<Layout>`, constructed at `opacity 0` and nudged down ~14px. The accent word is just a different `fill` set at construction — no extra animation.

```ts
// words: Txt[] in a <Layout direction="row" gap={...}>, each opacity 0, y +14 in JSX.
function* buildHeadline(words: Txt[], stagger = 0.1) {
  yield* sequence(
    stagger,
    ...words.map(w => all(
      w.opacity(1, 0.42, OUT),
      w.position.y(0, 0.5, OUT),   // rests at 0; started at +14
    )),
  );
}
```

Keep `stagger` (0.08–0.12) **smaller than the per-word duration** so the words overlap into one wave rather than ticking in discretely — the same stagger rule as `pacing.md`. For the accent word, prefer `REEL_BLUE` or `REEL_ORANGE`; never the cursor's lilac.

## 4. Shape-multiply / ellipse → pill morphs

The reel's connective tissue between beats: a cobalt ellipse multiplies into several, the cluster merges into a row, then a single shape stretches into a stadium/pill carrying a word. All morphs, no crossfades — the search→pill case in `morphing.md` is the template; these just add count.

- **Multiply**: pre-place N ellipses (don't spawn at runtime), reveal them in a radial stagger from one source, driven by a master `spread` signal so they fan out in lockstep.
- **Merge → pill**: tween the survivors' `position` to a row while one Rect's `size`/`radius` morphs to a pill — physical props on BOUNCE/OUT at one duration, color/text on IN_OUT at the same duration (the pairing rule, `easing.md`).
- **Reserve hard geometry for hard meaning.** A circle becoming a pill should *mean* "this expanded into a label," not just be decoration.

## 5. Pixel / block dissolve (human ↔ abstract)

The reel's standout transition: the live presenter dissolves into a grid of square pixels and reforms — the bridge between a real person (testimonial) and the abstract dot-language (product). Two ways to build it:

**(a) Block dissolve (reliable, idiomatic).** Overlay the subject with an N×M grid of canvas-colored squares; reveal/hide them in a scattered order. `reveal` 0 = fully covered, 1 = clear. Each cell gets a random threshold at construction so the image resolves in scattered blocks, not a wipe.

```tsx
import {Node, NodeProps, initial, signal} from '@canvas-commons/2d';
import {SimpleSignal, SignalValue, clampRemap} from '@canvas-commons/core';

export interface BlockDissolveProps extends NodeProps {
  reveal?: SignalValue<number>;     // 0 covered → 1 clear
  cols?: number; rows?: number;
  width?: number; height?: number;
  fill?: string;                    // match the canvas (REEL_BG)
}

export class BlockDissolve extends Node {
  @initial(0) @signal() public declare readonly reveal: SimpleSignal<number, this>;
  private readonly thresholds: number[];
  private readonly cols: number; private readonly rows: number;
  private readonly w: number; private readonly h: number; private readonly col: string;

  public constructor(props: BlockDissolveProps) {
    super(props);
    this.cols = props.cols ?? 28; this.rows = props.rows ?? 28;
    this.w = props.width ?? 600; this.h = props.height ?? 600;
    this.col = props.fill ?? '#F4EEE3';
    // random per-cell threshold — runs ONCE at construction (project code, so Math.random is fine)
    this.thresholds = Array.from({length: this.cols * this.rows}, () => Math.random());
  }

  protected override draw(context: CanvasRenderingContext2D) {
    super.draw(context); // draw the photo child first (place it as a child of this node)
    const r = this.reveal();
    const cw = this.w / this.cols, ch = this.h / this.rows;
    context.save();
    context.fillStyle = this.col;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        // a cell uncovers once reveal passes its threshold (8% soft edge)
        const a = clampRemap(this.thresholds[y * this.cols + x],
                             this.thresholds[y * this.cols + x] + 0.08, 1, 0, r);
        if (a <= 0) continue;
        context.globalAlpha = a;
        context.fillRect(-this.w / 2 + x * cw, -this.h / 2 + y * ch, cw + 1, ch + 1);
      }
    }
    context.restore();
  }
}
```

Animate `reveal` 0→1 (assemble) or 1→0 (disperse) with OUT. Pair the dissolve out of the photo with the dissolve *into* the next abstract element in one `all()` block so it reads as a transformation, not two events.

**(b) True pixelation (advanced).** Cache the source node, draw it to an offscreen canvas at low resolution, then upscale with `context.imageSmoothingEnabled = false`. Animate the offscreen resolution from a few px up to full — the subject sharpens from chunky pixels. Heavier; only worth it when you need real downsampling rather than the block look. Sketch it inside a custom `draw()` with an offscreen `OffscreenCanvas` and the source node's cached bitmap.

---

## Reel checklist (run after building a hype piece)

1. **Is there one signature motif that repeats?** If every beat is a different idea, the reel has no spine — promote one visual to recurring.
2. **Are you cutting where you could morph?** Sub-second hard cuts read cheap. Morph between beats; reserve cuts for a deliberate jolt.
3. **Does the cursor keep one reserved color, and move on OUT?** Lilac-for-cursor only; never IN_OUT on a pointer.
4. **Do headlines build word-by-word with one accent word**, stagger < word duration? If they slide in whole, you're in explainer register, not reel.
5. **Is the counter bound to the same tween as its burst**, not run separately afterward?
6. **One canvas color throughout** (warm cream) so every UI card and accent pops? Mixing backgrounds kills the "floating in one space" feel.
7. **Did you mix the two palettes?** Pick `palette.ts` *or* `palette-reel.ts` for the whole piece — never both.
