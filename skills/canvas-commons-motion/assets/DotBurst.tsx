// DotBurst — the "thinking / analyzing" signature motif.
//
// Seen in the AI-agent launch reel: a ring of dots collapses toward a center
// point, then explodes into a fine radial starburst. Pair it with a counter
// that ticks up on the SAME tween (see references/signature-motifs.md).
//
// One public signal — `progress` (0 → 1) — drives all three phases. Tween it
// with IN_OUT and bind the counter to the same progress so they peak together.
//
//   import {DotBurst} from './DotBurst';
//   const burst = createRef<DotBurst>();
//   view.add(<DotBurst ref={burst} rays={56} color={REEL_BLUE} ringRadius={90} rayLength={260} />);
//   yield* burst().progress(1, 1.4, IN_OUT);
//
import {Node, NodeProps, initial, signal} from '@canvas-commons/2d';
import {SimpleSignal, SignalValue, clampRemap} from '@canvas-commons/core';

export interface DotBurstProps extends NodeProps {
  progress?: SignalValue<number>;
  rays?: SignalValue<number>;        // number of dots / rays around the ring
  ringRadius?: SignalValue<number>;
  rayLength?: SignalValue<number>;
  dotRadius?: SignalValue<number>;
  color?: SignalValue<string>;
  lineWidth?: SignalValue<number>;
}

export class DotBurst extends Node {
  @initial(0)   @signal() public declare readonly progress:   SimpleSignal<number, this>;
  @initial(48)  @signal() public declare readonly rays:       SimpleSignal<number, this>;
  @initial(90)  @signal() public declare readonly ringRadius: SimpleSignal<number, this>;
  @initial(220) @signal() public declare readonly rayLength:  SimpleSignal<number, this>;
  @initial(3)   @signal() public declare readonly dotRadius:  SimpleSignal<number, this>;
  @initial('#1F3BFF') @signal() public declare readonly color: SimpleSignal<string, this>;
  @initial(2)   @signal() public declare readonly lineWidth:  SimpleSignal<number, this>;

  public constructor(props: DotBurstProps) {
    super(props);
  }

  protected override draw(context: CanvasRenderingContext2D) {
    const p = this.progress();
    const n = Math.max(1, Math.round(this.rays()));
    const R = this.ringRadius();
    const L = this.rayLength();
    const col = this.color();

    // Phase split — all from the single progress signal:
    //   contract: 0.00 → 0.40   dots ride from the ring inward to the center
    //   burst   : 0.45 → 1.00   thin rays extend outward
    //   dotFade : 0.40 → 0.60   dots fade as the rays take over
    const contract = clampRemap(0, 0.4, 0, 1, p);
    const burst    = clampRemap(0.45, 1, 0, 1, p);
    const dotAlpha = clampRemap(0.4, 0.6, 1, 0, p);

    context.save();
    context.fillStyle = col;
    context.strokeStyle = col;
    context.lineWidth = this.lineWidth();
    context.lineCap = 'round';

    const dr = R * (1 - contract);      // current dot radius from center
    const inner = R * 0.25;             // rays start just outside center
    const outer = inner + L * burst;    // rays grow to rayLength

    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const cos = Math.cos(a), sin = Math.sin(a);

      if (burst > 0) {
        context.globalAlpha = burst;
        context.beginPath();
        context.moveTo(cos * inner, sin * inner);
        context.lineTo(cos * outer, sin * outer);
        context.stroke();
      }

      if (dotAlpha > 0) {
        context.globalAlpha = dotAlpha;
        context.beginPath();
        context.arc(cos * dr, sin * dr, this.dotRadius(), 0, Math.PI * 2);
        context.fill();
      }
    }

    context.restore();
    super.draw(context); // render any children (e.g. a centered counter)
  }
}
