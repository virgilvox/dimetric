[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / AStarResult

# Interface: AStarResult

Defined in: runtime/src/pathfinding/astar.ts:7

Result returned by the [astar](../functions/astar.md) function.

## Properties

### cost

> **cost**: `number`

Defined in: runtime/src/pathfinding/astar.ts:13

Total movement cost of the path.

***

### found

> **found**: `boolean`

Defined in: runtime/src/pathfinding/astar.ts:11

Whether a valid path was found.

***

### path

> **path**: `GridCoord`[]

Defined in: runtime/src/pathfinding/astar.ts:9

Path from start to goal (inclusive). Empty if no path was found.
