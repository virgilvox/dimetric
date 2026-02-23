[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / serializeProject

# Function: serializeProject()

> **serializeProject**(`project`): [`SerializedProject`](../interfaces/SerializedProject.md)

Defined in: [formats/src/native/serialize.ts:12](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/formats/src/native/serialize.ts#L12)

Serialize a DmProject to a plain JSON-compatible object.

Converts Uint32Array tile data to regular number arrays for JSON compatibility.

## Parameters

### project

`DmProject`

The project to serialize.

## Returns

[`SerializedProject`](../interfaces/SerializedProject.md)

A plain object suitable for JSON.stringify.
