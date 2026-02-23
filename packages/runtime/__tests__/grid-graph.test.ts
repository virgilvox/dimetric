import { describe, it, expect } from 'vitest';
import { GridGraph } from '../src/pathfinding/grid-graph';

describe('GridGraph', () => {
  it('creates a grid with all cells walkable', () => {
    const graph = new GridGraph(3, 3);
    expect(graph.isWalkable(0, 0)).toBe(true);
    expect(graph.isWalkable(2, 2)).toBe(true);
  });

  it('sets and checks walkability', () => {
    const graph = new GridGraph(3, 3);
    graph.setWalkable(1, 1, false);
    expect(graph.isWalkable(1, 1)).toBe(false);
    expect(graph.isWalkable(0, 0)).toBe(true);
  });

  it('returns false for out-of-bounds checks', () => {
    const graph = new GridGraph(3, 3);
    expect(graph.isWalkable(-1, 0)).toBe(false);
    expect(graph.isWalkable(0, -1)).toBe(false);
    expect(graph.isWalkable(3, 0)).toBe(false);
    expect(graph.isWalkable(0, 3)).toBe(false);
    expect(graph.inBounds(-1, 0)).toBe(false);
  });

  it('returns 4-dir neighbors', () => {
    const graph = new GridGraph(3, 3, false);
    const n = graph.neighbors(1, 1);
    expect(n.length).toBe(4);
  });

  it('returns 8-dir neighbors', () => {
    const graph = new GridGraph(3, 3, true);
    const n = graph.neighbors(1, 1);
    expect(n.length).toBe(8);
  });

  it('excludes unwalkable neighbors', () => {
    const graph = new GridGraph(3, 3, false);
    graph.setWalkable(0, 1, false);
    graph.setWalkable(2, 1, false);
    const n = graph.neighbors(1, 1);
    expect(n.length).toBe(2);
  });

  it('corner cell has fewer neighbors', () => {
    const graph = new GridGraph(3, 3, false);
    const n = graph.neighbors(0, 0);
    expect(n.length).toBe(2); // right and down only
  });
});
