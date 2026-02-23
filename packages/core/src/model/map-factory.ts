import type { DmMap, DmTileLayer, DmObjectLayer, DmImageLayer, DmGroupLayer } from '../types/map';
import type { Size } from '../types/geometry';
import { generateId } from './id-generator';
import { DEFAULT_TILE_WIDTH, DEFAULT_TILE_HEIGHT, DEFAULT_MAP_COLS, DEFAULT_MAP_ROWS } from '../constants';

export interface CreateMapOptions {
  name?: string;
  mapSize?: Size;
  tileSize?: Size;
}

/** Create a new empty isometric map with one tile layer. */
export function createMap(options?: CreateMapOptions): DmMap {
  const mapSize = options?.mapSize ?? { width: DEFAULT_MAP_COLS, height: DEFAULT_MAP_ROWS };
  const tileSize = options?.tileSize ?? { width: DEFAULT_TILE_WIDTH, height: DEFAULT_TILE_HEIGHT };
  if (mapSize.width <= 0 || mapSize.height <= 0) {
    throw new Error(`Invalid map dimensions: ${mapSize.width}x${mapSize.height} (must be positive)`);
  }
  if (tileSize.width <= 0 || tileSize.height <= 0) {
    throw new Error(`Invalid tile dimensions: ${tileSize.width}x${tileSize.height} (must be positive)`);
  }
  const layer = createTileLayer({
    name: 'Layer 1',
    width: mapSize.width,
    height: mapSize.height,
  });
  return {
    id: generateId(),
    name: options?.name ?? 'Untitled Map',
    orientation: 'isometric',
    renderOrder: 'right-down',
    mapSize,
    tileSize,
    layers: [layer],
    tilesets: [],
  };
}

export interface CreateTileLayerOptions {
  name?: string;
  width: number;
  height: number;
}

/** Create a new empty tile layer. */
export function createTileLayer(options: CreateTileLayerOptions): DmTileLayer {
  if (options.width <= 0 || options.height <= 0) {
    throw new Error(`Invalid tile layer dimensions: ${options.width}x${options.height} (must be positive)`);
  }
  return {
    id: generateId(),
    name: options.name ?? 'Tile Layer',
    type: 'tile',
    visible: true,
    locked: false,
    opacity: 1,
    offset: { x: 0, y: 0 },
    width: options.width,
    height: options.height,
    data: new Uint32Array(options.width * options.height),
  };
}

export interface CreateObjectLayerOptions {
  name?: string;
}

/** Create a new empty object layer. */
export function createObjectLayer(options?: CreateObjectLayerOptions): DmObjectLayer {
  return {
    id: generateId(),
    name: options?.name ?? 'Object Layer',
    type: 'object',
    visible: true,
    locked: false,
    opacity: 1,
    offset: { x: 0, y: 0 },
    objects: [],
  };
}

export interface CreateImageLayerOptions {
  name?: string;
  imageSource: string;
}

/** Create a new image layer. */
export function createImageLayer(options: CreateImageLayerOptions): DmImageLayer {
  return {
    id: generateId(),
    name: options.name ?? 'Image Layer',
    type: 'image',
    visible: true,
    locked: false,
    opacity: 1,
    offset: { x: 0, y: 0 },
    imageSource: options.imageSource,
  };
}

export interface CreateGroupLayerOptions {
  name?: string;
}

/** Create a new empty group layer. */
export function createGroupLayer(options?: CreateGroupLayerOptions): DmGroupLayer {
  return {
    id: generateId(),
    name: options?.name ?? 'Group',
    type: 'group',
    visible: true,
    locked: false,
    opacity: 1,
    offset: { x: 0, y: 0 },
    layers: [],
  };
}
