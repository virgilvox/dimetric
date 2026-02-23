import type { DmMap } from '@dimetric/core';
import { HTML_TEMPLATE } from './html-template';

/**
 * Convert Uint32Arrays to plain number arrays for JSON serialization.
 */
function serializeMap(map: DmMap): any {
  return {
    ...map,
    layers: map.layers.map(layer => {
      if (layer.type === 'tile') {
        return {
          ...layer,
          data: Array.from(layer.data),
        };
      }
      return layer;
    }),
  };
}

/**
 * Export a map as a self-contained HTML file.
 */
export function exportAsHtml(map: DmMap): string {
  const serializedMap = serializeMap(map);
  const mapJson = JSON.stringify(serializedMap, null, 2);

  return HTML_TEMPLATE
    .replace('{{TITLE}}', map.name || 'Dimetric Game')
    .replace('{{MAP_JSON}}', mapJson)
    .replace('{{RUNTIME_SCRIPT}}', '// Standalone mode - using inline PixiJS');
}
