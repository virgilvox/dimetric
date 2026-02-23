[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / parseTexturePackerJson

# Function: parseTexturePackerJson()

> **parseTexturePackerJson**(`json`): [`TpAtlasResult`](../interfaces/TpAtlasResult.md)

Defined in: formats/src/atlas/texturepacker-parser.ts:39

Parse a TexturePacker JSON atlas into a structured result.

Supports both array and hash (object-keyed) frame formats.

## Parameters

### json

`any`

The parsed JSON object from a TexturePacker export.

## Returns

[`TpAtlasResult`](../interfaces/TpAtlasResult.md)

A structured atlas result with frames, image path, size, and scale.
