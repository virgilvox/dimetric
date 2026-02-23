import { Container, Sprite, type Texture } from 'pixi.js';
import { gridToScreen, extractGid, type DmTileLayer } from '@dimetric/core';

/** Renders a single DmTileLayer using a sprite pool. */
export class TileLayerRenderer {
  readonly container: Container;
  private sprites: Sprite[] = [];
  private tileWidth = 0;
  private tileHeight = 0;

  constructor() {
    this.container = new Container();
  }

  /**
   * Full rebuild: clear and recreate all tile sprites.
   * Called on initial load and when the entire layer changes.
   */
  rebuild(
    layer: DmTileLayer,
    tileWidth: number,
    tileHeight: number,
    tileTextures: Map<number, Texture>,
  ): void {
    this.clear();
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;

    for (let row = 0; row < layer.height; row++) {
      for (let col = 0; col < layer.width; col++) {
        const idx = row * layer.width + col;
        const rawGid = layer.data[idx];
        if (rawGid === 0) continue;

        const gid = extractGid(rawGid);
        const texture = tileTextures.get(gid);
        if (!texture) continue;

        const sprite = new Sprite(texture);
        const { sx, sy } = gridToScreen(col, row, tileWidth, tileHeight);
        // Position sprite so its bottom-center aligns with the tile diamond's top point
        sprite.anchor.set(0.5, 1);
        sprite.x = sx;
        sprite.y = sy + tileHeight / 2;
        this.container.addChild(sprite);
        this.sprites.push(sprite);
      }
    }

    this.container.visible = layer.visible;
    this.container.alpha = layer.opacity;
  }

  /** Update a single tile without full rebuild. */
  updateTile(
    _col: number,
    _row: number,
    _gid: number,
    layer: DmTileLayer,
    tileTextures: Map<number, Texture>,
  ): void {
    // For MVP, just do a full rebuild. Optimize later with sprite pool.
    this.rebuild(layer, this.tileWidth, this.tileHeight, tileTextures);
  }

  /** Set layer visibility. */
  setVisible(visible: boolean): void {
    this.container.visible = visible;
  }

  /** Set layer opacity. */
  setOpacity(opacity: number): void {
    this.container.alpha = opacity;
  }

  private clear(): void {
    for (const sprite of this.sprites) {
      sprite.destroy();
    }
    this.sprites = [];
    this.container.removeChildren();
  }

  destroy(): void {
    this.clear();
    this.container.destroy();
  }
}
