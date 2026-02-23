[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / TpFrame

# Interface: TpFrame

Defined in: formats/src/atlas/texturepacker-parser.ts:2

A single sprite frame from a TexturePacker JSON atlas, with atlas coordinates and trim data.

## Properties

### filename

> **filename**: `string`

Defined in: formats/src/atlas/texturepacker-parser.ts:4

Filename/key of the sprite.

***

### frame

> **frame**: `object`

Defined in: formats/src/atlas/texturepacker-parser.ts:6

Source rectangle in the atlas.

#### h

> **h**: `number`

#### w

> **w**: `number`

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### pivot

> **pivot**: `object`

Defined in: formats/src/atlas/texturepacker-parser.ts:16

Pivot point (0-1 normalized).

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### rotated

> **rotated**: `boolean`

Defined in: formats/src/atlas/texturepacker-parser.ts:8

Whether the frame is rotated 90° CW in the atlas.

***

### sourceSize

> **sourceSize**: `object`

Defined in: formats/src/atlas/texturepacker-parser.ts:14

Original sprite dimensions.

#### h

> **h**: `number`

#### w

> **w**: `number`

***

### spriteSourceSize

> **spriteSourceSize**: `object`

Defined in: formats/src/atlas/texturepacker-parser.ts:12

Trimmed region relative to original.

#### h

> **h**: `number`

#### w

> **w**: `number`

#### x

> **x**: `number`

#### y

> **y**: `number`

***

### trimmed

> **trimmed**: `boolean`

Defined in: formats/src/atlas/texturepacker-parser.ts:10

Whether the frame was trimmed.
