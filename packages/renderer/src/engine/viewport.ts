import { Viewport } from 'pixi-viewport';
import type { Application } from 'pixi.js';

export interface DmViewportOptions {
  app: Application;
  worldWidth: number;
  worldHeight: number;
}

/** Thin adapter around pixi-viewport for camera pan/zoom. */
export class DmViewport {
  readonly viewport: Viewport;

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

  /** Resize the viewport to match new screen dimensions. */
  resize(screenWidth: number, screenHeight: number): void {
    this.viewport.resize(screenWidth, screenHeight);
  }

  /** Get the current zoom scale. */
  get scale(): number {
    return this.viewport.scale.x;
  }

  /** Set zoom level. */
  setZoom(scale: number): void {
    this.viewport.setZoom(scale, true);
  }

  /** Pan to center on a world coordinate. */
  centerOn(wx: number, wy: number): void {
    this.viewport.moveCenter(wx, wy);
  }

  /** Convert screen coordinates to world coordinates. */
  screenToWorld(sx: number, sy: number): { wx: number; wy: number } {
    const point = this.viewport.toWorld(sx, sy);
    return { wx: point.x, wy: point.y };
  }

  destroy(): void {
    this.viewport.destroy();
  }
}
