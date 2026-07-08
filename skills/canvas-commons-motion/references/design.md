# Design system

> Two palettes. This file is the **calm Apple-light** system (cool, restrained — the default). For a **launch reel / hype piece**, use the warm bold palette in `assets/palette-reel.ts` and read `references/signature-motifs.md` instead. The typography and card discipline below still apply; only the colors and energy change. Never mix the two palettes in one piece.

## Apple-light palette

Use these constants — don't introduce new colors casually. Each has a specific role. (Copy from `assets/palette.ts`.)

```ts
const BG          = '#F5F5F7';  // page background (sits OUTSIDE the camera, never pans)
const SURFACE     = '#FFFFFF';  // card faces, input surfaces
const INK         = '#1D1D1F';  // primary text + dark pills (Apple's near-black)
const MUTED       = '#86868B';  // secondary text, hairline icons
const HAIRLINE    = '#D2D2D7';  // 1px borders and dividers
const SOFT        = '#F0F0F2';  // muted backgrounds (e.g. progress tracks)
const ACCENT      = '#0071E3';  // primary accent (Apple blue)
const ACCENT_SOFT = '#E8F1FE';  // winner card surface, soft highlights
const ACCENT_LINE = '#B9DCFE';  // winner card border
const GREEN       = '#34C759';  // semantic positive
const AMBER       = '#FF9F0A';  // semantic mid/warning
```

### Notes

- INK is not `#000` — Apple's near-black is softer and reads better on a white surface.
- BG is not `#FFF` — the slightly off-white separates cards from the page.
- Use `${COLOR}1A` for 10% alpha if you absolutely need a soft tint, but prefer NOT to — see "no halos" below.

## Typography

One font stack throughout, set once on the view:

```ts
view.fontFamily(`'Geist', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`);
```

### Size + weight conventions

| Role | Size | Weight | Letter-spacing | Fill |
|---|---|---|---|---|
| Hero numerics (score, KPI) | 88–96 | 700 | −2.4 to −2.6 | colored |
| Scene title (display) | 80–96 | 620 | −2.2 to −2.4 | INK |
| Scene sublabel | 26 | 420 | −0.2 | MUTED |
| Card title | 24–28 | 620 | −0.5 | INK |
| Card meta / caption | 14–15 | 420 | 0 | MUTED |
| Pill text (small dark pill) | 22 | 600 | −0.3 | white-on-INK |
| Button / row number | 26 | 620 | 0 | INK or ACCENT |

### Letter-spacing rule

- **Tightens for large bold text** (Apple style — −0.5 to −2.6 depending on size).
- **Stays at 0 or slightly positive** for small caps and labels.
- Never positive (>0) on body text.

### Title slide-in pattern

Scene titles enter sliding up a few px while fading in. Same easing for both (OUT).

```ts
<Txt ref={heroTitle} text="..." position={[0, -40]} opacity={0} />

// ...timeline...
yield* all(
  heroTitle().opacity(1, 0.6, OUT),
  heroTitle().position.y(-60, 0).to(-40, 0.7, OUT),  // snap to -60, tween to -40
);
```

The `position.y(start, 0).to(end, duration, OUT)` pattern: instant snap to a slightly higher position, then OUT-tween to the rest position.

## Cards — sharp Apple style

Avoid the Material/round look. Sharper, less decorative.

### Shape and shadow
- **Radius**: 32 (not 40+). Subtle rounding, architectural.
- **Shadow**: soft and TIGHT — `rgba(0,0,0,0.05)`, blur 24, offsetY 12. The card sits on the surface; it does not float.
- **Border**: 1px HAIRLINE. Always.
- **Padding**: leave breathing room. ~80px gap between the top edge and the first content element.

### Hierarchy (the rule)

A card is a story with ONE hero. For a stat card:

1. **Top**: small color chip (10px circle, spot's color) — identification only.
2. **Title** (24px, weight 620, INK): the name.
3. **Meta** (14px, weight 420, MUTED): supporting tagline.
4. **Hero**: ONE big number — 92px, weight 700, colored, sharply tracked. This is the point of the card.
5. **Bottom**: a hair-thin (4px tall, 200px wide) progress line — quantitative confirmation that doesn't compete with the hero.

### What to NEVER do

- **Soft halos behind dots** (the 76px translucent circle behind a 24px dot). It's the Material Design tell. Cut it.
- **Multiple focal points** in one card — pick ONE thing.
- **Title bigger than the metric** — the metric IS the card. If the title is the focus, you don't have a stat card.
- **Heavy shadows** that float the card off the surface. The card is part of the surface.
- **Background "scan" effects, sliding glows, or animated auras** behind cards. They look like demo chrome. Cut them. Hierarchy and color do the work.
- **Truncating names** that fit. If "Rooftop garden" fits on the card, show "Rooftop garden", not "Rooftop".

### Winner emphasis (when ranking)

Three things together, never just one:

1. Winner scales up to 1.06 (OUT).
2. Other cards dim to opacity 0.42 (OUT).
3. Winner uses ACCENT_SOFT surface and ACCENT_LINE border (set at construction).

The dim is what makes the scale read. Without it, the scale looks like a glitch.

## Spots / locations along a path

When showing locations alongside a connector line:

- **Alternate sides** — left / right / left.
- **No card chrome** for the location — just a colored Circle (14px) and the name in INK at 48px/600/−0.8 letter-spacing. The line is the structure; the locations are inline annotations.
- **Anchored to the side of the line**: left-side names anchor `[1, 0]` (right-edge), right-side anchor `[-1, 0]` (left-edge). Names are pulled INTO the line, not pushed away.
