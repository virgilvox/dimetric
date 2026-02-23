import { describe, it, expect } from 'vitest';
import type { AseJsonResult, TpAtlasResult } from '@dimetric/formats';
import {
  inferTileSizeFromAtlas,
  atlasToTileset,
  isAseJsonResult,
} from '../src/import/atlas-to-tileset';

function makeAseAtlas(overrides: Partial<AseJsonResult> = {}): AseJsonResult {
  return {
    image: 'sprite.png',
    size: { w: 128, h: 64 },
    frames: [
      {
        index: 0,
        filename: 'sprite 0.ase',
        frame: { x: 0, y: 0, w: 32, h: 32 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 },
        sourceSize: { w: 32, h: 32 },
        duration: 100,
      },
      {
        index: 1,
        filename: 'sprite 1.ase',
        frame: { x: 32, y: 0, w: 32, h: 32 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 },
        sourceSize: { w: 32, h: 32 },
        duration: 150,
      },
      {
        index: 2,
        filename: 'sprite 2.ase',
        frame: { x: 64, y: 0, w: 32, h: 32 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 },
        sourceSize: { w: 32, h: 32 },
        duration: 200,
      },
      {
        index: 3,
        filename: 'sprite 3.ase',
        frame: { x: 96, y: 0, w: 32, h: 32 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 },
        sourceSize: { w: 32, h: 32 },
        duration: 100,
      },
    ],
    frameTags: [],
    slices: [],
    ...overrides,
  };
}

function makeTpAtlas(overrides: Partial<TpAtlasResult> = {}): TpAtlasResult {
  return {
    image: 'tileset.png',
    size: { w: 128, h: 64 },
    scale: 1,
    frames: [
      {
        filename: 'tile_0.png',
        frame: { x: 0, y: 0, w: 64, h: 32 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 64, h: 32 },
        sourceSize: { w: 64, h: 32 },
        pivot: { x: 0.5, y: 0.5 },
      },
      {
        filename: 'tile_1.png',
        frame: { x: 64, y: 0, w: 64, h: 32 },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: 64, h: 32 },
        sourceSize: { w: 64, h: 32 },
        pivot: { x: 0.5, y: 0.5 },
      },
    ],
    ...overrides,
  };
}

describe('isAseJsonResult', () => {
  it('returns true for Aseprite atlas', () => {
    expect(isAseJsonResult(makeAseAtlas())).toBe(true);
  });

  it('returns false for TexturePacker atlas', () => {
    expect(isAseJsonResult(makeTpAtlas())).toBe(false);
  });
});

describe('inferTileSizeFromAtlas', () => {
  it('returns first frame sourceSize for Aseprite atlas', () => {
    const atlas = makeAseAtlas();
    expect(inferTileSizeFromAtlas(atlas)).toEqual({ width: 32, height: 32 });
  });

  it('returns first frame sourceSize for TexturePacker atlas', () => {
    const atlas = makeTpAtlas();
    expect(inferTileSizeFromAtlas(atlas)).toEqual({ width: 64, height: 32 });
  });

  it('returns 32x32 fallback for empty frames', () => {
    const atlas = makeAseAtlas({ frames: [] });
    expect(inferTileSizeFromAtlas(atlas)).toEqual({ width: 32, height: 32 });
  });
});

describe('atlasToTileset', () => {
  it('creates correct grid from TexturePacker atlas', () => {
    const atlas = makeTpAtlas();
    const tileset = atlasToTileset({
      atlas,
      imageDataUrl: 'data:image/png;base64,abc',
      imageSize: { width: 128, height: 64 },
    });

    expect(tileset.name).toBe('tileset');
    expect(tileset.tileSize).toEqual({ width: 64, height: 32 });
    expect(tileset.columns).toBe(2);
    expect(tileset.tileCount).toBe(4); // 2 cols x 2 rows
    expect(tileset.imageSource).toBe('data:image/png;base64,abc');
  });

  it('maps Aseprite frameTags to tile animations', () => {
    const atlas = makeAseAtlas({
      frameTags: [
        { name: 'idle', from: 0, to: 1, direction: 'forward' },
        { name: 'walk', from: 2, to: 3, direction: 'forward' },
      ],
    });

    const tileset = atlasToTileset({
      atlas,
      imageDataUrl: 'data:image/png;base64,abc',
      imageSize: { width: 128, height: 64 },
    });

    // idle tag: frames 0-1
    expect(tileset.tiles[0]).toBeDefined();
    expect(tileset.tiles[0].animation).toEqual([
      { tileId: 0, duration: 100 },
      { tileId: 1, duration: 150 },
    ]);
    expect(tileset.tiles[0].properties?.animationName).toEqual({
      name: 'animationName',
      type: 'string',
      value: 'idle',
    });

    // walk tag: frames 2-3
    expect(tileset.tiles[2]).toBeDefined();
    expect(tileset.tiles[2].animation).toEqual([
      { tileId: 2, duration: 200 },
      { tileId: 3, duration: 100 },
    ]);
    expect(tileset.tiles[2].properties?.animationName).toEqual({
      name: 'animationName',
      type: 'string',
      value: 'walk',
    });
  });

  it('honors tileSizeOverride', () => {
    const atlas = makeTpAtlas();
    const tileset = atlasToTileset({
      atlas,
      imageDataUrl: 'data:image/png;base64,abc',
      imageSize: { width: 128, height: 64 },
      tileSizeOverride: { width: 32, height: 32 },
    });

    expect(tileset.tileSize).toEqual({ width: 32, height: 32 });
    expect(tileset.columns).toBe(4);
    expect(tileset.tileCount).toBe(8);
  });

  it('does not create animations for TexturePacker atlas', () => {
    const atlas = makeTpAtlas();
    const tileset = atlasToTileset({
      atlas,
      imageDataUrl: 'data:image/png;base64,abc',
      imageSize: { width: 128, height: 64 },
    });

    expect(Object.keys(tileset.tiles)).toHaveLength(0);
  });
});
