[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [core/src](../README.md) / createTileLayer

# Function: createTileLayer()

> **createTileLayer**(`options`): [`DmTileLayer`](../interfaces/DmTileLayer.md)

Defined in: [core/src/model/map-factory.ts:54](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/model/map-factory.ts#L54)

Create a new empty tile layer with a zeroed Uint32Array data buffer.

## Parameters

### options

[`CreateTileLayerOptions`](../interfaces/CreateTileLayerOptions.md)

Layer configuration (name, width, height)

## Returns

[`DmTileLayer`](../interfaces/DmTileLayer.md)

A new [DmTileLayer](../interfaces/DmTileLayer.md) with all tiles set to 0 (empty)
