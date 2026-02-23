[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / parseTmx

# Function: parseTmx()

> **parseTmx**(`xml`, `options?`): `Promise`\<`DmMap`\>

Defined in: formats/src/tmx/tmx-parser.ts:36

Parse a Tiled XML map (.tmx) into a DmMap.

Supports embedded and external tilesets, all layer types (tile, object,
image, group), and CSV/base64 tile data encodings with optional compression.

## Parameters

### xml

`string`

The raw XML string from a .tmx file.

### options?

[`TmxParseOptions`](../interfaces/TmxParseOptions.md)

Optional configuration, including an external resource resolver.

## Returns

`Promise`\<`DmMap`\>

A DmMap representing the Tiled map.

## Throws

If the XML does not contain a valid [TMX map](https://doc.mapeditor.org/en/stable/reference/tmx-map-format/) root element.
