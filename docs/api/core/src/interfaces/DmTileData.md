[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [core/src](../README.md) / DmTileData

# Interface: DmTileData

Defined in: [core/src/types/tileset.ts:24](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L24)

Per-tile metadata: collision, animation, custom properties.

## Properties

### animation?

> `optional` **animation**: [`DmTileAnimationFrame`](DmTileAnimationFrame.md)[]

Defined in: [core/src/types/tileset.ts:28](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L28)

***

### collision?

> `optional` **collision**: [`DmCollisionShape`](DmCollisionShape.md)[]

Defined in: [core/src/types/tileset.ts:27](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L27)

***

### localId

> **localId**: `number`

Defined in: [core/src/types/tileset.ts:26](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L26)

Local tile ID within the tileset.

***

### probability?

> `optional` **probability**: `number`

Defined in: [core/src/types/tileset.ts:29](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L29)

***

### properties?

> `optional` **properties**: [`DmPropertyBag`](../type-aliases/DmPropertyBag.md)

Defined in: [core/src/types/tileset.ts:30](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L30)
