// Apple-light palette. Each constant has a specific role — don't introduce
// new colors casually. See references/design.md for usage rules.
//
// USAGE:
//   import {BG, SURFACE, INK, MUTED, FONT, ACCENT} from './palette';
//   view.fontFamily(FONT);
//   view.add(<Rect size={[1920, 1080]} fill={BG} />);  // outside camera

export const FONT =
  `'Geist', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`;

export const BG          = '#F5F5F7';  // page background (outside camera)
export const SURFACE     = '#FFFFFF';  // card faces, input surfaces
export const INK         = '#1D1D1F';  // primary text + dark pills (Apple near-black)
export const MUTED       = '#86868B';  // secondary text, hairline icons
export const HAIRLINE    = '#D2D2D7';  // 1px borders + dividers
export const SOFT        = '#F0F0F2';  // muted backgrounds (progress tracks)
export const ACCENT      = '#0071E3';  // primary accent (Apple blue)
export const ACCENT_SOFT = '#E8F1FE';  // winner surface, soft highlights
export const ACCENT_LINE = '#B9DCFE';  // winner border
export const GREEN       = '#34C759';  // semantic positive
export const AMBER       = '#FF9F0A';  // semantic mid/warning
