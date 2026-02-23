import type { DmViewport } from './viewport';

/**
 * Snapshot of the current camera position and zoom level.
 * Exposed to the editor UI for display purposes.
 */
export interface CameraState {
  /** World x-coordinate of the camera center. */
  x: number;
  /** World y-coordinate of the camera center. */
  y: number;
  /** Current zoom scale factor. */
  zoom: number;
}

/**
 * High-level camera that delegates pan, zoom, and coordinate conversion
 * to the underlying {@link DmViewport} adapter.
 *
 * @example
 * ```ts
 * const camera = new DmCamera();
 * camera.attach(viewport);
 * camera.panTo(100, 200);
 * camera.zoomIn();
 * const { wx, wy } = camera.screenToWorld(400, 300);
 * ```
 */
export class DmCamera {
  private dmViewport: DmViewport | null = null;

  /**
   * Attach this camera to a viewport adapter.
   *
   * @param viewport - The viewport to delegate camera operations to.
   */
  attach(viewport: DmViewport): void {
    this.dmViewport = viewport;
  }

  /** Detach the camera from its current viewport. */
  detach(): void {
    this.dmViewport = null;
  }

  /**
   * Get the current camera state (position and zoom).
   *
   * @returns A {@link CameraState} snapshot. Returns origin with zoom 1 if no viewport is attached.
   */
  getState(): CameraState {
    if (!this.dmViewport) return { x: 0, y: 0, zoom: 1 };
    const vp = this.dmViewport.viewport;
    return {
      x: vp.center.x,
      y: vp.center.y,
      zoom: this.dmViewport.scale,
    };
  }

  /**
   * Pan the camera to center on the given world coordinates.
   *
   * @param wx - Target world x-coordinate.
   * @param wy - Target world y-coordinate.
   */
  panTo(wx: number, wy: number): void {
    this.dmViewport?.centerOn(wx, wy);
  }

  /**
   * Set the camera zoom to an absolute scale value.
   *
   * @param scale - The zoom scale factor (e.g., 1.0 = 100%, 2.0 = 200%).
   */
  setZoom(scale: number): void {
    this.dmViewport?.setZoom(scale);
  }

  /**
   * Zoom in by multiplying the current scale by the given factor.
   *
   * @param factor - The multiplier to apply. Defaults to `1.25`.
   */
  zoomIn(factor = 1.25): void {
    if (!this.dmViewport) return;
    this.dmViewport.setZoom(this.dmViewport.scale * factor);
  }

  /**
   * Zoom out by dividing the current scale by the given factor.
   *
   * @param factor - The divisor to apply. Defaults to `1.25`.
   */
  zoomOut(factor = 1.25): void {
    if (!this.dmViewport) return;
    this.dmViewport.setZoom(this.dmViewport.scale / factor);
  }

  /**
   * Convert screen pixel coordinates to world coordinates.
   *
   * @param sx - Screen x-coordinate in pixels.
   * @param sy - Screen y-coordinate in pixels.
   * @returns An object with `wx` and `wy` world coordinates. Falls back to identity if no viewport is attached.
   */
  screenToWorld(sx: number, sy: number): { wx: number; wy: number } {
    if (!this.dmViewport) return { wx: sx, wy: sy };
    return this.dmViewport.screenToWorld(sx, sy);
  }
}
