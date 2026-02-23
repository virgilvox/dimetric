import type { Size, Point } from './geometry';
import type { DmPropertyBag } from './properties';
import type { DmTileset } from './tileset';

/** Orientation of the map. */
export type DmOrientation = 'isometric' | 'orthogonal' | 'staggered' | 'hexagonal';

/** Rendering order for tiles. */
export type DmRenderOrder = 'right-down' | 'right-up' | 'left-down' | 'left-up';

/** Layer types. */
export type DmLayerType = 'tile' | 'object' | 'image' | 'group';

/** Base fields shared by all layer types. */
export interface DmLayerBase {
  id: string;
  name: string;
  type: DmLayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  /** Pixel offset for the layer. */
  offset: Point;
  properties?: DmPropertyBag;
}

/** A tile layer stores a flat grid of tile GIDs. */
export interface DmTileLayer extends DmLayerBase {
  type: 'tile';
  /** Width in tiles. */
  width: number;
  /** Height in tiles. */
  height: number;
  /**
   * Flat array of tile GIDs, length = width * height.
   * 0 means empty. Top 3 bits encode flip flags (matching Tiled convention).
   */
  data: Uint32Array;
}

/** An object on an object layer. */
export interface DmObject {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  gid?: number;
  visible: boolean;
  properties?: DmPropertyBag;
}

/** An object layer stores freely-placed objects. */
export interface DmObjectLayer extends DmLayerBase {
  type: 'object';
  objects: DmObject[];
}

/** An image layer displays a single background image. */
export interface DmImageLayer extends DmLayerBase {
  type: 'image';
  imageSource: string;
}

/** A group layer contains child layers. */
export interface DmGroupLayer extends DmLayerBase {
  type: 'group';
  layers: DmLayer[];
}

/** Discriminated union of all layer types. */
export type DmLayer = DmTileLayer | DmObjectLayer | DmImageLayer | DmGroupLayer;

/** Reference to a tileset used in a map, with its first GID. */
export interface DmTilesetRef {
  firstGid: number;
  tileset: DmTileset;
}

/** A complete tile map. */
export interface DmMap {
  id: string;
  name: string;
  orientation: DmOrientation;
  renderOrder: DmRenderOrder;
  /** Map dimensions in tiles. */
  mapSize: Size;
  /** Tile dimensions in pixels. */
  tileSize: Size;
  /** Layers in draw order (bottom to top). */
  layers: DmLayer[];
  /** Tilesets referenced by this map, sorted by firstGid. */
  tilesets: DmTilesetRef[];
  properties?: DmPropertyBag;
}
