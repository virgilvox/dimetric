[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / parseTsjTileset

# Function: parseTsjTileset()

> **parseTsjTileset**(`json`): `DmTileset`

Defined in: formats/src/tmx/tsj-parser.ts:16

Parse a Tiled JSON tileset (.tsj) into a DmTileset.

Handles tile animations, collision shapes, wang sets, and per-tile properties.

## Parameters

### json

`any`

The parsed JSON object from a .tsj file or an embedded tileset entry.

## Returns

`DmTileset`

A DmTileset with all tile metadata populated.
