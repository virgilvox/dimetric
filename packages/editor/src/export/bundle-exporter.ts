import type { DmMap } from '@dimetric/core';

export interface GameBundle {
  _format: 'dimetric-bundle';
  _version: 1;
  maps: GameBundleMap[];
  tilesets: GameBundleTileset[];
}

interface GameBundleMap {
  id: string;
  name: string;
  orientation: string;
  mapSize: { width: number; height: number };
  tileSize: { width: number; height: number };
  layers: any[];
  tilesetRefs: Array<{ firstGid: number; tilesetId: string }>;
}

interface GameBundleTileset {
  id: string;
  name: string;
  tileSize: { width: number; height: number };
  columns: number;
  tileCount: number;
  imageBase64: string;
  tiles: Record<number, any>;
}

/**
 * Export a map and its tilesets as a self-contained JSON bundle.
 */
export function exportAsBundle(map: DmMap): GameBundle {
  const tilesets: GameBundleTileset[] = map.tilesets.map(ref => ({
    id: ref.tileset.id,
    name: ref.tileset.name,
    tileSize: ref.tileset.tileSize,
    columns: ref.tileset.columns,
    tileCount: ref.tileset.tileCount,
    imageBase64: ref.tileset.imageSource,
    tiles: ref.tileset.tiles,
  }));

  const bundleMap: GameBundleMap = {
    id: map.id,
    name: map.name,
    orientation: map.orientation,
    mapSize: map.mapSize,
    tileSize: map.tileSize,
    layers: map.layers.map(layer => {
      if (layer.type === 'tile') {
        return {
          ...layer,
          data: Array.from(layer.data),
        };
      }
      return layer;
    }),
    tilesetRefs: map.tilesets.map(ref => ({
      firstGid: ref.firstGid,
      tilesetId: ref.tileset.id,
    })),
  };

  return {
    _format: 'dimetric-bundle',
    _version: 1,
    maps: [bundleMap],
    tilesets,
  };
}
