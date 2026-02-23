import type { GridCoord, ScreenCoord } from '../types/geometry';

/**
 * Convert grid coordinates to screen (pixel) coordinates.
 * Uses standard isometric projection where tile width = 2 * tile height.
 *
 * @param col - Grid column
 * @param row - Grid row
 * @param tileWidth - Tile width in pixels
 * @param tileHeight - Tile height in pixels
 * @returns Screen coordinates of the tile's top-center diamond point
 */
export function gridToScreen(
  col: number,
  row: number,
  tileWidth: number,
  tileHeight: number,
): ScreenCoord {
  return {
    sx: (col - row) * (tileWidth / 2),
    sy: (col + row) * (tileHeight / 2),
  };
}

/**
 * Convert screen (pixel) coordinates to floating-point grid coordinates.
 * Inverse of gridToScreen.
 *
 * @param sx - Screen X coordinate
 * @param sy - Screen Y coordinate
 * @param tileWidth - Tile width in pixels
 * @param tileHeight - Tile height in pixels
 * @returns Fractional grid coordinates
 */
export function screenToGrid(
  sx: number,
  sy: number,
  tileWidth: number,
  tileHeight: number,
): GridCoord {
  const halfW = tileWidth / 2;
  const halfH = tileHeight / 2;
  return {
    col: (sx / halfW + sy / halfH) / 2,
    row: (sy / halfH - sx / halfW) / 2,
  };
}

/**
 * Snap screen coordinates to the nearest grid cell.
 *
 * @param sx - Screen X coordinate
 * @param sy - Screen Y coordinate
 * @param tileWidth - Tile width in pixels
 * @param tileHeight - Tile height in pixels
 * @returns Integer grid coordinates of the nearest tile
 */
export function snapToGrid(
  sx: number,
  sy: number,
  tileWidth: number,
  tileHeight: number,
): GridCoord {
  const { col, row } = screenToGrid(sx, sy, tileWidth, tileHeight);
  return {
    col: Math.floor(col),
    row: Math.floor(row),
  };
}
