# Layout — Flexbox instead of manual coordinates

Canvas Commons ships a real flexbox engine. The current project (scoutai-explainer) positions every text and rect with manual x/y/anchor. That's fine for one-offs but a maintenance trap for anything repeated — cards, rows, lists. Use `layout` for those.

## Two ways to opt in

```ts
// Option A: any node + layout prop
<Rect layout direction="row" gap={12} padding={20}>
  <Circle size={10} />
  <Txt>Hello</Txt>
</Rect>

// Option B: the dedicated Layout component (no visual chrome of its own)
<Layout layout direction="column" gap={28} padding={40}>
  ...
</Layout>
```

A node with `layout` becomes a flexbox root. Its children participate in flexbox positioning automatically. Its *own* position remains controlled by parent — only its internal arrangement is flexbox.

## Common props (mirror CSS)

| Prop | Maps to |
|---|---|
| `direction` | `flex-direction` ('row' \| 'column' \| 'row-reverse' \| 'column-reverse') |
| `gap` | `gap` (px or `Spacing`) |
| `padding` | `padding` (px, `[v, h]`, or `[t, r, b, l]`) |
| `margin` | `margin` |
| `alignItems` | `align-items` ('start' \| 'center' \| 'end' \| 'stretch') |
| `justifyContent` | `justify-content` |
| `wrap` | `flex-wrap` |
| `grow` | `flex-grow` |
| `shrink` | `flex-shrink` |
| `basis` | `flex-basis` |

## Sizing — pixels, percentages, auto

```ts
<Rect width={200} height={'50%'} />     // px + percentage of parent
<Layout size={'100%'} />                 // shorthand for both
<Rect width={null} height={null} />      // auto — sized by content / flexbox
```

The `size` prop is `[width, height]`. `null` means automatic.

## When to use layout, when not to

**Use layout for:**
- Card internal structure (title, meta, hero, bar — column with gaps)
- Rows of repeated items (the spots list, scoreboard rows)
- Anything that should re-flow if content length changes (Txt that varies)
- Anything that should respond to a master signal driving sizes

**Don't use layout for:**
- Scene-level anchoring (scenes are at absolute world positions for the camera)
- Anything where you tween `position.x/y` directly — layout will fight the tween
- Decorative overlays that float over content (use `layout={false}`)

## Opting children out

A child of a layout root won't be positioned by flexbox if it has `layout={false}`:

```ts
<Layout layout direction="column" gap={20}>
  <Rect />                          {/* in the flex flow */}
  <Rect />                          {/* in the flex flow */}
  <Circle layout={false} x={400} /> {/* free-positioned, ignored by flex */}
</Layout>
```

Useful for arrows, badges, glyphs that visually overlap structured content.

## Animating layouts via a master signal

Don't tween width/height directly inside a layout — drive a master signal and bind the size-affecting props to functions of it. (See `signals.md`.)

```ts
const state = createSignal(0);
const drive = (from: number, to: number) => () => from + (to - from) * state();

<Layout layout direction="column" gap={28} padding={20}>
  <Layout grow={1} gap={28}>
    <Rect grow={drive(3, 1)} />
    <Rect grow={1} />
    <Rect grow={1} />
  </Layout>
  <Layout grow={drive(1, 2)} gap={28}>
    <Rect grow={drive(2, 4)} />
  </Layout>
</Layout>

// One tween reflows the entire grid:
yield* state(0, 2, IN_OUT).to(1, 2, IN_OUT);
```

This is *the* productivity unlock. The motion-canvas team's own layouts demo is built this way.

## Card rebuild — manual coords vs layout

The scoutai card today uses absolute positions. With layout it shrinks dramatically and re-flows for any future content tweaks:

```ts
// Layout version — content stacks, gaps stay correct even if you swap Txt sizes
<Rect
  layout
  direction="column"
  alignItems="center"
  padding={[42, 24, 28]}
  gap={10}
  size={[280, 340]}
  radius={32}
  fill={SURFACE}
  stroke={HAIRLINE}
  lineWidth={1}
>
  <Circle size={10} fill={spot.color} />
  <Layout direction="column" alignItems="center" gap={4} grow={1} justifyContent="center">
    <Txt fontSize={24} fontWeight={620} letterSpacing={-0.5} fill={INK}>{spot.name}</Txt>
    <Txt fontSize={14} fontWeight={420} fill={MUTED}>{spot.meta}</Txt>
  </Layout>
  <Txt ref={scoreNums} fontSize={92} fontWeight={700} letterSpacing={-2.6} fill={spot.color}>00</Txt>
  <Rect width={200} height={4} radius={2} fill={SOFT}>
    <Rect ref={scoreBars} width={0} height={4} radius={2} fill={spot.color} layout={false} left={() => /* derived from bar */ 0} />
  </Rect>
</Rect>
```

Compare to the absolute-coord version where every Y had to be hand-tuned and you couldn't change the title font without re-tuning everything below it.

## Pitfalls

- **Tweening width/height inside a layout** without going through a signal will be overridden by the flexbox solver. Either drive via signal or take the node out of layout.
- **`gap` and `padding` accept px directly.** Don't pass `Spacing` objects unless you need per-side control.
- **The layout root's `size` is its own dimensions, not its children's bounding box.** Use `null` or `'auto'` to let flexbox decide.
