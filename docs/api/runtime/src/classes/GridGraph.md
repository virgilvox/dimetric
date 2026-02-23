[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / GridGraph

# Class: GridGraph

Defined in: runtime/src/pathfinding/grid-graph.ts:15

Grid-based walkability graph for A* pathfinding.

Each cell is either walkable or blocked. The graph supports 4-directional
(cardinal) or 8-directional (cardinal + diagonal) neighbor queries.

## Example

```ts
const graph = GridGraph.fromMap(myMap, 'collision-layer');
const result = astar(graph, { col: 0, row: 0 }, { col: 5, row: 5 });
```

## Constructors

### Constructor

> **new GridGraph**(`width`, `height`, `allowDiagonals?`): `GridGraph`

Defined in: runtime/src/pathfinding/grid-graph.ts:32

Create a new grid graph with all cells initially walkable.

#### Parameters

##### width

`number`

Number of columns.

##### height

`number`

Number of rows.

##### allowDiagonals?

`boolean` = `true`

Enable 8-directional movement. Defaults to `true`.

#### Returns

`GridGraph`

## Properties

### allowDiagonals

> **allowDiagonals**: `boolean`

Defined in: runtime/src/pathfinding/grid-graph.ts:23

Whether diagonal movement is permitted.

***

### height

> `readonly` **height**: `number`

Defined in: runtime/src/pathfinding/grid-graph.ts:19

Grid height in cells (rows).

***

### width

> `readonly` **width**: `number`

Defined in: runtime/src/pathfinding/grid-graph.ts:17

Grid width in cells (columns).

## Methods

### inBounds()

> **inBounds**(`col`, `row`): `boolean`

Defined in: runtime/src/pathfinding/grid-graph.ts:97

Check whether coordinates fall within the grid bounds.

#### Parameters

##### col

`number`

Column index.

##### row

`number`

Row index.

#### Returns

`boolean`

`true` if `0 <= col < width` and `0 <= row < height`.

***

### isWalkable()

> **isWalkable**(`col`, `row`): `boolean`

Defined in: runtime/src/pathfinding/grid-graph.ts:85

Check whether a cell is walkable. Out-of-bounds coordinates return `false`.

#### Parameters

##### col

`number`

Column index.

##### row

`number`

Row index.

#### Returns

`boolean`

`true` if the cell exists and is walkable.

***

### neighbors()

> **neighbors**(`col`, `row`): `GridCoord`[]

Defined in: runtime/src/pathfinding/grid-graph.ts:109

Return the walkable neighbors of a cell. Cardinal directions are always
checked; diagonals are included only when [allowDiagonals](#allowdiagonals) is `true`.

#### Parameters

##### col

`number`

Column index of the source cell.

##### row

`number`

Row index of the source cell.

#### Returns

`GridCoord`[]

Array of walkable neighboring GridCoord values.

***

### setWalkable()

> **setWalkable**(`col`, `row`, `value`): `void`

Defined in: runtime/src/pathfinding/grid-graph.ts:72

Set the walkability of a single cell. Out-of-bounds coordinates are
silently ignored.

#### Parameters

##### col

`number`

Column index.

##### row

`number`

Row index.

##### value

`boolean`

`true` for walkable, `false` for blocked.

#### Returns

`void`

***

### fromMap()

> `static` **fromMap**(`map`, `layerId`, `options?`): `GridGraph`

Defined in: runtime/src/pathfinding/grid-graph.ts:51

Build a grid graph from a tile layer in a DmMap. Cells with a
non-zero GID (i.e. containing a tile) are marked as blocked; empty cells
(GID 0) are walkable.

#### Parameters

##### map

`DmMap`

The map to read layer data from.

##### layerId

`string`

ID of the tile layer to use as the collision source.

##### options?

Optional configuration.

###### allowDiagonals?

`boolean`

Enable 8-directional movement. Defaults to `true`.

#### Returns

`GridGraph`

A new GridGraph reflecting the layer's walkability.

#### Throws

If the specified tile layer is not found.
