[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / SerializedMap

# Interface: SerializedMap

Defined in: [formats/src/native/schema.ts:17](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L17)

Serialized representation of a DmMap within a project file.

## Properties

### id

> **id**: `string`

Defined in: [formats/src/native/schema.ts:18](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L18)

***

### layers

> **layers**: [`SerializedLayer`](SerializedLayer.md)[]

Defined in: [formats/src/native/schema.ts:24](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L24)

***

### mapSize

> **mapSize**: `object`

Defined in: [formats/src/native/schema.ts:22](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L22)

#### height

> **height**: `number`

#### width

> **width**: `number`

***

### name

> **name**: `string`

Defined in: [formats/src/native/schema.ts:19](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L19)

***

### orientation

> **orientation**: `string`

Defined in: [formats/src/native/schema.ts:20](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L20)

***

### properties?

> `optional` **properties**: `Record`\<`string`, `unknown`\>

Defined in: [formats/src/native/schema.ts:26](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L26)

***

### renderOrder

> **renderOrder**: `string`

Defined in: [formats/src/native/schema.ts:21](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L21)

***

### tilesets

> **tilesets**: `object`[]

Defined in: [formats/src/native/schema.ts:25](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L25)

#### firstGid

> **firstGid**: `number`

#### tilesetId

> **tilesetId**: `string`

***

### tileSize

> **tileSize**: `object`

Defined in: [formats/src/native/schema.ts:23](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L23)

#### height

> **height**: `number`

#### width

> **width**: `number`
