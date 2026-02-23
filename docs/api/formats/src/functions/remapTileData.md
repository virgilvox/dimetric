[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / remapTileData

# Function: remapTileData()

> **remapTileData**(`data`, `fromRefs`, `toRefs`): `Uint32Array`

Defined in: formats/src/tmx/gid-utils.ts:39

Remap tile data from one GID space to another.

Preserves flip flags (upper 3 bits) while translating the tile GID
portion. Used when importing from Tiled where firstGids may differ.

## Parameters

### data

`Uint32Array`

Source tile data array with GIDs in the original space.

### fromRefs

`DmTilesetRef`[]

Tileset references defining the source GID mapping.

### toRefs

`DmTilesetRef`[]

Tileset references defining the target GID mapping.

## Returns

`Uint32Array`

A new Uint32Array with remapped GIDs and preserved flip flags.
