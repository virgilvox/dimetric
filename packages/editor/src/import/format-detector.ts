/**
 * Detected file format for import.
 */
export type DetectedFormat =
  | 'dimetric-project'
  | 'tiled-map-json'
  | 'tiled-map-xml'
  | 'tiled-tileset-json'
  | 'tiled-tileset-xml'
  | 'aseprite-json'
  | 'texturepacker-json'
  | 'image'
  | 'unknown';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

/**
 * Detect the format of a file based on extension and optional content inspection.
 *
 * @param file - The file to detect.
 * @param content - Optional text content (for JSON/XML inspection).
 * @returns The detected format.
 */
export function detectFormat(file: File, content?: string): DetectedFormat {
  const name = file.name.toLowerCase();
  const ext = name.substring(name.lastIndexOf('.'));

  // Check extension-based formats first
  if (ext === '.tmx') return 'tiled-map-xml';
  if (ext === '.tsx') return 'tiled-tileset-xml';
  if (ext === '.tmj') return 'tiled-map-json';
  if (ext === '.tsj') return 'tiled-tileset-json';
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';

  // For .json and .dimetric files, inspect content
  if ((ext === '.json' || name.endsWith('.dimetric.json') || ext === '.dimetric') && content) {
    try {
      const parsed = JSON.parse(content);
      return detectJsonFormat(parsed);
    } catch {
      return 'unknown';
    }
  }

  return 'unknown';
}

/**
 * Detect format from a parsed JSON object.
 */
function detectJsonFormat(json: any): DetectedFormat {
  // Native dimetric project
  if (json._format === 'dimetric-project') return 'dimetric-project';

  // Aseprite JSON (meta.app contains "Aseprite")
  if (json.meta?.app && typeof json.meta.app === 'string' && json.meta.app.includes('Aseprite')) {
    return 'aseprite-json';
  }

  // TexturePacker JSON (meta.app contains "Texture")
  if (json.meta?.app && typeof json.meta.app === 'string' && json.meta.app.includes('Texture')) {
    return 'texturepacker-json';
  }

  // Tiled tileset JSON (has tilewidth but no layers)
  if (json.tilewidth !== undefined && !json.layers) {
    return 'tiled-tileset-json';
  }

  // Tiled map JSON (has layers)
  if (json.layers) {
    return 'tiled-map-json';
  }

  return 'unknown';
}
