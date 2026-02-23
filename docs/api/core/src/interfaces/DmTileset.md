[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [core/src](../README.md) / DmTileset

# Interface: DmTileset

Defined in: [core/src/types/tileset.ts:34](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L34)

A tileset: an image sliced into a grid of tiles.

## Properties

### columns

> **columns**: `number`

Defined in: [core/src/types/tileset.ts:45](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L45)

Number of tile columns in the image.

***

### id

> **id**: `string`

Defined in: [core/src/types/tileset.ts:36](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L36)

Unique ID within the project.

***

### imageSize

> **imageSize**: [`Size`](Size.md)

Defined in: [core/src/types/tileset.ts:41](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L41)

Full image dimensions in pixels.

***

### imageSource

> **imageSource**: `string`

Defined in: [core/src/types/tileset.ts:39](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L39)

Path or data URI of the tileset image.

***

### margin

> **margin**: `number`

Defined in: [core/src/types/tileset.ts:51](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L51)

Margin around the image edge (pixels).

***

### name

> **name**: `string`

Defined in: [core/src/types/tileset.ts:37](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L37)

***

### properties?

> `optional` **properties**: [`DmPropertyBag`](../type-aliases/DmPropertyBag.md)

Defined in: [core/src/types/tileset.ts:54](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L54)

***

### spacing

> **spacing**: `number`

Defined in: [core/src/types/tileset.ts:49](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L49)

Spacing between tiles in the image (pixels).

***

### tileCount

> **tileCount**: `number`

Defined in: [core/src/types/tileset.ts:47](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L47)

Total number of tiles.

***

### tiles

> **tiles**: `Record`\<`number`, [`DmTileData`](DmTileData.md)\>

Defined in: [core/src/types/tileset.ts:53](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L53)

Per-tile data keyed by local tile ID.

***

### tileSize

> **tileSize**: [`Size`](Size.md)

Defined in: [core/src/types/tileset.ts:43](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L43)

Size of a single tile in pixels.

***

### wangSets?

> `optional` **wangSets**: [`DmWangSet`](DmWangSet.md)[]

Defined in: [core/src/types/tileset.ts:56](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/core/src/types/tileset.ts#L56)

Wang sets for terrain auto-tiling.
