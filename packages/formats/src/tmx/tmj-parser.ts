import { generateId } from '@dimetric/core';
import type {
  DmMap, DmLayer, DmTileLayer, DmObjectLayer, DmImageLayer, DmGroupLayer,
  DmObject, DmTilesetRef, DmOrientation, DmRenderOrder,
} from '@dimetric/core';
import type { DmPropertyBag, DmPropertyType } from '@dimetric/core';
import { parseTsjTileset } from './tsj-parser';
import { decodeTileData } from './compression';

/** Options for controlling how TMJ files are parsed. */
export interface TmjParseOptions {
  /** Resolver for external tileset sources. Return the parsed JSON object. */
  resolveTileset?: (source: string) => any | Promise<any>;
}

/**
 * Parse a Tiled JSON map (.tmj) into a DmMap.
 *
 * Supports embedded and external tilesets, all layer types, and
 * base64/CSV tile data encodings.
 *
 * @param json - The parsed JSON object from a .tmj file.
 * @param options - Optional configuration, including an external tileset resolver.
 * @returns A DmMap representing the Tiled map.
 */
export async function parseTmj(json: any, options?: TmjParseOptions): Promise<DmMap> {
  const orientation = (json.orientation ?? 'orthogonal') as DmOrientation;
  const renderOrder = (json.renderorder ?? 'right-down') as DmRenderOrder;

  // Parse tilesets
  const tilesetRefs: DmTilesetRef[] = [];
  for (const tsEntry of json.tilesets ?? []) {
    if (tsEntry.source && options?.resolveTileset) {
      const tsJson = await options.resolveTileset(tsEntry.source);
      const tileset = parseTsjTileset(tsJson);
      tilesetRefs.push({ firstGid: tsEntry.firstgid, tileset });
    } else {
      // Embedded tileset
      const tileset = parseTsjTileset(tsEntry);
      tilesetRefs.push({ firstGid: tsEntry.firstgid, tileset });
    }
  }

  // Parse layers
  const layers = parseLayers(json.layers ?? [], json);

  return {
    id: generateId(),
    name: json.class ?? json.type ?? 'Imported Map',
    orientation,
    renderOrder,
    mapSize: { width: json.width, height: json.height },
    tileSize: { width: json.tilewidth, height: json.tileheight },
    layers,
    tilesets: tilesetRefs,
    properties: parseProperties(json.properties),
  };
}

function parseLayers(layersJson: any[], mapJson: any): DmLayer[] {
  const layers: DmLayer[] = [];
  for (const lj of layersJson) {
    const layer = parseLayer(lj, mapJson);
    if (layer) layers.push(layer);
  }
  return layers;
}

function parseLayer(lj: any, mapJson: any): DmLayer | null {
  const base = {
    id: generateId(),
    name: lj.name ?? '',
    visible: lj.visible ?? true,
    locked: lj.locked ?? false,
    opacity: lj.opacity ?? 1,
    offset: { x: lj.offsetx ?? 0, y: lj.offsety ?? 0 },
    properties: parseProperties(lj.properties),
  };

  switch (lj.type) {
    case 'tilelayer': {
      const width = lj.width ?? mapJson.width;
      const height = lj.height ?? mapJson.height;
      let data: Uint32Array;
      if (Array.isArray(lj.data)) {
        data = new Uint32Array(lj.data);
      } else if (typeof lj.data === 'string') {
        data = decodeTileData(lj.data, lj.encoding, lj.compression, width * height);
      } else {
        data = new Uint32Array(width * height);
      }
      return { ...base, type: 'tile', width, height, data } as DmTileLayer;
    }
    case 'objectgroup': {
      const objects: DmObject[] = (lj.objects ?? []).map((obj: any) => ({
        id: generateId(),
        name: obj.name ?? '',
        type: obj.type ?? obj.class ?? '',
        x: obj.x ?? 0,
        y: obj.y ?? 0,
        width: obj.width ?? 0,
        height: obj.height ?? 0,
        rotation: obj.rotation ?? 0,
        gid: obj.gid,
        visible: obj.visible ?? true,
        properties: parseProperties(obj.properties),
      }));
      return { ...base, type: 'object', objects } as DmObjectLayer;
    }
    case 'imagelayer':
      return { ...base, type: 'image', imageSource: lj.image ?? '' } as DmImageLayer;
    case 'group':
      return { ...base, type: 'group', layers: parseLayers(lj.layers ?? [], mapJson) } as DmGroupLayer;
    default:
      return null;
  }
}

function parseProperties(props: any[] | undefined): DmPropertyBag | undefined {
  if (!props || !Array.isArray(props) || props.length === 0) return undefined;
  const bag: DmPropertyBag = {};
  for (const p of props) {
    bag[p.name] = {
      name: p.name,
      type: (p.type ?? 'string') as DmPropertyType,
      value: p.value,
    };
  }
  return bag;
}
