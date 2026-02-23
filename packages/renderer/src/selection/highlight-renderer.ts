import { Container, Graphics } from 'pixi.js';
import { gridToScreen } from '@dimetric/core';

/** Renders a highlight overlay on the hovered tile. */
export class HighlightRenderer {
  readonly container: Container;
  private graphics: Graphics;
  private tileWidth = 0;
  private tileHeight = 0;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
  }

  setTileSize(tileWidth: number, tileHeight: number): void {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  /** Show a diamond highlight on the given grid cell. */
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

  hide(): void {
    this.graphics.clear();
    this.container.visible = false;
  }

  destroy(): void {
    this.graphics.destroy();
    this.container.destroy();
  }
}
