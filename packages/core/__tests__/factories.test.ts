import { describe, it, expect, beforeEach } from 'vitest';
import { createMap, createTileLayer, createObjectLayer, createImageLayer, createGroupLayer } from '../src/model/map-factory';
import { createTileset } from '../src/model/tileset-factory';
import { resetIdCounter } from '../src/model/id-generator';

beforeEach(() => {
  resetIdCounter();
});

describe('createMap', () => {
  it('creates a map with default settings', () => {
    const map = createMap();
    expect(map.name).toBe('Untitled Map');
    expect(map.orientation).toBe('isometric');
    expect(map.mapSize).toEqual({ width: 20, height: 20 });
    expect(map.tileSize).toEqual({ width: 64, height: 32 });
    expect(map.layers).toHaveLength(1);
    expect(map.layers[0].type).toBe('tile');
    expect(map.tilesets).toEqual([]);
  });

  it('accepts custom options', () => {
    const map = createMap({
      name: 'Test Map',
      mapSize: { width: 10, height: 10 },
      tileSize: { width: 128, height: 64 },
    });
    expect(map.name).toBe('Test Map');
    expect(map.mapSize).toEqual({ width: 10, height: 10 });
    expect(map.tileSize).toEqual({ width: 128, height: 64 });
  });

  it('assigns unique IDs', () => {
    const m1 = createMap();
    const m2 = createMap();
    expect(m1.id).not.toBe(m2.id);
  });

  it('throws on zero map dimensions', () => {
    expect(() => createMap({ mapSize: { width: 0, height: 10 } })).toThrow('must be positive');
    expect(() => createMap({ mapSize: { width: 10, height: 0 } })).toThrow('must be positive');
  });

  it('throws on negative map dimensions', () => {
    expect(() => createMap({ mapSize: { width: -1, height: 10 } })).toThrow('must be positive');
  });

  it('throws on zero tile dimensions', () => {
    expect(() => createMap({ tileSize: { width: 0, height: 32 } })).toThrow('must be positive');
    expect(() => createMap({ tileSize: { width: 64, height: 0 } })).toThrow('must be positive');
  });
});

describe('createTileLayer', () => {
  it('creates an empty tile layer with correct dimensions', () => {
    const layer = createTileLayer({ width: 10, height: 5 });
    expect(layer.type).toBe('tile');
    expect(layer.width).toBe(10);
    expect(layer.height).toBe(5);
    expect(layer.data).toBeInstanceOf(Uint32Array);
    expect(layer.data.length).toBe(50);
    expect(layer.data.every(v => v === 0)).toBe(true);
  });

  it('defaults to visible and unlocked', () => {
    const layer = createTileLayer({ width: 1, height: 1 });
    expect(layer.visible).toBe(true);
    expect(layer.locked).toBe(false);
    expect(layer.opacity).toBe(1);
  });

  it('throws on zero dimensions', () => {
    expect(() => createTileLayer({ width: 0, height: 5 })).toThrow('must be positive');
    expect(() => createTileLayer({ width: 5, height: 0 })).toThrow('must be positive');
  });

  it('throws on negative dimensions', () => {
    expect(() => createTileLayer({ width: -1, height: 5 })).toThrow('must be positive');
    expect(() => createTileLayer({ width: 5, height: -3 })).toThrow('must be positive');
  });
});

describe('createObjectLayer', () => {
  it('creates an empty object layer', () => {
    const layer = createObjectLayer();
    expect(layer.type).toBe('object');
    expect(layer.objects).toEqual([]);
  });
});

describe('createImageLayer', () => {
  it('creates an image layer with source', () => {
    const layer = createImageLayer({ imageSource: 'bg.png' });
    expect(layer.type).toBe('image');
    expect(layer.imageSource).toBe('bg.png');
  });
});

describe('createGroupLayer', () => {
  it('creates an empty group layer', () => {
    const layer = createGroupLayer({ name: 'My Group' });
    expect(layer.type).toBe('group');
    expect(layer.name).toBe('My Group');
    expect(layer.layers).toEqual([]);
  });
});

describe('createTileset', () => {
  it('calculates columns and tileCount from image dimensions', () => {
    const ts = createTileset({
      name: 'Terrain',
      imageSource: 'terrain.png',
      imageSize: { width: 256, height: 128 },
      tileSize: { width: 64, height: 32 },
    });
    expect(ts.name).toBe('Terrain');
    expect(ts.columns).toBe(4);    // 256 / 64
    expect(ts.tileCount).toBe(16); // 4 * 4 (128 / 32 = 4 rows)
    expect(ts.spacing).toBe(0);
    expect(ts.margin).toBe(0);
  });

  it('accounts for spacing and margin', () => {
    const ts = createTileset({
      name: 'Spaced',
      imageSource: 'spaced.png',
      imageSize: { width: 138, height: 70 },
      tileSize: { width: 64, height: 32 },
      spacing: 2,
      margin: 1,
    });
    // usableWidth = 138 - 2 + 2 = 138; cols = 138 / 66 = 2
    // usableHeight = 70 - 2 + 2 = 70; rows = 70 / 34 = 2
    expect(ts.columns).toBe(2);
    expect(ts.tileCount).toBe(4);
  });
});
