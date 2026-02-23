import type { DmTileset } from '@dimetric/core';
import { createTileset } from '@dimetric/core';
import type { AseJsonResult, TpAtlasResult } from '@dimetric/formats';

type AtlasResult = AseJsonResult | TpAtlasResult;

/** Type guard: returns true if the atlas is an Aseprite JSON result (has frameTags). */
export function isAseJsonResult(atlas: AtlasResult): atlas is AseJsonResult {
  return 'frameTags' in atlas;
}

/**
 * Infer tile dimensions from the first frame's sourceSize.
 * Falls back to 32x32 if no frames are present.
 */
export function inferTileSizeFromAtlas(atlas: AtlasResult): { width: number; height: number } {
  if (atlas.frames.length === 0) {
    return { width: 32, height: 32 };
  }
  const first = atlas.frames[0];
  return { width: first.sourceSize.w, height: first.sourceSize.h };
}

export interface AtlasToTilesetOptions {
  atlas: AtlasResult;
  imageDataUrl: string;
  imageSize: { width: number; height: number };
  tileSizeOverride?: { width: number; height: number };
}

/**
 * Convert an Aseprite or TexturePacker atlas into a DmTileset.
 *
 * Uses createTileset from @dimetric/core for grid calculation.
 * When the atlas is Aseprite and has frameTags, maps each tag to
 * a tile animation on the first frame of the tag.
 */
export function atlasToTileset(options: AtlasToTilesetOptions): DmTileset {
  const { atlas, imageDataUrl, imageSize, tileSizeOverride } = options;

  const tileSize = tileSizeOverride ?? inferTileSizeFromAtlas(atlas);
  const name = atlas.image.replace(/\.[^.]+$/, '') || 'Atlas';

  const tileset = createTileset({
    name,
    imageSource: imageDataUrl,
    imageSize: { width: imageSize.width, height: imageSize.height },
    tileSize: { width: tileSize.width, height: tileSize.height },
  });

  // Map Aseprite frameTags to tile animations
  if (isAseJsonResult(atlas) && atlas.frameTags.length > 0) {
    for (const tag of atlas.frameTags) {
      // Ensure the first frame index is within tile count
      if (tag.from >= tileset.tileCount) continue;

      const animation = [];
      for (let i = tag.from; i <= Math.min(tag.to, tileset.tileCount - 1); i++) {
        const frame = atlas.frames[i];
        animation.push({
          tileId: i,
          duration: frame?.duration ?? 100,
        });
      }

      tileset.tiles[tag.from] = {
        localId: tag.from,
        animation,
        properties: {
          animationName: { name: 'animationName', type: 'string', value: tag.name },
        },
      };
    }
  }

  return tileset;
}
