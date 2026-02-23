import { describe, it, expect } from 'vitest';
import { resolveGid, remapTileData } from '../src/tmx/gid-utils';
import type { DmTilesetRef, DmTileset } from '@dimetric/core';

function makeTileset(id: string, name: string, tileCount: number): DmTileset {
  return {
    id, name, imageSource: '', imageSize: { width: 0, height: 0 },
    tileSize: { width: 32, height: 32 }, columns: 8, tileCount,
    spacing: 0, margin: 0, tiles: {},
  };
}

describe('resolveGid', () => {
  const tsA = makeTileset('a', 'A', 10);
  const tsB = makeTileset('b', 'B', 20);
  const refs: DmTilesetRef[] = [
    { firstGid: 1, tileset: tsA },
    { firstGid: 11, tileset: tsB },
  ];

  it('returns null for GID 0', () => {
    expect(resolveGid(0, refs)).toBeNull();
  });

  it('resolves GID in first tileset', () => {
    const result = resolveGid(1, refs);
    expect(result).toEqual({ tilesetRef: refs[0], localId: 0 });
  });

  it('resolves last tile in first tileset', () => {
    const result = resolveGid(10, refs);
    expect(result).toEqual({ tilesetRef: refs[0], localId: 9 });
  });

  it('resolves first tile in second tileset', () => {
    const result = resolveGid(11, refs);
    expect(result).toEqual({ tilesetRef: refs[1], localId: 0 });
  });

  it('resolves tile in second tileset', () => {
    const result = resolveGid(15, refs);
    expect(result).toEqual({ tilesetRef: refs[1], localId: 4 });
  });
});

describe('remapTileData', () => {
  const tsA = makeTileset('a', 'A', 10);

  it('remaps GIDs between different firstGid spaces', () => {
    const from: DmTilesetRef[] = [{ firstGid: 1, tileset: tsA }];
    const to: DmTilesetRef[] = [{ firstGid: 100, tileset: tsA }];
    const data = new Uint32Array([0, 1, 5, 10]);
    const result = remapTileData(data, from, to);
    expect(Array.from(result)).toEqual([0, 100, 104, 109]);
  });

  it('preserves flip flags during remap', () => {
    const from: DmTilesetRef[] = [{ firstGid: 1, tileset: tsA }];
    const to: DmTilesetRef[] = [{ firstGid: 50, tileset: tsA }];
    const HFLIP = 0x80000000;
    const data = new Uint32Array([(1 | HFLIP) >>> 0]);
    const result = remapTileData(data, from, to);
    expect(result[0]).toBe((50 | HFLIP) >>> 0);
  });
});
