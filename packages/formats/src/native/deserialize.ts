import type {
  DmProject, DmMap, DmLayer, DmTileLayer, DmObjectLayer,
  DmImageLayer, DmGroupLayer, DmTileset, DmTilesetRef,
  DmOrientation, DmRenderOrder,
} from '@dimetric/core';
import { PROJECT_VERSION } from '@dimetric/core';
import { FORMAT_MAGIC, type SerializedProject, type SerializedMap, type SerializedLayer, type SerializedTileset } from './schema';

/**
 * Deserialize a JSON-parsed object into a DmProject.
 *
 * Validates the format marker and schema version, then reconstructs
 * Uint32Array tile data from plain number arrays.
 *
 * @param data - The raw parsed JSON object (from JSON.parse or similar).
 * @returns A fully hydrated DmProject instance.
 * @throws If the data is not a valid dimetric project or has an unsupported version.
 */
export function deserializeProject(data: unknown): DmProject {
  if (typeof data !== 'object' || data === null) {
    throw new Error(`Invalid project data: expected an object`);
  }
  const raw = data as SerializedProject;
  if (raw._format !== FORMAT_MAGIC) {
    throw new Error(`Not a Dimetric project file (missing format marker)`);
  }
  if (raw._version > PROJECT_VERSION) {
    throw new Error(`Project version ${raw._version} is newer than supported version ${PROJECT_VERSION}`);
  }
  if (!Array.isArray(raw.tilesets)) {
    throw new Error(`Invalid project data: missing tilesets array`);
  }
  if (!Array.isArray(raw.maps)) {
    throw new Error(`Invalid project data: missing maps array`);
  }

  const tilesetMap = new Map<string, DmTileset>();
  const tilesets = raw.tilesets.map((ts) => {
    const tileset = deserializeTileset(ts);
    tilesetMap.set(tileset.id, tileset);
    return tileset;
  });

  const maps = raw.maps.map((m) => deserializeMap(m, tilesetMap));

  return {
    version: raw._version,
    name: raw.name,
    maps,
    tilesets,
  };
}

function deserializeMap(raw: SerializedMap, tilesetMap: Map<string, DmTileset>): DmMap {
  const tilesetRefs: DmTilesetRef[] = raw.tilesets
    .map((ref) => {
      const tileset = tilesetMap.get(ref.tilesetId);
      if (!tileset) return null;
      return { firstGid: ref.firstGid, tileset };
    })
    .filter((r): r is DmTilesetRef => r !== null);

  return {
    id: raw.id,
    name: raw.name,
    orientation: raw.orientation as DmOrientation,
    renderOrder: raw.renderOrder as DmRenderOrder,
    mapSize: { ...raw.mapSize },
    tileSize: { ...raw.tileSize },
    layers: raw.layers.map(deserializeLayer),
    tilesets: tilesetRefs,
    properties: raw.properties as DmMap['properties'],
  };
}

function deserializeLayer(raw: SerializedLayer): DmLayer {
  const base = {
    id: raw.id,
    name: raw.name,
    visible: raw.visible,
    locked: raw.locked,
    opacity: raw.opacity,
    offset: { ...raw.offset },
    properties: raw.properties as DmLayer['properties'],
  };

  switch (raw.type) {
    case 'tile': {
      if (typeof raw.width !== 'number' || raw.width <= 0) {
        throw new Error(`Invalid tile layer "${raw.name}": width must be a positive number`);
      }
      if (typeof raw.height !== 'number' || raw.height <= 0) {
        throw new Error(`Invalid tile layer "${raw.name}": height must be a positive number`);
      }
      if (!Array.isArray(raw.data)) {
        throw new Error(`Invalid tile layer "${raw.name}": missing data array`);
      }
      return {
        ...base,
        type: 'tile' as const,
        width: raw.width,
        height: raw.height,
        data: new Uint32Array(raw.data),
      } satisfies DmTileLayer;
    }

    case 'object':
      return {
        ...base,
        type: 'object' as const,
        objects: (raw.objects ?? []) as DmObjectLayer['objects'],
      } satisfies DmObjectLayer;

    case 'image':
      return {
        ...base,
        type: 'image' as const,
        imageSource: raw.imageSource!,
      } satisfies DmImageLayer;

    case 'group':
      return {
        ...base,
        type: 'group' as const,
        layers: (raw.layers ?? []).map(deserializeLayer),
      } satisfies DmGroupLayer;

    default:
      throw new Error(`Unknown layer type: ${raw.type}`);
  }
}

function deserializeTileset(raw: SerializedTileset): DmTileset {
  return {
    id: raw.id,
    name: raw.name,
    imageSource: raw.imageSource,
    imageSize: { ...raw.imageSize },
    tileSize: { ...raw.tileSize },
    columns: raw.columns,
    tileCount: raw.tileCount,
    spacing: raw.spacing,
    margin: raw.margin,
    tiles: raw.tiles as DmTileset['tiles'],
    properties: raw.properties as DmTileset['properties'],
  };
}

/**
 * Deserialize a DmProject from a JSON string.
 *
 * @param json - The JSON string to parse.
 * @returns A fully hydrated DmProject instance.
 * @throws If the JSON is invalid or does not represent a valid dimetric project.
 */
export function deserializeProjectFromJson(json: string): DmProject {
  return deserializeProject(JSON.parse(json));
}
