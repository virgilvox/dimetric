import type { DmTilesetRef } from '@dimetric/core';

/**
 * Resolve a global tile ID (GID) to the owning tileset and local tile ID.
 *
 * @param gid - The global tile ID to resolve. GID 0 represents an empty tile.
 * @param tilesetRefs - Tileset references sorted by firstGid ascending.
 * @returns The matching tileset reference and local tile ID, or null for GID 0 / no match.
 */
export function resolveGid(
  gid: number,
  tilesetRefs: DmTilesetRef[],
): { tilesetRef: DmTilesetRef; localId: number } | null {
  if (gid === 0) return null;
  // Find the tileset with the highest firstGid <= gid
  let match: DmTilesetRef | null = null;
  for (const ref of tilesetRefs) {
    if (ref.firstGid <= gid) {
      match = ref;
    } else {
      break;
    }
  }
  if (!match) return null;
  return { tilesetRef: match, localId: gid - match.firstGid };
}

/**
 * Remap tile data from one GID space to another.
 *
 * Preserves flip flags (upper 3 bits) while translating the tile GID
 * portion. Used when importing from Tiled where firstGids may differ.
 *
 * @param data - Source tile data array with GIDs in the original space.
 * @param fromRefs - Tileset references defining the source GID mapping.
 * @param toRefs - Tileset references defining the target GID mapping.
 * @returns A new Uint32Array with remapped GIDs and preserved flip flags.
 */
export function remapTileData(
  data: Uint32Array,
  fromRefs: DmTilesetRef[],
  toRefs: DmTilesetRef[],
): Uint32Array {
  const result = new Uint32Array(data.length);
  const GID_MASK = 0x1FFFFFFF;
  const FLAG_MASK = 0xE0000000;

  for (let i = 0; i < data.length; i++) {
    const raw = data[i];
    if (raw === 0) continue;
    const flags = raw & FLAG_MASK;
    const gid = raw & GID_MASK;

    const resolved = resolveGid(gid, fromRefs);
    if (!resolved) continue;

    // Find the same tileset in the target refs (by tileset id)
    const targetRef = toRefs.find(
      (r) => r.tileset.id === resolved.tilesetRef.tileset.id,
    );
    if (!targetRef) continue;

    result[i] = ((targetRef.firstGid + resolved.localId) | flags) >>> 0;
  }
  return result;
}
