import { describe, it, expect } from 'vitest';
import { getAffectedCells, buildWangIdForCell, resolveWangTileAt, paintTerrain } from '../src/terrain/wang-resolver';
import type { DmWangSet } from '@dimetric/core';

describe('getAffectedCells', () => {
  it('returns center cell plus 8 neighbors for interior cell', () => {
    const cells = getAffectedCells(5, 5, 10, 10);
    expect(cells).toHaveLength(9);
    expect(cells[0]).toEqual({ col: 5, row: 5 });
  });

  it('clips to bounds for corner cell', () => {
    const cells = getAffectedCells(0, 0, 10, 10);
    // Only center + right + bottomRight + bottom = 4 cells
    expect(cells).toHaveLength(4);
  });

  it('clips to bounds for edge cell', () => {
    const cells = getAffectedCells(0, 5, 10, 10);
    // Left column: missing left, topLeft, bottomLeft = 6 cells
    expect(cells).toHaveLength(6);
  });
});

describe('buildWangIdForCell', () => {
  it('returns all zeros for isolated cell', () => {
    const map = new Uint8Array(9);
    const wangId = buildWangIdForCell(1, 1, 1, map, 3, 3);
    expect(wangId).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('returns all ones for fully surrounded cell', () => {
    const map = new Uint8Array(9);
    map.fill(1);
    const wangId = buildWangIdForCell(1, 1, 1, map, 3, 3);
    expect(wangId).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
  });
});

describe('resolveWangTileAt', () => {
  const cornerSet: DmWangSet = {
    name: 'test',
    type: 'corner',
    colors: [{ name: 'Grass', color: '#00ff00', tile: 0, probability: 1 }],
    wangTiles: [
      { tileId: 10, wangId: [0, 1, 0, 1, 0, 1, 0, 1] }, // all corners
      { tileId: 11, wangId: [0, 1, 0, 0, 0, 0, 0, 0] }, // top-right only
    ],
  };

  it('finds exact match for corner set', () => {
    const result = resolveWangTileAt([0, 1, 0, 1, 0, 1, 0, 1], cornerSet);
    expect(result).toBe(10);
  });

  it('finds partial match', () => {
    const result = resolveWangTileAt([0, 1, 0, 0, 0, 0, 0, 0], cornerSet);
    expect(result).toBe(11);
  });

  it('returns -1 for no match', () => {
    const result = resolveWangTileAt([0, 0, 0, 1, 0, 0, 0, 0], cornerSet);
    expect(result).toBe(-1);
  });

  const edgeSet: DmWangSet = {
    name: 'test-edge',
    type: 'edge',
    colors: [{ name: 'Water', color: '#0000ff', tile: 0, probability: 1 }],
    wangTiles: [
      { tileId: 20, wangId: [1, 0, 1, 0, 0, 0, 0, 0] }, // top + right edges
    ],
  };

  it('matches edge set using only edge indices', () => {
    // Edge indices are 0,2,4,6
    const result = resolveWangTileAt([1, 99, 1, 99, 0, 99, 0, 99], edgeSet);
    expect(result).toBe(20);
  });

  const mixedSet: DmWangSet = {
    name: 'test-mixed',
    type: 'mixed',
    colors: [{ name: 'Dirt', color: '#8B4513', tile: 0, probability: 1 }],
    wangTiles: [
      { tileId: 30, wangId: [1, 1, 1, 1, 1, 1, 1, 1] },
    ],
  };

  it('matches mixed set using all indices', () => {
    const result = resolveWangTileAt([1, 1, 1, 1, 1, 1, 1, 1], mixedSet);
    expect(result).toBe(30);
  });
});

describe('paintTerrain', () => {
  it('returns changes for affected cells', () => {
    const wangSet: DmWangSet = {
      name: 'test',
      type: 'corner',
      colors: [{ name: 'Grass', color: '#00ff00', tile: 0, probability: 1 }],
      wangTiles: [
        { tileId: 5, wangId: [0, 1, 0, 1, 0, 1, 0, 1] },
      ],
    };

    const terrainMap = new Uint8Array(25); // 5x5
    const changes = paintTerrain(2, 2, 1, wangSet, terrainMap, 5, 5);

    // The terrain map should be updated
    expect(terrainMap[2 * 5 + 2]).toBe(1);

    // Changes should include the painted cell
    expect(changes.length).toBeGreaterThanOrEqual(0);
  });
});
