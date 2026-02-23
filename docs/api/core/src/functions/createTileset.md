[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [core/src](../README.md) / createTileset

# Function: createTileset()

> **createTileset**(`options`): [`DmTileset`](../interfaces/DmTileset.md)

Defined in: [core/src/model/tileset-factory.ts:20](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/model/tileset-factory.ts#L20)

Create a new tileset from an image with grid parameters.
Calculates column count and total tile count from the image/tile dimensions.

## Parameters

### options

[`CreateTilesetOptions`](../interfaces/CreateTilesetOptions.md)

Tileset configuration including image source and tile grid sizing

## Returns

[`DmTileset`](../interfaces/DmTileset.md)

A new [DmTileset](../interfaces/DmTileset.md) with computed columns and tile count
