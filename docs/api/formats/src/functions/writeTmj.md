[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / writeTmj

# Function: writeTmj()

> **writeTmj**(`map`): `any`

Defined in: formats/src/tmx/tmj-writer.ts:15

Convert a DmMap to a Tiled JSON map object (.tmj).

Produces a plain object conforming to the Tiled JSON map format,
with embedded tilesets and CSV-style tile data arrays.

## Parameters

### map

`DmMap`

The map to convert.

## Returns

`any`

A plain object ready for JSON.stringify.
