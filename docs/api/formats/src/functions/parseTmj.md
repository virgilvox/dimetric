[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / parseTmj

# Function: parseTmj()

> **parseTmj**(`json`, `options?`): `Promise`\<`DmMap`\>

Defined in: formats/src/tmx/tmj-parser.ts:26

Parse a Tiled JSON map (.tmj) into a DmMap.

Supports embedded and external tilesets, all layer types, and
base64/CSV tile data encodings.

## Parameters

### json

`any`

The parsed JSON object from a .tmj file.

### options?

[`TmjParseOptions`](../interfaces/TmjParseOptions.md)

Optional configuration, including an external tileset resolver.

## Returns

`Promise`\<`DmMap`\>

A DmMap representing the Tiled map.
