# Signals — the reactive primitive

Signals are the most important concept in Canvas Commons. A signal is a value that can change over time, with automatic dependency tracking. When you write a node property as a *function*, the property re-evaluates whenever its inputs change. This single mechanism replaces a lot of imperative state-keeping.

If you only learn one new thing from this skill, learn this.

## Creating a signal

```ts
import {createSignal} from '@canvas-commons/core';

const radius = createSignal(3);

radius();        // read   → 3
radius(8);       // write  → 8
yield* radius(12, 0.4, OUT);  // animate over 0.4s with OUT easing
```

The signal *is* a function. Calling with no args reads, with a value writes, with `(value, duration, easing)` animates.

## Derived (computed) signals — the dependency graph

```ts
const radius = createSignal(3);
const area = createSignal(() => Math.PI * radius() * radius());

area();        // 28.27
radius(5);
area();        // 78.54  — recomputed lazily, only when accessed
```

`area` tracks `radius` automatically because it called `radius()` inside its compute fn. Change `radius`, and any subsequent read of `area` returns the new value. Lazy + cached.

## Node properties ARE signals

Every node property is already a signal. Read with `circle().fill()`, write with `circle().fill('#0071E3')`, animate with `circle().fill('#0071E3', 0.4, OUT)`.

The big move: bind a property to a *function* of other signals.

```ts
const radius = createSignal(120);

view.add(
  <Circle
    width={() => radius() * 2}
    height={() => radius() * 2}
    fill={'#0071E3'}
  />,
);

yield* radius(40, 1.0, IN_OUT);   // animate ONE signal — circle resizes automatically
```

You never wrote `circle.width(...)` in the timeline. You animated `radius` and the circle followed. The dependency was declared once at construction.

## The master-signal pattern (the big productivity unlock)

Drive *many* derived properties from *one* signal you tween. The motion-canvas team's own layouts demo does this:

```ts
const state = createSignal(0);
// Helper: animate 'from' → 'to' as state goes 0 → 1.
const drive = (from: number, to: number) => () => from + (to - from) * state();

view.add(
  <Layout layout direction="column" gap={28}>
    <Layout grow={1} gap={28}>
      <Rect grow={drive(3, 1)} />   {/* shrinks from 3 to 1 */}
      <Rect grow={1} />
      <Rect grow={1} />
    </Layout>
    <Layout grow={drive(1, 2)} gap={28}>
      <Rect grow={1} />
      <Rect grow={drive(2, 4)} />
    </Layout>
  </Layout>,
);

// The entire layout reflows on this one tween:
yield* state(0, 2).to(1, 2);
```

One tween. Three layers of derived sizing. No imperative width/height calls. Use this pattern whenever many properties should change in lockstep (the score card, the morph, the curves race).

## When to use a signal binding vs a tween

| Situation | Use |
|---|---|
| Property A is always `f(B)` regardless of when B changes | **Signal binding** — `<Circle width={() => B() * 2} />` |
| Property A animates ONCE at a specific timeline moment | **Tween** — `yield* circle().width(240, 0.4, OUT)` |
| Many properties move in lockstep over a tween | **Master signal** — animate one signal, bind all properties to it |
| The leading edge of a draw should be tracked | **Signal binding** — `dot.position.y(() => -28 + line().end() * 1108)` |

The scoutai-explainer's dot-on-line binding is exactly this pattern — the dot follows `mapConnector().end()` because it's bound to a function of it, not because we manually advance it.

## Resetting to defaults

```ts
import {DEFAULT} from '@canvas-commons/core';

const x = createSignal(0);
x(50);
x(DEFAULT);                  // back to 0 instantly
yield* x(DEFAULT, 0.4, OUT); // animate back to 0
```

Works on node properties too: `circle().opacity(DEFAULT, 0.3, OUT)` returns to the JSX default.

## `createEffect` — reactive side effects

For side effects (logging, syncing external state) that should fire when signals change:

```ts
import {createEffect} from '@canvas-commons/core';

const unsubscribe = createEffect(() => {
  console.log('radius is now', radius());
});
// runs immediately, then every time radius changes
```

Use sparingly — most reactive needs are computed signals or bindings, not effects.

`createDeferredEffect` batches multiple dependency changes into one execution per frame — use when the effect is expensive.

## Anti-patterns

- **Manually mirroring state.** If you find yourself writing `cardA.opacity(x); cardB.opacity(x); cardC.opacity(x)` over and over, that's a master signal waiting to happen.
- **Updating a signal inside a binding.** Bindings are PURE functions of signals — read only. Use `createEffect` for side effects.
- **Recreating signals every frame** (e.g. inside a generator body). Create them once at scene setup.
