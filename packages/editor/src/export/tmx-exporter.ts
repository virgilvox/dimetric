import type { DmMap } from '@dimetric/core';
import { writeTmx, writeTmjString } from '@dimetric/formats';

/**
 * Export a map in Tiled TMX (XML) format.
 */
export function exportAsTmx(map: DmMap): string {
  return writeTmx(map);
}

/**
 * Export a map in Tiled TMJ (JSON) format.
 */
export function exportAsTmj(map: DmMap): string {
  return writeTmjString(map);
}

/**
 * Generate a safe filename from the map name.
 */
export function getMapFilename(map: DmMap, extension: string): string {
  const safeName = (map.name || 'untitled')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${safeName}.${extension}`;
}
