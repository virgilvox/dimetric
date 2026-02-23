import type { DmMap, DmTileset } from '@dimetric/core';
import type { AseJsonResult, TpAtlasResult } from '@dimetric/formats';
import {
  parseTmj,
  parseTmx,
  parseTsjTileset,
  parseTsxTileset,
  parseAseJson,
  parseTexturePackerJson,
} from '@dimetric/formats';
import type { DetectedFormat } from './format-detector';

/** Result of an import operation, discriminated by `type`. */
export interface ImportResult {
  type: 'map' | 'tileset' | 'atlas' | 'project' | 'image';
  map?: DmMap;
  tileset?: DmTileset;
  atlas?: AseJsonResult | TpAtlasResult;
  atlasFormat?: 'aseprite' | 'texturepacker';
  imageDataUrl?: string;
  imageSize?: { width: number; height: number };
  projectJson?: string;
}

/**
 * Handle importing a file based on its detected format.
 *
 * Reads the file, calls the appropriate parser, and returns a typed result.
 *
 * @param file - The file to import.
 * @param format - The detected format of the file.
 * @returns The parsed import result.
 */
export async function handleImport(file: File, format: DetectedFormat): Promise<ImportResult> {
  switch (format) {
    case 'tiled-map-json': {
      const text = await file.text();
      const json = JSON.parse(text);
      const map = await parseTmj(json);
      return { type: 'map', map };
    }

    case 'tiled-map-xml': {
      const text = await file.text();
      const map = await parseTmx(text);
      return { type: 'map', map };
    }

    case 'tiled-tileset-json': {
      const text = await file.text();
      const json = JSON.parse(text);
      const tileset = parseTsjTileset(json);
      return { type: 'tileset', tileset };
    }

    case 'tiled-tileset-xml': {
      const text = await file.text();
      const tileset = parseTsxTileset(text);
      return { type: 'tileset', tileset };
    }

    case 'aseprite-json': {
      const text = await file.text();
      const json = JSON.parse(text);
      const atlas = parseAseJson(json);
      return { type: 'atlas', atlas, atlasFormat: 'aseprite' };
    }

    case 'texturepacker-json': {
      const text = await file.text();
      const json = JSON.parse(text);
      const atlas = parseTexturePackerJson(json);
      return { type: 'atlas', atlas, atlasFormat: 'texturepacker' };
    }

    case 'dimetric-project': {
      const text = await file.text();
      return { type: 'project', projectJson: text };
    }

    case 'image': {
      const dataUrl = await readFileAsDataUrl(file);
      const size = await getImageSize(dataUrl);
      return { type: 'image', imageDataUrl: dataUrl, imageSize: size };
    }

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function getImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}
