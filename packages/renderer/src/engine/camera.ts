import type { DmViewport } from './viewport';

/** Camera state exposed to the editor UI. */
export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

/** High-level camera that delegates to the viewport adapter. */
export class DmCamera {
  private dmViewport: DmViewport | null = null;

  attach(viewport: DmViewport): void {
    this.dmViewport = viewport;
  }

  detach(): void {
    this.dmViewport = null;
  }

  /** Get current camera state. */
  getState(): CameraState {
    if (!this.dmViewport) return { x: 0, y: 0, zoom: 1 };
    const vp = this.dmViewport.viewport;
    return {
      x: vp.center.x,
      y: vp.center.y,
      zoom: this.dmViewport.scale,
    };
  }

  /** Pan to a world coordinate. */
  panTo(wx: number, wy: number): void {
    this.dmViewport?.centerOn(wx, wy);
  }

  /** Set zoom level. */
  setZoom(scale: number): void {
    this.dmViewport?.setZoom(scale);
  }

  /** Zoom in by a multiplier. */
  zoomIn(factor = 1.25): void {
    if (!this.dmViewport) return;
    this.dmViewport.setZoom(this.dmViewport.scale * factor);
  }

  /** Zoom out by a multiplier. */
  zoomOut(factor = 1.25): void {
    if (!this.dmViewport) return;
    this.dmViewport.setZoom(this.dmViewport.scale / factor);
  }

  /** Convert screen pixel coords to world coords. */
  screenToWorld(sx: number, sy: number): { wx: number; wy: number } {
    if (!this.dmViewport) return { wx: sx, wy: sy };
    return this.dmViewport.screenToWorld(sx, sy);
  }
}
