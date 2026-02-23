[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [core/src](../README.md) / DmTileLayer

# Interface: DmTileLayer

Defined in: [core/src/types/map.ts:28](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L28)

A tile layer stores a flat grid of tile GIDs.

## Extends

- [`DmLayerBase`](DmLayerBase.md)

## Properties

### data

> **data**: `Uint32Array`

Defined in: [core/src/types/map.ts:38](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L38)

Flat array of tile GIDs, length = width * height.
0 means empty. Top 3 bits encode flip flags (matching Tiled convention).

***

### height

> **height**: `number`

Defined in: [core/src/types/map.ts:33](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L33)

Height in tiles.

***

### id

> **id**: `string`

Defined in: [core/src/types/map.ts:16](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L16)

#### Inherited from

[`DmLayerBase`](DmLayerBase.md).[`id`](DmLayerBase.md#id)

***

### locked

> **locked**: `boolean`

Defined in: [core/src/types/map.ts:20](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L20)

#### Inherited from

[`DmLayerBase`](DmLayerBase.md).[`locked`](DmLayerBase.md#locked)

***

### name

> **name**: `string`

Defined in: [core/src/types/map.ts:17](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L17)

#### Inherited from

[`DmLayerBase`](DmLayerBase.md).[`name`](DmLayerBase.md#name)

***

### offset

> **offset**: [`Point`](Point.md)

Defined in: [core/src/types/map.ts:23](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L23)

Pixel offset for the layer.

#### Inherited from

[`DmLayerBase`](DmLayerBase.md).[`offset`](DmLayerBase.md#offset)

***

### opacity

> **opacity**: `number`

Defined in: [core/src/types/map.ts:21](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L21)

#### Inherited from

[`DmLayerBase`](DmLayerBase.md).[`opacity`](DmLayerBase.md#opacity)

***

### properties?

> `optional` **properties**: [`DmPropertyBag`](../type-aliases/DmPropertyBag.md)

Defined in: [core/src/types/map.ts:24](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L24)

#### Inherited from

[`DmLayerBase`](DmLayerBase.md).[`properties`](DmLayerBase.md#properties)

***

### type

> **type**: `"tile"`

Defined in: [core/src/types/map.ts:29](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L29)

#### Overrides

[`DmLayerBase`](DmLayerBase.md).[`type`](DmLayerBase.md#type)

***

### visible

> **visible**: `boolean`

Defined in: [core/src/types/map.ts:19](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L19)

#### Inherited from

[`DmLayerBase`](DmLayerBase.md).[`visible`](DmLayerBase.md#visible)

***

### width

> **width**: `number`

Defined in: [core/src/types/map.ts:31](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L31)

Width in tiles.
