import { describe, it, expect } from 'vitest';
import { exportAsBundle } from '../src/export/bundle-exporter';
import type { DmMap } from '@dimetric/core';

function createTestMap(): DmMap {
  return {
    id: 'test-map',
    name: 'Test Map',
    orientation: 'isometric',
    renderOrder: 'right-down',
    mapSize: { width: 5, height: 5 },
    tileSize: { width: 64, height: 32 },
    layers: [
      {
        id: 'layer-1',
        name: 'Ground',
        type: 'tile',
        visible: true,
        locked: false,
        opacity: 1,
        offset: { x: 0, y: 0 },
        width: 5,
        height: 5,
        data: new Uint32Array(25).fill(1),
      },
    ],
    tilesets: [
      {
        firstGid: 1,
        tileset: {
          id: 'ts-1',
          name: 'Test Tileset',
          imageSource: 'data:image/png;base64,abc123',
          imageSize: { width: 128, height: 64 },
          tileSize: { width: 64, height: 32 },
          columns: 2,
          tileCount: 4,
          spacing: 0,
          margin: 0,
          tiles: {},
        },
      },
    ],
  };
}

describe('exportAsBundle', () => {
  it('produces valid bundle structure', () => {
    const map = createTestMap();
    const bundle = exportAsBundle(map);

    expect(bundle._format).toBe('dimetric-bundle');
    expect(bundle._version).toBe(1);
    expect(bundle.maps).toHaveLength(1);
    expect(bundle.tilesets).toHaveLength(1);
  });

  it('includes map data as plain arrays', () => {
    const map = createTestMap();
    const bundle = exportAsBundle(map);

    const bundleMap = bundle.maps[0];
    expect(bundleMap.id).toBe('test-map');
    expect(bundleMap.layers[0].data).toEqual(expect.any(Array));
    expect(bundleMap.layers[0].data).toHaveLength(25);
  });

  it('includes tileset image as base64', () => {
    const map = createTestMap();
    const bundle = exportAsBundle(map);

    expect(bundle.tilesets[0].imageBase64).toBe('data:image/png;base64,abc123');
  });

  it('maps tileset refs correctly', () => {
    const map = createTestMap();
    const bundle = exportAsBundle(map);

    expect(bundle.maps[0].tilesetRefs).toEqual([
      { firstGid: 1, tilesetId: 'ts-1' },
    ]);
  });
});
