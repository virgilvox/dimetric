[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / TmxParseOptions

# Interface: TmxParseOptions

Defined in: formats/src/tmx/tmx-parser.ts:13

Options for controlling how TMX files are parsed.

## Properties

### resolveExternal()?

> `optional` **resolveExternal**: (`source`) => `string` \| `Promise`\<`string`\>

Defined in: formats/src/tmx/tmx-parser.ts:15

Resolver for external tileset/image sources. Return the raw text content.

#### Parameters

##### source

`string`

#### Returns

`string` \| `Promise`\<`string`\>
