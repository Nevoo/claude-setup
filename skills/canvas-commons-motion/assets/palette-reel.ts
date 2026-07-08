// Launch-reel palette — the bold, kinetic counterpart to the calm Apple-light
// palette (palette.ts). Same motion discipline, higher energy: a warm cream
// canvas so a few saturated accents pop.
//
// Derived from the AI-agent launch reel (Replit / Browserbase). Use this when
// the brief is a hype piece / launch film, NOT a calm explainer. Don't mix the
// two palettes within one piece. See references/signature-motifs.md.
//
// USAGE:
//   import {REEL_BG, REEL_INK, REEL_BLUE, REEL_CURSOR, REEL_FONT} from './palette-reel';
//   view.fontFamily(REEL_FONT);
//   view.add(<Rect size={[1920, 1080]} fill={REEL_BG} />);  // outside camera

export const REEL_FONT =
  `'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`;

export const REEL_BG       = '#F4EEE3';  // warm cream canvas (NOT cool grey) — the whole film sits on this
export const REEL_SURFACE  = '#FFFFFF';  // floating UI cards
export const REEL_INK      = '#141414';  // near-black headline type
export const REEL_MUTED    = '#8A857B';  // captions / secondary on cream
export const REEL_BLUE     = '#1F3BFF';  // electric cobalt — primary accent + accent words
export const REEL_ORANGE   = '#FF4D1C';  // orange-red — brand pop, logos, alt accent word
export const REEL_AMBER    = '#FF9A1E';  // amber pills
export const REEL_CURSOR   = '#6B5BFF';  // lilac — RESERVED for the cursor ONLY. Never reuse this hue.
