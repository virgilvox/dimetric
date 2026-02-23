[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / astar

# Function: astar()

> **astar**(`graph`, `start`, `goal`): [`AStarResult`](../interfaces/AStarResult.md)

Defined in: runtime/src/pathfinding/astar.ts:36

Find the shortest path between two grid cells using the A* algorithm.

Uses Chebyshev distance as the heuristic (optimal for 8-directional grids).
Diagonal moves cost `sqrt(2)` and cardinal moves cost `1`.

## Parameters

### graph

[`GridGraph`](../classes/GridGraph.md)

The walkability grid to search.

### start

`GridCoord`

Starting grid coordinate.

### goal

`GridCoord`

Target grid coordinate.

## Returns

[`AStarResult`](../interfaces/AStarResult.md)

An [AStarResult](../interfaces/AStarResult.md) containing the path, success flag, and cost.

## Example

```ts
const graph = new GridGraph(10, 10);
const result = astar(graph, { col: 0, row: 0 }, { col: 9, row: 9 });
if (result.found) {
  character.setPath(result.path);
}
```
