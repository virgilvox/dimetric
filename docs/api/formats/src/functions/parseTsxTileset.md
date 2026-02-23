[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / parseTsxTileset

# Function: parseTsxTileset()

> **parseTsxTileset**(`xml`): `DmTileset`

Defined in: formats/src/tmx/tsx-parser.ts:19

Parse a Tiled XML tileset (.tsx) into a DmTileset.

## Parameters

### xml

`string`

The raw XML string from a .tsx file.

## Returns

`DmTileset`

A DmTileset with all tile metadata populated.

## Throws

If the XML does not contain a valid tileset root element.
