import { extractGid, type DmMap, type DmTileLayer, type GridCoord } from '@dimetric/core';

/**
 * Grid-based walkability graph for A* pathfinding.
 *
 * Each cell is either walkable or blocked. The graph supports 4-directional
 * (cardinal) or 8-directional (cardinal + diagonal) neighbor queries.
 *
 * @example
 * ```ts
 * const graph = GridGraph.fromMap(myMap, 'collision-layer');
 * const result = astar(graph, { col: 0, row: 0 }, { col: 5, row: 5 });
 * ```
 */
export class GridGraph {
  /** Grid width in cells (columns). */
  readonly width: number;
  /** Grid height in cells (rows). */
  readonly height: number;
  /** Internal walkability array; `true` means walkable. */
  private walkable: boolean[];
  /** Whether diagonal movement is permitted. */
  allowDiagonals: boolean;

  /**
   * Create a new grid graph with all cells initially walkable.
   *
   * @param width - Number of columns.
   * @param height - Number of rows.
   * @param allowDiagonals - Enable 8-directional movement. Defaults to `true`.
   */
  constructor(width: number, height: number, allowDiagonals: boolean = true) {
    this.width = width;
    this.height = height;
    this.walkable = new Array(width * height).fill(true);
    this.allowDiagonals = allowDiagonals;
  }

  /**
   * Build a grid graph from a tile layer in a {@link DmMap}. Cells with a
   * non-zero GID (i.e. containing a tile) are marked as blocked; empty cells
   * (GID 0) are walkable.
   *
   * @param map - The map to read layer data from.
   * @param layerId - ID of the tile layer to use as the collision source.
   * @param options - Optional configuration.
   * @param options.allowDiagonals - Enable 8-directional movement. Defaults to `true`.
   * @returns A new {@link GridGraph} reflecting the layer's walkability.
   * @throws If the specified tile layer is not found.
   */
  static fromMap(map: DmMap, layerId: string, options?: { allowDiagonals?: boolean }): GridGraph {
    const layer = map.layers.find((l) => l.id === layerId) as DmTileLayer | undefined;
    if (!layer || layer.type !== 'tile') {
      throw new Error(`Tile layer "${layerId}" not found`);
    }
    const graph = new GridGraph(layer.width, layer.height, options?.allowDiagonals ?? true);
    for (let i = 0; i < layer.data.length; i++) {
      // Cells with any tile are NOT walkable (they're walls/obstacles)
      graph.walkable[i] = extractGid(layer.data[i]) === 0;
    }
    return graph;
  }

  /**
   * Set the walkability of a single cell. Out-of-bounds coordinates are
   * silently ignored.
   *
   * @param col - Column index.
   * @param row - Row index.
   * @param value - `true` for walkable, `false` for blocked.
   */
  setWalkable(col: number, row: number, value: boolean): void {
    if (this.inBounds(col, row)) {
      this.walkable[row * this.width + col] = value;
    }
  }

  /**
   * Check whether a cell is walkable. Out-of-bounds coordinates return `false`.
   *
   * @param col - Column index.
   * @param row - Row index.
   * @returns `true` if the cell exists and is walkable.
   */
  isWalkable(col: number, row: number): boolean {
    if (!this.inBounds(col, row)) return false;
    return this.walkable[row * this.width + col];
  }

  /**
   * Check whether coordinates fall within the grid bounds.
   *
   * @param col - Column index.
   * @param row - Row index.
   * @returns `true` if `0 <= col < width` and `0 <= row < height`.
   */
  inBounds(col: number, row: number): boolean {
    return col >= 0 && col < this.width && row >= 0 && row < this.height;
  }

  /**
   * Return the walkable neighbors of a cell. Cardinal directions are always
   * checked; diagonals are included only when {@link allowDiagonals} is `true`.
   *
   * @param col - Column index of the source cell.
   * @param row - Row index of the source cell.
   * @returns Array of walkable neighboring {@link GridCoord} values.
   */
  neighbors(col: number, row: number): GridCoord[] {
    const result: GridCoord[] = [];
    // 4 cardinal directions
    const dirs4: GridCoord[] = [
      { col: col - 1, row },
      { col: col + 1, row },
      { col, row: row - 1 },
      { col, row: row + 1 },
    ];
    for (const d of dirs4) {
      if (this.isWalkable(d.col, d.row)) {
        result.push(d);
      }
    }
    if (this.allowDiagonals) {
      const diags: GridCoord[] = [
        { col: col - 1, row: row - 1 },
        { col: col + 1, row: row - 1 },
        { col: col - 1, row: row + 1 },
        { col: col + 1, row: row + 1 },
      ];
      for (const d of diags) {
        if (this.isWalkable(d.col, d.row)) {
          result.push(d);
        }
      }
    }
    return result;
  }
}
