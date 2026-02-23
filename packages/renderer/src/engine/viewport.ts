import { Viewport } from 'pixi-viewport';
import type { Application } from 'pixi.js';

/**
 * Options for creating a {@link DmViewport}.
 */
export interface DmViewportOptions {
  /** The PixiJS Application to bind the viewport to. */
  app: Application;
  /** Total width of the world in pixels. */
  worldWidth: number;
  /** Total height of the world in pixels. */
  worldHeight: number;
}

/**
 * Thin adapter around `pixi-viewport` that provides camera pan/zoom functionality.
 * Configures drag, pinch, wheel, decelerate, and zoom clamping out of the box.
 *
 * @example
 * ```ts
 * const vp = new DmViewport({ app, worldWidth: 4000, worldHeight: 4000 });
 * app.stage.addChild(vp.viewport);
 * vp.centerOn(200, 300);
 * ```
 */
export class DmViewport {
  /** The underlying pixi-viewport instance. */
  readonly viewport: Viewport;

  /**
   * Create a new viewport adapter.
   *
   * @param options - Viewport configuration options.
   */
  constructor(options: DmViewportOptions) {
    const { app, worldWidth, worldHeight } = options;
    this.viewport = new Viewport({
      screenWidth: app.screen.width,
      screenHeight: app.screen.height,
      worldWidth,
      worldHeight,
      events: app.renderer.events,
    });

    this.viewport
      .drag()
      .pinch()
      .wheel()
      .decelerate()
      .clampZoom({ minScale: 0.1, maxScale: 10 });
  }

  /**
   * Resize the viewport to match new screen dimensions.
   *
   * @param screenWidth - New screen width in pixels.
   * @param screenHeight - New screen height in pixels.
   */
  resize(screenWidth: number, screenHeight: number): void {
    this.viewport.resize(screenWidth, screenHeight);
  }

  /**
   * Get the current zoom scale factor.
   *
   * @returns The viewport's x-axis scale value.
   */
  get scale(): number {
    return this.viewport.scale.x;
  }

  /**
   * Set the viewport zoom level.
   *
   * @param scale - The target zoom scale factor.
   */
  setZoom(scale: number): void {
    this.viewport.setZoom(scale, true);
  }

  /**
   * Pan the viewport to center on the given world coordinates.
   *
   * @param wx - World x-coordinate to center on.
   * @param wy - World y-coordinate to center on.
   */
  centerOn(wx: number, wy: number): void {
    this.viewport.moveCenter(wx, wy);
  }

  /**
   * Convert screen pixel coordinates to world coordinates.
   *
   * @param sx - Screen x-coordinate in pixels.
   * @param sy - Screen y-coordinate in pixels.
   * @returns An object with `wx` and `wy` world coordinates.
   */
  screenToWorld(sx: number, sy: number): { wx: number; wy: number } {
    const point = this.viewport.toWorld(sx, sy);
    return { wx: point.x, wy: point.y };
  }

  /** Destroy the viewport and release all associated resources. */
  destroy(): void {
    this.viewport.destroy();
  }
}
