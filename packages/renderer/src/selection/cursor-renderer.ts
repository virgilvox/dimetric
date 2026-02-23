import { Container, Sprite, type Texture } from 'pixi.js';
import { gridToScreen } from '@dimetric/core';

/** Renders a ghost tile sprite at the cursor position. */
export class CursorRenderer {
  readonly container: Container;
  private sprite: Sprite | null = null;
  private tileWidth = 0;
  private tileHeight = 0;

  constructor() {
    this.container = new Container();
    this.container.alpha = 0.5;
  }

  setTileSize(tileWidth: number, tileHeight: number): void {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  /** Set the texture shown at cursor. Pass null to hide. */
  setTexture(texture: Texture | null): void {
    if (!texture) {
      if (this.sprite) {
        this.sprite.visible = false;
      }
      return;
    }
    if (!this.sprite) {
      this.sprite = new Sprite(texture);
      this.sprite.anchor.set(0.5, 1);
      this.container.addChild(this.sprite);
    } else {
      this.sprite.texture = texture;
      this.sprite.visible = true;
    }
  }

  /** Move cursor ghost to a grid cell. */
  moveTo(col: number, row: number): void {
    if (!this.sprite) return;
    const { sx, sy } = gridToScreen(col, row, this.tileWidth, this.tileHeight);
    this.sprite.x = sx;
    this.sprite.y = sy + this.tileHeight / 2;
    this.sprite.visible = true;
  }

  hide(): void {
    if (this.sprite) this.sprite.visible = false;
  }

  destroy(): void {
    this.sprite?.destroy();
    this.container.destroy();
  }
}
