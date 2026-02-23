import type { Size } from './geometry';
import type { DmPropertyBag } from './properties';
import type { DmWangSet } from './wang';

/** Shape type for collision regions on a tile. */
export type DmCollisionShapeType = 'rect' | 'ellipse' | 'polygon';

/** A collision shape defined on a tile. */
export interface DmCollisionShape {
  type: DmCollisionShapeType;
  /** For rect/ellipse: x, y, width, height. For polygon: flat array of x,y pairs. */
  data: number[];
}

/** A single frame in a tile animation. */
export interface DmTileAnimationFrame {
  /** Local tile ID within the tileset. */
  tileId: number;
  /** Duration of this frame in milliseconds. */
  duration: number;
}

/** Per-tile metadata: collision, animation, custom properties. */
export interface DmTileData {
  /** Local tile ID within the tileset. */
  localId: number;
  collision?: DmCollisionShape[];
  animation?: DmTileAnimationFrame[];
  probability?: number;
  properties?: DmPropertyBag;
}

/** A tileset: an image sliced into a grid of tiles. */
export interface DmTileset {
  /** Unique ID within the project. */
  id: string;
  name: string;
  /** Path or data URI of the tileset image. */
  imageSource: string;
  /** Full image dimensions in pixels. */
  imageSize: Size;
  /** Size of a single tile in pixels. */
  tileSize: Size;
  /** Number of tile columns in the image. */
  columns: number;
  /** Total number of tiles. */
  tileCount: number;
  /** Spacing between tiles in the image (pixels). */
  spacing: number;
  /** Margin around the image edge (pixels). */
  margin: number;
  /** Per-tile data keyed by local tile ID. */
  tiles: Record<number, DmTileData>;
  properties?: DmPropertyBag;
  /** Wang sets for terrain auto-tiling. */
  wangSets?: DmWangSet[];
}
