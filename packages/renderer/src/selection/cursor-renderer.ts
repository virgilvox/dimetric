import { Container, Sprite, type Texture } from 'pixi.js';
import { gridToScreen, type FlipFlags } from '@dimetric/core';

/**
 * Renders a semi-transparent ghost tile sprite at the cursor position.
 * Shows a preview of the tile that will be placed when the user clicks.
 *
 * @example
 * ```ts
 * const cursor = new CursorRenderer();
 * cursor.setTileSize(64, 32);
 * cursor.setTexture(tileTexture);
 * cursor.moveTo(3, 5);
 * ```
 */
export class CursorRenderer {
  /** The PixiJS container holding the cursor sprite. */
  readonly container: Container;
  private sprite: Sprite | null = null;
  private tileWidth = 0;
  private tileHeight = 0;

  constructor() {
    this.container = new Container();
    this.container.alpha = 0.5;
  }

  /**
   * Set the tile dimensions used for positioning the cursor sprite.
   *
   * @param tileWidth - Width of a single tile in pixels.
   * @param tileHeight - Height of a single tile in pixels.
   */
  setTileSize(tileWidth: number, tileHeight: number): void {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
  }

  /**
   * Set the texture shown at the cursor position. Pass `null` to hide the cursor sprite.
   *
   * @param texture - The tile texture to display, or `null` to hide.
   */
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

  /**
   * Move the cursor ghost sprite to the given grid cell.
   *
   * @param col - Grid column index.
   * @param row - Grid row index.
   */
  moveTo(col: number, row: number): void {
    if (!this.sprite) return;
    const { sx, sy } = gridToScreen(col, row, this.tileWidth, this.tileHeight);
    this.sprite.x = sx;
    this.sprite.y = sy + this.tileHeight / 2;
    this.sprite.visible = true;
  }

  /**
   * Apply flip flags to the cursor ghost sprite by adjusting scale and rotation.
   *
   * @param flags - The flip flags to apply (horizontal, vertical, diagonal).
   */
  setFlipFlags(flags: FlipFlags): void {
    if (!this.sprite) return;
    this.sprite.scale.x = flags.horizontal ? -1 : 1;
    this.sprite.scale.y = flags.vertical ? -1 : 1;
    // Diagonal flip in Tiled corresponds to a transpose (90-degree rotation component)
    // Combined with H/V it produces 90/180/270 CW rotations
    if (flags.diagonal) {
      // Diagonal flag adds a 90 CW rotation
      this.sprite.rotation = Math.PI / 2;
    } else {
      this.sprite.rotation = 0;
    }
  }

  /** Hide the cursor ghost sprite. */
  hide(): void {
    if (this.sprite) this.sprite.visible = false;
  }

  /** Destroy the cursor sprite and container, releasing GPU resources. */
  destroy(): void {
    this.sprite?.destroy();
    this.container.destroy();
  }
}
