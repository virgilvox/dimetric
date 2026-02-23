[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / deserializeProject

# Function: deserializeProject()

> **deserializeProject**(`data`): `DmProject`

Defined in: [formats/src/native/deserialize.ts:19](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/deserialize.ts#L19)

Deserialize a JSON-parsed object into a DmProject.

Validates the format marker and schema version, then reconstructs
Uint32Array tile data from plain number arrays.

## Parameters

### data

`unknown`

The raw parsed JSON object (from JSON.parse or similar).

## Returns

`DmProject`

A fully hydrated DmProject instance.

## Throws

If the data is not a valid dimetric project or has an unsupported version.
