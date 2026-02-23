/** Current schema version for the native dimetric format. */
export const SCHEMA_VERSION = 1;

/** Magic string marker used to identify serialized DmProject JSON files. */
export const FORMAT_MAGIC = 'dimetric-project';

/** Serialized representation of a DmProject, suitable for JSON persistence. */
export interface SerializedProject {
  _format: typeof FORMAT_MAGIC;
  _version: number;
  name: string;
  maps: SerializedMap[];
  tilesets: SerializedTileset[];
}

/** Serialized representation of a DmMap within a project file. */
export interface SerializedMap {
  id: string;
  name: string;
  orientation: string;
  renderOrder: string;
  mapSize: { width: number; height: number };
  tileSize: { width: number; height: number };
  layers: SerializedLayer[];
  tilesets: { firstGid: number; tilesetId: string }[];
  properties?: Record<string, unknown>;
}

/** Serialized representation of a map layer (tile, object, image, or group). */
export interface SerializedLayer {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  offset: { x: number; y: number };
  // Tile layer specific
  width?: number;
  height?: number;
  /** Tile data stored as regular number array for JSON compatibility. */
  data?: number[];
  // Object layer specific
  objects?: unknown[];
  // Image layer specific
  imageSource?: string;
  // Group layer specific
  layers?: SerializedLayer[];
  properties?: Record<string, unknown>;
}

/** Serialized representation of a DmTileset within a project file. */
export interface SerializedTileset {
  id: string;
  name: string;
  imageSource: string;
  imageSize: { width: number; height: number };
  tileSize: { width: number; height: number };
  columns: number;
  tileCount: number;
  spacing: number;
  margin: number;
  tiles: Record<string, unknown>;
  properties?: Record<string, unknown>;
}
