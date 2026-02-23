[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / parseAseJson

# Function: parseAseJson()

> **parseAseJson**(`json`): [`AseJsonResult`](../interfaces/AseJsonResult.md)

Defined in: formats/src/aseprite/ase-json-parser.ts:65

Parse an Aseprite JSON export into a structured result.

Supports both array (`--list`) and hash (object-keyed) frame formats.

## Parameters

### json

`any`

The parsed JSON object from an Aseprite export.

## Returns

[`AseJsonResult`](../interfaces/AseJsonResult.md)

A structured result with frames, animation tags, and slices.
