// Bake a text label (with a vertical gradient + optional pill background) into a
// three.js CanvasTexture, crisp at scale. DROP-IN — tune fontPx/pad/colours.
//
// Returns the texture AND its aspect (w/h) so you can size a PlaneGeometry to match:
//   const {texture, aspect} = makeLabelTexture('two', '#38BDF8', '#1D4ED8');
//   const geo = new THREE.PlaneGeometry(worldHeight * aspect, worldHeight);
//   const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, ... });
import * as THREE from 'three';

const FONT = (px: number) =>
  `800 ${px}px "Plus Jakarta Sans", "Geist", system-ui, sans-serif`;
const INK = '#FFFFFF'; // label colour

export function makeLabelTexture(
  text: string,
  colorTop: string,
  colorBottom: string,
  opts: {fontPx?: number; padX?: number; padY?: number; pill?: boolean} = {},
): {texture: THREE.CanvasTexture; aspect: number} {
  const fontPx = opts.fontPx ?? 360; // bake LARGE → mipmaps keep it crisp when small
  const padX = opts.padX ?? 150;
  const padY = opts.padY ?? 120;
  const pill = opts.pill ?? true;

  const measure = document.createElement('canvas').getContext('2d')!;
  measure.font = FONT(fontPx);
  const textW = measure.measureText(text).width;

  const h = Math.ceil(fontPx + padY * 2);
  const w = Math.max(Math.ceil(textW + padX * 2), pill ? h : 0); // ≥ h → short words become circles

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // paint() is reusable so we can repaint once the webfont resolves (see below).
  const paint = () => {
    ctx.clearRect(0, 0, w, h);
    if (pill) {
      const grad = ctx.createLinearGradient(0, 0, 0, h); // top → bottom (canvas top = plane top)
      grad.addColorStop(0, colorTop);
      grad.addColorStop(1, colorBottom);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, h / 2); // stadium / circle for short words
      ctx.fill();
      ctx.fillStyle = INK;
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, colorTop);
      grad.addColorStop(1, colorBottom);
      ctx.fillStyle = grad; // gradient-filled glyphs, no pill
    }
    ctx.font = FONT(fontPx);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2 + fontPx * 0.04); // tiny baseline nudge for optical centre
  };
  paint();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; // correct gamma for sRGB colours
  texture.anisotropy = 8; // sharp at grazing angles (tilted cards)
  texture.minFilter = THREE.LinearMipmapLinearFilter; // mipmaps → crisp when scaled down
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  // First paint may use the FALLBACK face (webfont not loaded yet) → repaint on ready.
  if (typeof document !== 'undefined' && (document as any).fonts) {
    (document as any).fonts.ready.then(() => {
      paint();
      texture.needsUpdate = true;
    });
  }

  return {texture, aspect: w / h};
}
