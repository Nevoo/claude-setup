# Custom components — the productivity unlock

The deferred-lighting example project demonstrates a level of component reuse that the scoutai-explainer doesn't yet reach. Once you cross this threshold, scenes become small and uniform; before it, scenes are long and full of repeated structure. This is the single biggest scaling lever for a Canvas Commons project.

## Two kinds of "component"

### Function-style components (start here)

Plain functions that return JSX, with refs bundled via `makeRefs<typeof Component>()`. Use for compositions of existing nodes that you reuse 2–5 times within one project.

```ts
function Parameter({refs, children, value = 0}: {
  refs: {group: Layout; slider: Slider; text: Txt};
  children: string;
  value?: number;
}) {
  const result = (
    <Layout ref={makeRef(refs, 'group')} direction="column" opacity={0}>
      <Layout paddingBottom={8}>
        <Txt grow={1} {...WhiteLabel}>{children}</Txt>
        <Txt ref={makeRef(refs, 'text')} {...WhiteLabel} fill={ACCENT} />
      </Layout>
      <Slider ref={makeRef(refs, 'slider')} value={value} color={ACCENT} />
    </Layout>
  );

  // Auto-bind internal text to the slider's value. Done once, lives forever.
  refs.text.text(() => refs.slider.value().toFixed(2));

  return result;
}

// Usage
const intensity = makeRefs<typeof Parameter>();
view.add(<Parameter refs={intensity}>intensity</Parameter>);
yield* intensity.slider.value(0.8, 1.0);  // text auto-updates
```

The function CAN be defined inside the scene generator — it captures closure variables (like a theme color or a master signal).

### Custom Node subclasses (when you reuse across scenes)

Extend `Node`, `Layout`, or `Shape`. Use for novel visual concepts (a custom arrow, a slider, a 3D bridge) that you want to import across scenes.

```ts
import {Node, NodeProps} from '@canvas-commons/2d/lib/components';
import {initial, signal, computed, vector2Signal} from '@canvas-commons/2d/lib/decorators';
import {SimpleSignal, Vector2Signal} from '@canvas-commons/core/lib/signals';
import {Vector2} from '@canvas-commons/core/lib/types';

export interface PinProps extends NodeProps {
  from?: SignalValue<PossibleVector2>;
  to?: SignalValue<PossibleVector2>;
  radius?: SignalValue<number>;
}

export class Pin extends Node {
  @vector2Signal('from')
  public declare readonly from: Vector2Signal<this>;

  @vector2Signal('to')
  public declare readonly to: Vector2Signal<this>;

  @initial(8)
  @signal()
  public declare readonly radius: SimpleSignal<number, this>;

  @computed()
  public length(): number {
    return this.from().sub(this.to()).magnitude;
  }

  public constructor(props: PinProps) {
    super(props);
  }

  // Set the node's coordinate system so children sit in `from→to` aligned space.
  public override localToParent(): DOMMatrix {
    const direction = this.to().sub(this.from()).normalized;
    const center = this.from().add(this.to()).scale(0.5);
    return new DOMMatrix([
      direction.x, direction.y,
      -direction.y, direction.x,
      center.x, center.y,
    ]);
  }

  // Paint to the 2D canvas. Use applyStyle pattern from VectorBase if you want
  // stroke / lineWidth / lineCap signal props too.
  protected override draw(context: CanvasRenderingContext2D) {
    context.save();
    // ... custom draw using this.length(), this.radius(), etc.
    context.restore();
    super.draw(context);  // draws children
  }
}
```

### The decorators

| Decorator | Purpose |
|---|---|
| `@signal()` | Declare a simple signal-backed property |
| `@initial(value)` | Default value for the signal |
| `@computed()` | Memoized derived value that tracks dependencies |
| `@vector2Signal('name')` | A compound Vector2 signal (gives `.x`, `.y`, full `.set()`) |
| `@colorSignal()` | A Color signal with chainable `.alpha()` etc. |
| `@canvasStyleSignal()` | A CanvasStyle signal for stroke/fill (supports gradients) |

`@initial` must come above `@signal` decorator on the same property.

### Overrides worth knowing

| Override | When |
|---|---|
| `draw(context)` | Paint anything custom to the canvas (call `super.draw(context)` to render children) |
| `getPath()` (Shape only) | Return a `Path2D` — the Shape base handles fill/stroke/lineWidth automatically |
| `localToParent()` | Return a custom transform matrix — for nodes whose orientation is derived from props (a Vector pointing from A to B, an arc) |
| `getCacheBBox()` | Return the node's bounding box — needed for layout participation and clipping |

## The master-signal pattern, internalised

The deferred-lighting `Slider` is the model:

```ts
export class Slider extends Layout {
  @initial(0) @signal()
  public declare readonly value: SimpleSignal<number, this>;

  public readonly handle: Circle;
  public readonly activeTrack: Rect;

  public constructor(props?: SliderProps) {
    super({layout: true, ...props});
    this.add(<Rect ref={makeRef(this, 'track')}>{...}</Rect>);
    // EVERY internal property binds to `value`:
    this.handleHighlight.position.x(() => this.size.x() * (this.value() - 0.5));
    this.activeTrack.size.x(() => `${this.value() * 100}%`);
  }
}
```

Outside code never reaches inside. `slider.value(0.5, 1.0)` tweens — and the handle, the track fill, and any auto-bound text all move together because they're all derived from `value`.

This is how you should build a `<Card>`, a `<SceneTitle>`, a `<MorphablePill>`. Public signal in, every internal property derives.

## When to use which

| Need | Use |
|---|---|
| Reuse the same layout 2–3× within one scene | Function component |
| Reuse across scenes, same project | Function component or custom subclass |
| Novel drawing logic (a custom shape, a vector, a slider) | Custom Node/Shape subclass |
| Coordinate-frame logic (children should sit in arrow-aligned space) | Custom subclass with `localToParent()` override |
| Bundle multiple refs into one structured object | `makeRefs<typeof Component>()` either way |

## The 80/20 for our project

For the scoutai-explainer codebase:

- A `<ScoutCard>` function component would replace ~70 lines of repeated card JSX and let us share the master-signal-driven score animation
- A `<SceneTitle>` function component would replace the 4× repeated snap-then-tween title pattern
- A `<MorphablePill>` custom subclass with a `morphState` signal driving size/radius/text-size internally would collapse the 0.5s morph block into one line: `yield* searchPill().morphState(1, 0.5, BOUNCE)`

We don't need to go further — no Three.js, no custom shaders. Just the pattern.

## `tween()` — the escape hatch for multi-target animation

When property tweens aren't enough (animating multiple non-canvas-commons values from one progress, e.g. Three.js vectors or audio params):

```ts
import {tween} from '@canvas-commons/core';
import {easeInOutCubic} from '@canvas-commons/core/lib/tweening';

yield* tween(0.6, value => {
  layer.scale.set(
    easeInOutCubic(value, 240, 480),
    easeInOutCubic(value, 135, 270),
    1,
  );
  layer.position.set(
    easeInOutCubic(value, x0, x1),
    easeInOutCubic(value, 0, 40),
    easeInOutCubic(value, 0, 80),
  );
});
```

`easeInOutCubic(value, from, to)` is the same as `map(from, to, easeInOutCubic(value))` but inline. One progress value, many eased outputs.

For our project's curves: `OUT(value, from, to)` works the same way (the cubicBezier helper accepts `from` and `to` args directly).

## `clampRemap` for staged secondary effects

When a derived property should only start changing AFTER the master signal crosses a threshold:

```ts
import {clampRemap} from '@canvas-commons/core/lib/tweening';

startOffset: () => linear(clampRemap(0, size / 3, 0, 1, radius()), 0, 60),
// While radius is 0 → size/3, startOffset is 0.
// After radius crosses size/3, startOffset ramps 0 → 60.
```

`clampRemap(fromMin, fromMax, toMin, toMax, value)` maps `value` from one range to another with clamping at the ends. Use it inside a signal-bound function to make secondary elements "wake up" partway through a primary motion.

## Frame-level hooks (`lifecycleEvents`)

For state that lives outside the canvas-commons render graph (Three.js objects, audio params, external simulations) you can't bind via signals. Use the frame hook instead:

```ts
import {useScene} from '@canvas-commons/core';
import {createComputed} from '@canvas-commons/core/lib/signals';

const orbit = createSignal(0);
const apply = createComputed(() => {
  // Runs whenever orbit() changes
  threeGroup.rotation.set(0, 0, (orbit() / 180) * Math.PI);
});
useScene().lifecycleEvents.onBeginRender.subscribe(apply);
```

Every frame, before render, `apply` runs and reads the current `orbit()`. Animating `orbit` animates the Three.js group. Same signal idiom, different render target.

`onFinishRender` exists too — for cleanup or post-frame work.
