import { Container, Graphics } from 'pixi.js';
import { gridToScreen } from '@dimetric/core';

/**
 * Options for drawing the isometric grid overlay.
 */
export interface GridOverlayOptions {
  /** Number of tile columns in the map. */
  cols: number;
  /** Number of tile rows in the map. */
  rows: number;
  /** Width of a single tile in pixels. */
  tileWidth: number;
  /** Height of a single tile in pixels. */
  tileHeight: number;
  /** Grid line color as a hex number. Defaults to `0x444466`. */
  color?: number;
  /** Grid line alpha transparency. Defaults to `0.3`. */
  alpha?: number;
  /** Grid line width in pixels. Defaults to `1`. */
  lineWidth?: number;
}

/**
 * Renders a wireframe isometric diamond grid overlay.
 * Draws row lines (top-left to bottom-right) and column lines (top-right to bottom-left).
 *
 * @example
 * ```ts
 * const grid = new GridOverlayRenderer();
 * grid.draw({ cols: 10, rows: 10, tileWidth: 64, tileHeight: 32 });
 * viewport.addChild(grid.container);
 * ```
 */
export class GridOverlayRenderer {
  /** The PixiJS container holding the grid graphics. */
  readonly container: Container;
  private graphics: Graphics;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
  }

  /**
   * Draw or redraw the isometric grid with the given dimensions and style.
   *
   * @param options - Grid dimensions and optional line styling.
   */
  draw(options: GridOverlayOptions): void {
    const { cols, rows, tileWidth, tileHeight, color = 0x444466, alpha = 0.3, lineWidth = 1 } = options;
    const g = this.graphics;
    g.clear();

    // Draw lines along rows (top-left to bottom-right direction)
    for (let r = 0; r <= rows; r++) {
      const start = gridToScreen(0, r, tileWidth, tileHeight);
      const end = gridToScreen(cols, r, tileWidth, tileHeight);
      g.moveTo(start.sx, start.sy);
      g.lineTo(end.sx, end.sy);
    }

    // Draw lines along columns (top-right to bottom-left direction)
    for (let c = 0; c <= cols; c++) {
      const start = gridToScreen(c, 0, tileWidth, tileHeight);
      const end = gridToScreen(c, rows, tileWidth, tileHeight);
      g.moveTo(start.sx, start.sy);
      g.lineTo(end.sx, end.sy);
    }

    g.stroke({ width: lineWidth, color, alpha });
  }

  /** Destroy the graphics and container, releasing GPU resources. */
  destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
