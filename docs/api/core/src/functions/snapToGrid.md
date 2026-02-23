[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [core/src](../README.md) / snapToGrid

# Function: snapToGrid()

> **snapToGrid**(`sx`, `sy`, `tileWidth`, `tileHeight`): [`GridCoord`](../interfaces/GridCoord.md)

Defined in: [core/src/math/iso.ts:58](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/math/iso.ts#L58)

Snap screen coordinates to the nearest grid cell.

## Parameters

### sx

`number`

Screen X coordinate

### sy

`number`

Screen Y coordinate

### tileWidth

`number`

Tile width in pixels

### tileHeight

`number`

Tile height in pixels

## Returns

[`GridCoord`](../interfaces/GridCoord.md)

Integer grid coordinates of the nearest tile
