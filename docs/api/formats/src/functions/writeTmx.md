[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / writeTmx

# Function: writeTmx()

> **writeTmx**(`map`): `string`

Defined in: formats/src/tmx/tmx-writer.ts:15

Convert a DmMap to a Tiled XML string (.tmx).

Produces a complete TMX document with CSV-encoded tile data and
embedded tilesets.

## Parameters

### map

`DmMap`

The map to convert.

## Returns

`string`

A well-formed XML string.
