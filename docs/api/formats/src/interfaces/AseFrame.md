[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / AseFrame

# Interface: AseFrame

Defined in: formats/src/aseprite/ase-json-parser.ts:2

A single frame from an Aseprite JSON export, with atlas coordinates and timing.

## Properties

### duration

> **duration**: `number`

Defined in: formats/src/aseprite/ase-json-parser.ts:18

Duration of this frame in milliseconds.

***

### filename

> **filename**: `string`

Defined in: formats/src/aseprite/ase-json-parser.ts:6

Filename/key from the export.

***

### frame

> **frame**: `object`

Defined in: formats/src/aseprite/ase-json-parser.ts:8

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

### index

> **index**: `number`

Defined in: formats/src/aseprite/ase-json-parser.ts:4

Frame index (0-based).

***

### rotated

> **rotated**: `boolean`

Defined in: formats/src/aseprite/ase-json-parser.ts:10

Whether the frame is rotated 90° CW in the atlas.

***

### sourceSize

> **sourceSize**: `object`

Defined in: formats/src/aseprite/ase-json-parser.ts:16

Original sprite dimensions.

#### h

> **h**: `number`

#### w

> **w**: `number`

***

### spriteSourceSize

> **spriteSourceSize**: `object`

Defined in: formats/src/aseprite/ase-json-parser.ts:14

Trimmed sprite region relative to source.

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

Defined in: formats/src/aseprite/ase-json-parser.ts:12

Whether the frame is trimmed.
