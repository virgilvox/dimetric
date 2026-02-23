[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / AseJsonResult

# Interface: AseJsonResult

Defined in: formats/src/aseprite/ase-json-parser.ts:44

Complete parsed result of an Aseprite JSON export, including frames, tags, and slices.

## Properties

### frames

> **frames**: [`AseFrame`](AseFrame.md)[]

Defined in: formats/src/aseprite/ase-json-parser.ts:50

All frames in order.

***

### frameTags

> **frameTags**: [`AseFrameTag`](AseFrameTag.md)[]

Defined in: formats/src/aseprite/ase-json-parser.ts:52

Animation tags (named frame ranges).

***

### image

> **image**: `string`

Defined in: formats/src/aseprite/ase-json-parser.ts:46

Image filename from meta.

***

### size

> **size**: `object`

Defined in: formats/src/aseprite/ase-json-parser.ts:48

Atlas dimensions.

#### h

> **h**: `number`

#### w

> **w**: `number`

***

### slices

> **slices**: [`AseSlice`](AseSlice.md)[]

Defined in: formats/src/aseprite/ase-json-parser.ts:54

Slices (hitboxes, anchors).
