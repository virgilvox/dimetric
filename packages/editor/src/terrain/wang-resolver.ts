import type { DmWangSet, GridCoord } from '@dimetric/core';

/**
 * Wang ID indices: the 8-element wangId array follows Tiled convention:
 * [top, topRight, right, bottomRight, bottom, bottomLeft, left, topLeft]
 * For corner sets, only indices 1,3,5,7 matter.
 * For edge sets, only indices 0,2,4,6 matter.
 * For mixed sets, all 8 matter.
 */

const NEIGHBOR_OFFSETS: readonly GridCoord[] = [
  { col: 0, row: -1 },  // top (N)
  { col: 1, row: -1 },  // top-right (NE)
  { col: 1, row: 0 },   // right (E)
  { col: 1, row: 1 },   // bottom-right (SE)
  { col: 0, row: 1 },   // bottom (S)
  { col: -1, row: 1 },  // bottom-left (SW)
  { col: -1, row: 0 },  // left (W)
  { col: -1, row: -1 }, // top-left (NW)
];

/**
 * Get the list of neighbor cells that would be affected when painting
 * a terrain color at a given cell.
 * Returns the cell itself plus all 8 neighbors (that are in bounds).
 */
export function getAffectedCells(
  col: number,
  row: number,
  width: number,
  height: number,
): GridCoord[] {
  const cells: GridCoord[] = [{ col, row }];
  for (const offset of NEIGHBOR_OFFSETS) {
    const nc = col + offset.col;
    const nr = row + offset.row;
    if (nc >= 0 && nc < width && nr >= 0 && nr < height) {
      cells.push({ col: nc, row: nr });
    }
  }
  return cells;
}

/**
 * Build a wang ID for a cell based on which of its neighbors have the given terrain color.
 * Returns an 8-element array of color indices (0 = no terrain, colorIndex = has terrain).
 */
export function buildWangIdForCell(
  col: number,
  row: number,
  colorIndex: number,
  terrainMap: Uint8Array,
  width: number,
  height: number,
): number[] {
  const wangId = [0, 0, 0, 0, 0, 0, 0, 0];

  for (let i = 0; i < NEIGHBOR_OFFSETS.length; i++) {
    const nc = col + NEIGHBOR_OFFSETS[i].col;
    const nr = row + NEIGHBOR_OFFSETS[i].row;
    if (nc >= 0 && nc < width && nr >= 0 && nr < height) {
      if (terrainMap[nr * width + nc] === colorIndex) {
        wangId[i] = colorIndex;
      }
    }
  }

  // Also check the cell itself - for corner wang sets, the center cell's
  // color affects corner indices
  if (terrainMap[row * width + col] === colorIndex) {
    // Set all relevant indices based on self
    for (let i = 0; i < 8; i++) {
      wangId[i] = colorIndex;
    }
    // Re-check neighbors that don't match
    for (let i = 0; i < NEIGHBOR_OFFSETS.length; i++) {
      const nc = col + NEIGHBOR_OFFSETS[i].col;
      const nr = row + NEIGHBOR_OFFSETS[i].row;
      if (nc < 0 || nc >= width || nr < 0 || nr >= height) {
        // Out-of-bounds treated as matching (for edge tiles)
        continue;
      }
      if (terrainMap[nr * width + nc] !== colorIndex) {
        wangId[i] = 0;
      }
    }
  }

  return wangId;
}

/**
 * Find the best matching wang tile for a given wang ID.
 * Returns the tileId or -1 if no match found.
 */
export function resolveWangTileAt(
  wangId: number[],
  wangSet: DmWangSet,
): number {
  const relevantIndices = getRelevantIndices(wangSet.type);

  let bestTile = -1;
  let bestScore = -1;

  for (const wt of wangSet.wangTiles) {
    let score = 0;
    let matches = true;

    for (const i of relevantIndices) {
      if (wt.wangId[i] === wangId[i]) {
        score++;
      } else {
        matches = false;
      }
    }

    if (matches && score > bestScore) {
      bestScore = score;
      bestTile = wt.tileId;
    }
  }

  return bestTile;
}

function getRelevantIndices(type: DmWangSet['type']): number[] {
  switch (type) {
    case 'corner':
      return [1, 3, 5, 7]; // topRight, bottomRight, bottomLeft, topLeft
    case 'edge':
      return [0, 2, 4, 6]; // top, right, bottom, left
    case 'mixed':
      return [0, 1, 2, 3, 4, 5, 6, 7];
  }
}

/**
 * Apply terrain painting at a cell: updates the terrain map and resolves
 * wang tiles for all affected cells.
 *
 * Returns an array of { col, row, tileId } changes to apply to the layer.
 */
export function paintTerrain(
  col: number,
  row: number,
  colorIndex: number,
  wangSet: DmWangSet,
  terrainMap: Uint8Array,
  width: number,
  height: number,
): Array<{ col: number; row: number; tileId: number }> {
  // Set the terrain color at the painted cell
  terrainMap[row * width + col] = colorIndex;

  // Get all affected cells
  const affected = getAffectedCells(col, row, width, height);
  const changes: Array<{ col: number; row: number; tileId: number }> = [];

  for (const cell of affected) {
    const wangId = buildWangIdForCell(cell.col, cell.row, colorIndex, terrainMap, width, height);
    const tileId = resolveWangTileAt(wangId, wangSet);
    if (tileId >= 0) {
      changes.push({ col: cell.col, row: cell.row, tileId });
    }
  }

  return changes;
}
