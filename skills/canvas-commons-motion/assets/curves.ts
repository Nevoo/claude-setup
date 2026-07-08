// Cubic-bezier easing (CSS-equivalent). Solves x(t) = value by Newton-Raphson
// then returns y(t). Lets us hit Apple/AE-style curves exactly instead of
// approximating with Canvas Commons' named ease* functions.
//
// USAGE:
//   import {OUT, IN_OUT, DRAG, BOUNCE} from './curves';
//   camera().position.y(-1140, 0.65, IN_OUT);
//   searchCard().scale(1, 0.48, BOUNCE);
//
import type {TimingFunction} from '@canvas-commons/core';

export function cubicBezier(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
): TimingFunction {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;
  const xAt = (t: number) => ((ax * t + bx) * t + cx) * t;
  const yAt = (t: number) => ((ay * t + by) * t + cy) * t;
  const dxAt = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (value: number, from = 0, to = 1) => {
    let t = value;
    for (let i = 0; i < 8; i++) {
      const dx = dxAt(t);
      if (Math.abs(dx) < 1e-6) break;
      const diff = xAt(t) - value;
      if (Math.abs(diff) < 1e-5) break;
      t -= diff / dx;
    }
    if (t < 0) t = 0;
    else if (t > 1) t = 1;
    return from + (to - from) * yAt(t);
  };
}

// The calm four (explainer register). Every tween uses one of the eight named
// curves in this file — never the named ease* functions from Canvas Commons.
//
//   OUT     — calm, decisive settle. For anything entering / arriving.
//   IN_OUT  — symmetric glide. For camera + position transitions.
//   DRAG    — heavy resistance at start, decisive arrival at end (no tail
//             bounce). For secondary elements that lag behind primary motion.
//   BOUNCE  — subtle overshoot (y peaks at ~1.066 mid-curve). ONLY on landing
//             scales of small elements — never on position, camera, or text.
//
export const OUT = cubicBezier(0.16, 1, 0.3, 1);
export const IN_OUT = cubicBezier(0.65, 0, 0.35, 1);
export const DRAG = cubicBezier(0.72, 0, 0.18, 1);
export const BOUNCE = cubicBezier(0.34, 1.45, 0.5, 1);

// Editorial speed-ramp family — for KINETIC / launch-reel work (camera punches,
// whole-frame pans, comet smears). See references/easing.md. The calm four above
// cover explainers; reels lean on RAMP.
//
//   RAMP      — lingers, WHIPS, decelerates hard. Camera punches + big moves.
//   RAMP_LONG — lingers harder so the whip lands later/harder, then settles. For
//               long pans whose payoff is the build, not the move.
//   ACCEL     — pure ease-IN: exits at FULL speed (no decel tail). Only when the
//               momentum carries into the next beat — never as the last move.
//   GLIDE     — starts MOVING at once (no dead-start), builds, settles. For a
//               continuous slide that flows INTO a ramp (one tween, no seam stop).
export const RAMP = cubicBezier(0.85, 0, 0.15, 1);
export const RAMP_LONG = cubicBezier(0.9, 0, 0.16, 1);
export const ACCEL = cubicBezier(0.55, 0.055, 0.675, 0.19);
export const GLIDE = cubicBezier(0.25, 0.1, 0.2, 1);
