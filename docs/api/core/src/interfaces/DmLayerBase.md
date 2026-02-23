[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [core/src](../README.md) / DmLayerBase

# Interface: DmLayerBase

Defined in: [core/src/types/map.ts:15](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L15)

Base fields shared by all layer types.

## Extended by

- [`DmTileLayer`](DmTileLayer.md)
- [`DmObjectLayer`](DmObjectLayer.md)
- [`DmImageLayer`](DmImageLayer.md)
- [`DmGroupLayer`](DmGroupLayer.md)

## Properties

### id

> **id**: `string`

Defined in: [core/src/types/map.ts:16](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L16)

***

### locked

> **locked**: `boolean`

Defined in: [core/src/types/map.ts:20](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L20)

***

### name

> **name**: `string`

Defined in: [core/src/types/map.ts:17](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L17)

***

### offset

> **offset**: [`Point`](Point.md)

Defined in: [core/src/types/map.ts:23](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L23)

Pixel offset for the layer.

***

### opacity

> **opacity**: `number`

Defined in: [core/src/types/map.ts:21](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L21)

***

### properties?

> `optional` **properties**: [`DmPropertyBag`](../type-aliases/DmPropertyBag.md)

Defined in: [core/src/types/map.ts:24](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L24)

***

### type

> **type**: [`DmLayerType`](../type-aliases/DmLayerType.md)

Defined in: [core/src/types/map.ts:18](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L18)

***

### visible

> **visible**: `boolean`

Defined in: [core/src/types/map.ts:19](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L19)
