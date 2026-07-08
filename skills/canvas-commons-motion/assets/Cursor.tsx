// Cursor — the agent's pointer, used as a recurring character.
//
// Seen in the reel: a single lilac arrow that glides between UI elements,
// presses to click, and drags things. Give it ONE reserved color and let it
// carry continuity across otherwise unrelated scenes. See
// references/signature-motifs.md → "The cursor as a character".
//
// Function-style component (closure-friendly) + move/click generators.
//
//   import {Cursor, moveCursor, clickCursor} from './Cursor';
//   const cursor = createRef<Path>();
//   view.add(<Cursor ref={cursor} position={[-200, 120]} />);
//   yield* moveCursor(cursor, [120, -40]);
//   yield* clickCursor(cursor);
//   yield* all(/* the morph the click triggers — fires immediately, no gap */);
//
import {Path, PathProps} from '@canvas-commons/2d';
import {Reference} from '@canvas-commons/core';
import {OUT} from './curves';

// Compact macOS-style pointer, tip anchored near (0,0) so position == tip.
const ARROW = 'M0 0 L0 17 L4.2 13.2 L7 19.5 L9.6 18.4 L6.8 12.2 L12 12 Z';

// Lilac — reserve this hue for the cursor ONLY (matches REEL_CURSOR).
export const CURSOR_COLOR = '#6B5BFF';

export function Cursor({
  ref,
  color = CURSOR_COLOR,
  ...props
}: {ref: Reference<Path>; color?: string} & PathProps) {
  return (
    <Path
      ref={ref}
      data={ARROW}
      fill={color}
      stroke={'rgba(0,0,0,0.18)'}
      lineWidth={1}
      {...props}
    />
  );
}

// Glide to a target. OUT — immediate response, calm landing. NEVER IN_OUT on a
// pointer; it should feel intentional, not floaty.
export function* moveCursor(
  cursor: Reference<Path>,
  to: [number, number],
  duration = 0.5,
) {
  yield* cursor().position(to, duration, OUT);
}

// Press + release. Only the cursor (and the element it touches) reacts — keep
// the rest of the UI dead still. See morphing.md → "keep the rest still".
export function* clickCursor(cursor: Reference<Path>) {
  yield* cursor().scale(0.86, 0.07, OUT);
  yield* cursor().scale(1, 0.16, OUT);
}
