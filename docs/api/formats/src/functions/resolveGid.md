[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [formats/src](../README.md) / resolveGid

# Function: resolveGid()

> **resolveGid**(`gid`, `tilesetRefs`): \{ `localId`: `number`; `tilesetRef`: `DmTilesetRef`; \} \| `null`

Defined in: formats/src/tmx/gid-utils.ts:10

Resolve a global tile ID (GID) to the owning tileset and local tile ID.

## Parameters

### gid

`number`

The global tile ID to resolve. GID 0 represents an empty tile.

### tilesetRefs

`DmTilesetRef`[]

Tileset references sorted by firstGid ascending.

## Returns

\{ `localId`: `number`; `tilesetRef`: `DmTilesetRef`; \} \| `null`

The matching tileset reference and local tile ID, or null for GID 0 / no match.
