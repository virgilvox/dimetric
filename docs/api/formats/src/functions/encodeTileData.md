[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / encodeTileData

# Function: encodeTileData()

> **encodeTileData**(`data`, `encoding?`, `compression?`): `string`

Defined in: formats/src/tmx/compression.ts:43

Encode a Uint32Array of tile GIDs back to a tile data string.

Produces CSV or base64 output, with optional zlib/gzip compression
for the base64 encoding.

## Parameters

### data

`Uint32Array`

The tile data array to encode.

### encoding?

`string`

The encoding format: `'csv'` or `'base64'`. Defaults to CSV if undefined.

### compression?

`string`

Compression algorithm: `'zlib'`, `'gzip'`, or undefined. Only applies to base64.

## Returns

`string`

The encoded tile data string.

## Throws

If the encoding or compression is unsupported.
