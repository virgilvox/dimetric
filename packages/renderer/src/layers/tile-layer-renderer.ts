import { Container, Sprite, type Texture } from 'pixi.js';
import { gridToScreen, extractGid, extractFlipFlags, type DmTileLayer } from '@dimetric/core';

/**
 * Renders a single {@link DmTileLayer} as PixiJS sprites.
 * Creates one sprite per non-empty tile and applies Tiled-compatible flip flags.
 *
 * @example
 * ```ts
 * const renderer = new TileLayerRenderer();
 * renderer.rebuild(layer, 64, 32, tileTextures);
 * parentContainer.addChild(renderer.container);
 * ```
 */
export class TileLayerRenderer {
  /** The PixiJS container holding all tile sprites for this layer. */
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
   *
   * @param layer - The tile layer data model containing the GID grid.
   * @param tileWidth - Width of a single tile in pixels.
   * @param tileHeight - Height of a single tile in pixels.
   * @param tileTextures - Map from global tile ID (GID) to PixiJS Texture.
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

        // Apply flip flags per Tiled convention
        const flags = extractFlipFlags(rawGid);
        if (flags.diagonal) {
          // Diagonal flip = rotate 90° CW + flip horizontal
          sprite.rotation = Math.PI / 2;
          sprite.scale.x = flags.horizontal ? 1 : -1;
          sprite.scale.y = flags.vertical ? -1 : 1;
        } else {
          sprite.scale.x = flags.horizontal ? -1 : 1;
          sprite.scale.y = flags.vertical ? -1 : 1;
        }

        this.container.addChild(sprite);
        this.sprites.push(sprite);
      }
    }

    this.container.visible = layer.visible;
    this.container.alpha = layer.opacity;
  }

  /**
   * Update a single tile at the given grid position.
   * Currently performs a full rebuild; will be optimized with sprite pooling later.
   *
   * @param _col - Column index of the tile to update.
   * @param _row - Row index of the tile to update.
   * @param _gid - The new global tile ID for the cell.
   * @param layer - The full tile layer data (used for rebuild).
   * @param tileTextures - Map from global tile ID (GID) to PixiJS Texture.
   */
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

  /**
   * Set the visibility of this tile layer.
   *
   * @param visible - Whether the layer should be visible.
   */
  setVisible(visible: boolean): void {
    this.container.visible = visible;
  }

  /**
   * Set the opacity of this tile layer.
   *
   * @param opacity - Opacity value from 0 (fully transparent) to 1 (fully opaque).
   */
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

  /** Destroy all sprites and the container, releasing GPU resources. */
  destroy(): void {
    this.clear();
    this.container.destroy();
  }
}
