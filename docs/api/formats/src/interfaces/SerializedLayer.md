[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / SerializedLayer

# Interface: SerializedLayer

Defined in: [formats/src/native/schema.ts:30](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L30)

Serialized representation of a map layer (tile, object, image, or group).

## Properties

### data?

> `optional` **data**: `number`[]

Defined in: [formats/src/native/schema.ts:42](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L42)

Tile data stored as regular number array for JSON compatibility.

***

### height?

> `optional` **height**: `number`

Defined in: [formats/src/native/schema.ts:40](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L40)

***

### id

> **id**: `string`

Defined in: [formats/src/native/schema.ts:31](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L31)

***

### imageSource?

> `optional` **imageSource**: `string`

Defined in: [formats/src/native/schema.ts:46](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L46)

***

### layers?

> `optional` **layers**: `SerializedLayer`[]

Defined in: [formats/src/native/schema.ts:48](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L48)

***

### locked

> **locked**: `boolean`

Defined in: [formats/src/native/schema.ts:35](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L35)

***

### name

> **name**: `string`

Defined in: [formats/src/native/schema.ts:32](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L32)

***

### objects?

> `optional` **objects**: `unknown`[]

Defined in: [formats/src/native/schema.ts:44](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L44)

***

### offset

> **offset**: `object`

Defined in: [formats/src/native/schema.ts:37](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L37)

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### opacity

> **opacity**: `number`

Defined in: [formats/src/native/schema.ts:36](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L36)

***

### properties?

> `optional` **properties**: `Record`\<`string`, `unknown`\>

Defined in: [formats/src/native/schema.ts:49](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L49)

***

### type

> **type**: `string`

Defined in: [formats/src/native/schema.ts:33](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L33)

***

### visible

> **visible**: `boolean`

Defined in: [formats/src/native/schema.ts:34](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L34)

***

### width?

> `optional` **width**: `number`

Defined in: [formats/src/native/schema.ts:39](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/schema.ts#L39)
