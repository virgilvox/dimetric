[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [core/src](../README.md) / screenToGrid

# Function: screenToGrid()

> **screenToGrid**(`sx`, `sy`, `tileWidth`, `tileHeight`): [`GridCoord`](../interfaces/GridCoord.md)

Defined in: [core/src/math/iso.ts:35](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/math/iso.ts#L35)

Convert screen (pixel) coordinates to floating-point grid coordinates.
Inverse of gridToScreen.

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

Fractional grid coordinates
