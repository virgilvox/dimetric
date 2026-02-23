[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [core/src](../README.md) / DmMap

# Interface: DmMap

Defined in: [core/src/types/map.ts:86](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L86)

A complete tile map.

## Properties

### id

> **id**: `string`

Defined in: [core/src/types/map.ts:87](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L87)

***

### layers

> **layers**: [`DmLayer`](../type-aliases/DmLayer.md)[]

Defined in: [core/src/types/map.ts:96](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L96)

Layers in draw order (bottom to top).

***

### mapSize

> **mapSize**: [`Size`](Size.md)

Defined in: [core/src/types/map.ts:92](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L92)

Map dimensions in tiles.

***

### name

> **name**: `string`

Defined in: [core/src/types/map.ts:88](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L88)

***

### orientation

> **orientation**: [`DmOrientation`](../type-aliases/DmOrientation.md)

Defined in: [core/src/types/map.ts:89](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L89)

***

### properties?

> `optional` **properties**: [`DmPropertyBag`](../type-aliases/DmPropertyBag.md)

Defined in: [core/src/types/map.ts:99](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L99)

***

### renderOrder

> **renderOrder**: [`DmRenderOrder`](../type-aliases/DmRenderOrder.md)

Defined in: [core/src/types/map.ts:90](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L90)

***

### tilesets

> **tilesets**: [`DmTilesetRef`](DmTilesetRef.md)[]

Defined in: [core/src/types/map.ts:98](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L98)

Tilesets referenced by this map, sorted by firstGid.

***

### tileSize

> **tileSize**: [`Size`](Size.md)

Defined in: [core/src/types/map.ts:94](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/map.ts#L94)

Tile dimensions in pixels.
