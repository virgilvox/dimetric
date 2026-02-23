[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / deserializeProjectFromJson

# Function: deserializeProjectFromJson()

> **deserializeProjectFromJson**(`json`): `DmProject`

Defined in: [formats/src/native/deserialize.ts:156](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/deserialize.ts#L156)

Deserialize a DmProject from a JSON string.

## Parameters

### json

`string`

The JSON string to parse.

## Returns

`DmProject`

A fully hydrated DmProject instance.

## Throws

If the JSON is invalid or does not represent a valid dimetric project.
