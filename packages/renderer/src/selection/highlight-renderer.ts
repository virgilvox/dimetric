import { Container, Graphics } from 'pixi.js';
import { gridToScreen } from '@dimetric/core';

/**
 * Renders a translucent diamond highlight overlay on a hovered tile cell.
 * Used in the editor to indicate which tile the cursor is over.
 *
 * @example
 * ```ts
 * const highlight = new HighlightRenderer();
 * highlight.setTileSize(64, 32);
 * highlight.show(3, 5);
 * ```
 */
export class HighlightRenderer {
  /** The PixiJS container holding the highlight graphics. */
  readonly container: Container;
  private graphics: Graphics;
  private tileWidth = 0;
  private tileHeight = 0;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
  }

  /**
   * Set the tile dimensions used for computing the diamond shape.
   *
   * @param tileWidth - Width of a single tile in pixels.
   * @param tileHeight - Height of a single tile in pixels.
   */
  setTileSize(tileWidth: number, tileHeight: number): void {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  /**
   * Show a diamond highlight on the given grid cell.
   *
   * @param col - Grid column index.
   * @param row - Grid row index.
   */
  show(col: number, row: number): void {
    const { sx, sy } = gridToScreen(col, row, this.tileWidth, this.tileHeight);
    const hw = this.tileWidth / 2;
    const hh = this.tileHeight / 2;

    this.graphics.clear();
    this.graphics.moveTo(sx, sy);
    this.graphics.lineTo(sx + hw, sy + hh);
    this.graphics.lineTo(sx, sy + this.tileHeight);
    this.graphics.lineTo(sx - hw, sy + hh);
    this.graphics.closePath();
    this.graphics.fill({ color: 0xffffff, alpha: 0.15 });
    this.graphics.stroke({ width: 1, color: 0xffffff, alpha: 0.5 });
    this.container.visible = true;
  }

  /** Hide the highlight overlay and clear the graphics. */
  hide(): void {
    this.graphics.clear();
    this.container.visible = false;
  }

  /** Destroy the graphics and container, releasing GPU resources. */
  destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
