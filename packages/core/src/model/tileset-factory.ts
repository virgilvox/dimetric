import type { DmTileset } from '../types/tileset';
import type { Size } from '../types/geometry';
import { generateId } from './id-generator';

export interface CreateTilesetOptions {
  name: string;
  imageSource: string;
  imageSize: Size;
  tileSize: Size;
  spacing?: number;
  margin?: number;
}

/** Create a new tileset from an image with grid parameters. */
export function createTileset(options: CreateTilesetOptions): DmTileset {
  const { imageSize, tileSize, spacing = 0, margin = 0 } = options;
  const usableWidth = imageSize.width - 2 * margin + spacing;
  const usableHeight = imageSize.height - 2 * margin + spacing;
  const columns = Math.floor(usableWidth / (tileSize.width + spacing));
  const rows = Math.floor(usableHeight / (tileSize.height + spacing));
  const tileCount = columns * rows;

  return {
    id: generateId(),
    name: options.name,
    imageSource: options.imageSource,
    imageSize,
    tileSize,
    columns,
    tileCount,
    spacing,
    margin,
    tiles: {},
  };
}
