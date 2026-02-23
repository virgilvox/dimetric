import { Container, Graphics } from 'pixi.js';
import { gridToScreen } from '@dimetric/core';

export interface GridOverlayOptions {
  cols: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
  color?: number;
  alpha?: number;
  lineWidth?: number;
}

/** Renders a wireframe isometric diamond grid overlay. */
export class GridOverlayRenderer {
  readonly container: Container;
  private graphics: Graphics;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
  }

  /** Draw or redraw the grid. */
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

  destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
