[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / decodeTileData

# Function: decodeTileData()

> **decodeTileData**(`data`, `encoding?`, `compression?`, `expectedLength?`): `Uint32Array`

Defined in: formats/src/tmx/compression.ts:16

Decode Tiled tile layer data from its encoded form to a Uint32Array.

Supports CSV and base64 encodings, with optional zlib/gzip compression
for base64-encoded data.

## Parameters

### data

`string`

The raw data string (CSV text or base64-encoded binary).

### encoding?

`string`

The encoding format: `'csv'` or `'base64'`. Defaults to CSV if undefined.

### compression?

`string`

Compression algorithm: `'zlib'`, `'gzip'`, or undefined. Only applies to base64.

### expectedLength?

`number`

Expected number of tiles (width * height) for validation.

## Returns

`Uint32Array`

A Uint32Array of tile GIDs (including flip flags in upper bits).

## Throws

If the encoding is unsupported or the decoded length does not match.
