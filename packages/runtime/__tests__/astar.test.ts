import { describe, it, expect } from 'vitest';
import { GridGraph } from '../src/pathfinding/grid-graph';
import { astar } from '../src/pathfinding/astar';

describe('astar', () => {
  it('finds a straight path on an open grid', () => {
    const graph = new GridGraph(5, 5, false); // 4-dir only
    const result = astar(graph, { col: 0, row: 0 }, { col: 4, row: 0 });
    expect(result.found).toBe(true);
    expect(result.path.length).toBe(5);
    expect(result.path[0]).toEqual({ col: 0, row: 0 });
    expect(result.path[4]).toEqual({ col: 4, row: 0 });
  });

  it('finds path around obstacles', () => {
    const graph = new GridGraph(5, 5, false);
    // Wall at col=2, rows 0-3
    for (let r = 0; r < 4; r++) {
      graph.setWalkable(2, r, false);
    }
    const result = astar(graph, { col: 0, row: 0 }, { col: 4, row: 0 });
    expect(result.found).toBe(true);
    // Path must go around the wall
    expect(result.path.length).toBeGreaterThan(5);
    expect(result.path[result.path.length - 1]).toEqual({ col: 4, row: 0 });
  });

  it('returns not found for unreachable goal', () => {
    const graph = new GridGraph(5, 5, false);
    // Wall completely blocks right side
    for (let r = 0; r < 5; r++) {
      graph.setWalkable(2, r, false);
    }
    const result = astar(graph, { col: 0, row: 0 }, { col: 4, row: 0 });
    expect(result.found).toBe(false);
    expect(result.path).toEqual([]);
  });

  it('returns single-node path for start === goal', () => {
    const graph = new GridGraph(3, 3);
    const result = astar(graph, { col: 1, row: 1 }, { col: 1, row: 1 });
    expect(result.found).toBe(true);
    expect(result.path.length).toBe(1);
    expect(result.cost).toBe(0);
  });

  it('supports diagonal movement', () => {
    const graph = new GridGraph(5, 5, true);
    const result = astar(graph, { col: 0, row: 0 }, { col: 4, row: 4 });
    expect(result.found).toBe(true);
    // Diagonal path should be 5 nodes (0,0 -> 1,1 -> 2,2 -> 3,3 -> 4,4)
    expect(result.path.length).toBe(5);
  });

  it('returns not found when start is unwalkable', () => {
    const graph = new GridGraph(3, 3);
    graph.setWalkable(0, 0, false);
    const result = astar(graph, { col: 0, row: 0 }, { col: 2, row: 2 });
    expect(result.found).toBe(false);
  });
});
