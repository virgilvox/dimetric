import type { DmPropertyBag } from './properties';

/** A Wang color used in terrain auto-tiling. */
export interface DmWangColor {
  name: string;
  color: string;
  tile: number;
  probability: number;
  properties?: DmPropertyBag;
}

/** A tile mapped to Wang color indices. */
export interface DmWangTile {
  tileId: number;
  /** Array of 8 color indices (corner/edge for each direction). */
  wangId: number[];
}

/** Type of Wang set. */
export type DmWangSetType = 'corner' | 'edge' | 'mixed';

/** A Wang set for terrain auto-tiling rules. */
export interface DmWangSet {
  name: string;
  type: DmWangSetType;
  colors: DmWangColor[];
  wangTiles: DmWangTile[];
  properties?: DmPropertyBag;
}
