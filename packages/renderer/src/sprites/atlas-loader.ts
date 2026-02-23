import { Texture, Rectangle } from 'pixi.js';
import type { DmTileset, DmTilesetRef } from '@dimetric/core';

/**
 * Slice a tileset's base texture into individual tile textures.
 * Respects tileset spacing and margin when computing frame rectangles.
 *
 * @param baseTexture - The full tileset image as a PixiJS Texture.
 * @param tileset - The tileset metadata containing tile size, columns, count, spacing, and margin.
 * @param firstGid - The first global tile ID assigned to this tileset.
 * @returns A Map from global tile ID (GID) to individual tile Texture.
 *
 * @example
 * ```ts
 * const textures = sliceTilesetTextures(baseTexture, tileset, 1);
 * const tile5 = textures.get(5);
 * ```
 */
export function sliceTilesetTextures(
  baseTexture: Texture,
  tileset: DmTileset,
  firstGid: number,
): Map<number, Texture> {
  const textures = new Map<number, Texture>();
  const { tileSize, columns, tileCount, spacing, margin } = tileset;

  for (let i = 0; i < tileCount; i++) {
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = margin + col * (tileSize.width + spacing);
    const y = margin + row * (tileSize.height + spacing);
    const frame = new Rectangle(x, y, tileSize.width, tileSize.height);
    const texture = new Texture({ source: baseTexture.source, frame });
    textures.set(firstGid + i, texture);
  }

  return textures;
}

/**
 * Build a combined GID-to-Texture map from all loaded tileset references.
 * Merges sliced textures from every tileset into a single lookup map.
 *
 * @param tilesetTextures - Map from tileset ID to its base texture and tileset reference.
 * @returns A unified Map from global tile ID (GID) to PixiJS Texture.
 *
 * @example
 * ```ts
 * const combined = buildTileTextureMap(loadedTilesets);
 * renderer.setTileTextures(combined);
 * ```
 */
export function buildTileTextureMap(
  tilesetTextures: Map<string, { baseTexture: Texture; ref: DmTilesetRef }>,
): Map<number, Texture> {
  const combined = new Map<number, Texture>();
  for (const { baseTexture, ref } of tilesetTextures.values()) {
    const sliced = sliceTilesetTextures(baseTexture, ref.tileset, ref.firstGid);
    for (const [gid, tex] of sliced) {
      combined.set(gid, tex);
    }
  }
  return combined;
}
