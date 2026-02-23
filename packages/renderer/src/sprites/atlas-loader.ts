import { Texture, Rectangle } from 'pixi.js';
import type { DmTileset, DmTilesetRef } from '@dimetric/core';

/**
 * Slice a tileset's base texture into individual tile textures.
 * Returns a Map from global tile ID (GID) to Texture.
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

/** Build a combined GID -> Texture map from all tileset refs. */
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
