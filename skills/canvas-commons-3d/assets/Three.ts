// Three.js ↔ Canvas Commons bridge node. DROP-IN — copy as-is.
//
// A `Layout` that owns an offscreen WebGLRenderer. Each frame Canvas Commons calls
// draw(); we render the three.js scene into the renderer's detached canvas and blit
// it (drawImage) into the 2D canvas, sized/placed by THIS node's box. Because it's a
// Layout, the whole 3D viewport is a first-class 2D node — position/scale/fade it like
// any Rect, and nest 2D overlays as children (they draw on top, via super.draw()).
//
// Requires `three` in the project's node_modules (any recent version; dependency-free).
import {Layout, LayoutProps, initial, signal} from '@canvas-commons/2d';
import {SimpleSignal} from '@canvas-commons/core';
import {
  Camera,
  Color,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from 'three';

export interface ThreeProps extends LayoutProps {
  scene?: Scene;
  camera?: Camera;
  /** Supersample factor — renders the WebGL buffer at quality× node size. 2 = crisp. */
  quality?: number;
  /** Scene background; null/undefined leaves the WebGL buffer transparent. */
  background?: string;
  /** Orthographic half-extent (vertical). Ignored for perspective cameras. */
  zoom?: number;
}

export class Three extends Layout {
  @initial(2)
  @signal()
  public declare readonly quality: SimpleSignal<number, this>;

  @initial(null)
  @signal()
  public declare readonly camera: SimpleSignal<Camera | null, this>;

  @initial(null)
  @signal()
  public declare readonly scene: SimpleSignal<Scene | null, this>;

  @initial(null)
  @signal()
  public declare readonly background: SimpleSignal<string | null, this>;

  @initial(1)
  @signal()
  public declare readonly zoom: SimpleSignal<number, this>;

  private readonly renderer: WebGLRenderer;

  public constructor(props: ThreeProps) {
    super(props);
    this.renderer = new WebGLRenderer({
      canvas: document.createElement('canvas'),
      antialias: true,
      alpha: true, // transparent buffer → composites over the 2D scene below
      premultipliedAlpha: true,
    });
    this.renderer.setPixelRatio(1); // quality handles supersampling; keep ratio at 1
    this.renderer.setClearColor(0x000000, 0);
  }

  protected override draw(context: CanvasRenderingContext2D) {
    const size = this.size();
    const width = size.x;
    const height = size.y;
    const quality = this.quality();
    const scene = this.scene();
    const camera = this.camera();

    if (width > 0 && height > 0 && scene && camera) {
      const bg = this.background();
      scene.background = bg ? new Color(bg) : null;

      this.renderer.setSize(width * quality, height * quality, false);

      const ratio = width / height;
      if (camera instanceof PerspectiveCamera) {
        camera.aspect = ratio; // keep aspect locked to the node box every frame
        camera.updateProjectionMatrix();
      } else if (camera instanceof OrthographicCamera) {
        const scale = this.zoom() / 2;
        camera.left = -ratio * scale;
        camera.right = ratio * scale;
        camera.bottom = -scale;
        camera.top = scale;
        camera.updateProjectionMatrix();
      }

      this.renderer.render(scene, camera);

      context.save();
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(
        this.renderer.domElement,
        0, 0, width * quality, height * quality, // src: the supersampled buffer
        -width / 2, -height / 2, width, height, // dst: this node's box (origin-centred)
      );
      context.restore();
    }

    super.draw(context); // children (2D overlays) draw ON TOP of the 3D blit
  }

  public dispose() {
    this.renderer.dispose();
  }
}
