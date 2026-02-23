[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [core/src](../README.md) / gridToScreen

# Function: gridToScreen()

> **gridToScreen**(`col`, `row`, `tileWidth`, `tileHeight`): [`ScreenCoord`](../interfaces/ScreenCoord.md)

Defined in: [core/src/math/iso.ts:13](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/math/iso.ts#L13)

Convert grid coordinates to screen (pixel) coordinates.
Uses standard isometric projection where tile width = 2 * tile height.

## Parameters

### col

`number`

Grid column

### row

`number`

Grid row

### tileWidth

`number`

Tile width in pixels

### tileHeight

`number`

Tile height in pixels

## Returns

[`ScreenCoord`](../interfaces/ScreenCoord.md)

Screen coordinates of the tile's top-center diamond point
