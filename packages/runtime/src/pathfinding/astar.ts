import type { GridCoord } from '@dimetric/core';
import type { GridGraph } from './grid-graph';

/**
 * Result returned by the {@link astar} function.
 */
export interface AStarResult {
  /** Path from start to goal (inclusive). Empty if no path was found. */
  path: GridCoord[];
  /** Whether a valid path was found. */
  found: boolean;
  /** Total movement cost of the path. */
  cost: number;
}

/**
 * Find the shortest path between two grid cells using the A* algorithm.
 *
 * Uses Chebyshev distance as the heuristic (optimal for 8-directional grids).
 * Diagonal moves cost `sqrt(2)` and cardinal moves cost `1`.
 *
 * @param graph - The walkability grid to search.
 * @param start - Starting grid coordinate.
 * @param goal - Target grid coordinate.
 * @returns An {@link AStarResult} containing the path, success flag, and cost.
 *
 * @example
 * ```ts
 * const graph = new GridGraph(10, 10);
 * const result = astar(graph, { col: 0, row: 0 }, { col: 9, row: 9 });
 * if (result.found) {
 *   character.setPath(result.path);
 * }
 * ```
 */
export function astar(
  graph: GridGraph,
  start: GridCoord,
  goal: GridCoord,
): AStarResult {
  if (!graph.isWalkable(start.col, start.row) || !graph.isWalkable(goal.col, goal.row)) {
    return { path: [], found: false, cost: 0 };
  }
  if (start.col === goal.col && start.row === goal.row) {
    return { path: [start], found: true, cost: 0 };
  }

  const key = (col: number, row: number) => `${col},${row}`;
  const startKey = key(start.col, start.row);
  const goalKey = key(goal.col, goal.row);

  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const cameFrom = new Map<string, string>();
  const coords = new Map<string, GridCoord>();

  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start, goal));
  coords.set(startKey, start);

  // Simple priority queue using sorted array
  const openSet = new Set<string>([startKey]);

  while (openSet.size > 0) {
    // Find node in openSet with lowest fScore
    let currentKey = '';
    let lowestF = Infinity;
    for (const k of openSet) {
      const f = fScore.get(k) ?? Infinity;
      if (f < lowestF) {
        lowestF = f;
        currentKey = k;
      }
    }

    if (currentKey === goalKey) {
      return {
        path: reconstructPath(cameFrom, coords, goalKey),
        found: true,
        cost: gScore.get(goalKey) ?? 0,
      };
    }

    openSet.delete(currentKey);
    const current = coords.get(currentKey)!;
    const currentG = gScore.get(currentKey) ?? Infinity;

    for (const neighbor of graph.neighbors(current.col, current.row)) {
      const nKey = key(neighbor.col, neighbor.row);
      const isDiag = neighbor.col !== current.col && neighbor.row !== current.row;
      const moveCost = isDiag ? Math.SQRT2 : 1;
      const tentativeG = currentG + moveCost;

      if (tentativeG < (gScore.get(nKey) ?? Infinity)) {
        cameFrom.set(nKey, currentKey);
        gScore.set(nKey, tentativeG);
        fScore.set(nKey, tentativeG + heuristic(neighbor, goal));
        coords.set(nKey, neighbor);
        openSet.add(nKey);
      }
    }
  }

  return { path: [], found: false, cost: 0 };
}

/**
 * Chebyshev distance heuristic for 8-directional movement.
 *
 * @param a - First grid coordinate.
 * @param b - Second grid coordinate.
 * @returns Estimated cost from `a` to `b`.
 */
function heuristic(a: GridCoord, b: GridCoord): number {
  const dx = Math.abs(a.col - b.col);
  const dy = Math.abs(a.row - b.row);
  return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
}

/**
 * Walk the `cameFrom` chain backwards from the goal to reconstruct the path.
 *
 * @param cameFrom - Map from node key to its predecessor key.
 * @param coords - Map from node key to its grid coordinate.
 * @param goalKey - The key of the goal node.
 * @returns Ordered path from start to goal (inclusive).
 */
function reconstructPath(
  cameFrom: Map<string, string>,
  coords: Map<string, GridCoord>,
  goalKey: string,
): GridCoord[] {
  const path: GridCoord[] = [];
  let current = goalKey;
  while (current) {
    path.unshift(coords.get(current)!);
    current = cameFrom.get(current)!;
  }
  return path;
}
