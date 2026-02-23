import { XMLParser } from 'fast-xml-parser';
import { generateId } from '@dimetric/core';
import type {
  DmMap, DmTileLayer, DmObjectLayer, DmImageLayer, DmGroupLayer,
  DmLayer, DmObject, DmTilesetRef, DmTileset, DmTileData,
  DmOrientation, DmRenderOrder,
} from '@dimetric/core';
import type { DmPropertyBag, DmPropertyType } from '@dimetric/core';
import { parseTsxTileset } from './tsx-parser';
import { decodeTileData } from './compression';

/** Options for controlling how TMX files are parsed. */
export interface TmxParseOptions {
  /** Resolver for external tileset/image sources. Return the raw text content. */
  resolveExternal?: (source: string) => string | Promise<string>;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['layer', 'objectgroup', 'imagelayer', 'group', 'object', 'property', 'tileset', 'tile', 'frame', 'wangset', 'wangcolor', 'wangtile'].includes(name),
  parseAttributeValue: true,
});

/**
 * Parse a Tiled XML map (.tmx) into a DmMap.
 *
 * Supports embedded and external tilesets, all layer types (tile, object,
 * image, group), and CSV/base64 tile data encodings with optional compression.
 *
 * @param xml - The raw XML string from a .tmx file.
 * @param options - Optional configuration, including an external resource resolver.
 * @returns A DmMap representing the Tiled map.
 * @throws If the XML does not contain a valid {@link https://doc.mapeditor.org/en/stable/reference/tmx-map-format/ | TMX map} root element.
 */
export async function parseTmx(xml: string, options?: TmxParseOptions): Promise<DmMap> {
  const doc = xmlParser.parse(xml);
  const mapNode = doc.map;
  if (!mapNode) throw new Error('Invalid TMX: no <map> root element');

  const orientation = (mapNode['@_orientation'] ?? 'orthogonal') as DmOrientation;
  const renderOrder = (mapNode['@_renderorder'] ?? 'right-down') as DmRenderOrder;
  const mapWidth = mapNode['@_width'];
  const mapHeight = mapNode['@_height'];
  const tileWidth = mapNode['@_tilewidth'];
  const tileHeight = mapNode['@_tileheight'];

  // Parse tilesets
  const tilesetRefs: DmTilesetRef[] = [];
  for (const tsNode of asArray(mapNode.tileset)) {
    const firstGid = tsNode['@_firstgid'];
    if (tsNode['@_source'] && options?.resolveExternal) {
      const tsxContent = await options.resolveExternal(tsNode['@_source']);
      const tileset = parseTsxTileset(tsxContent);
      tilesetRefs.push({ firstGid: firstGid, tileset });
    } else {
      // Embedded tileset
      const tileset = parseTsxTilesetNode(tsNode);
      tilesetRefs.push({ firstGid: firstGid, tileset });
    }
  }

  // Parse layers (multiple types can be at root level)
  const layers = parseLayerNodes(mapNode, mapWidth, mapHeight);

  return {
    id: generateId(),
    name: mapNode['@_class'] ?? 'Imported Map',
    orientation,
    renderOrder,
    mapSize: { width: mapWidth, height: mapHeight },
    tileSize: { width: tileWidth, height: tileHeight },
    layers,
    tilesets: tilesetRefs,
    properties: parsePropertiesNode(mapNode.properties),
  };
}

function parseLayerNodes(parent: any, mapWidth: number, mapHeight: number): DmLayer[] {
  const layers: DmLayer[] = [];

  for (const node of asArray(parent.layer)) {
    layers.push(parseTileLayerNode(node, mapWidth, mapHeight));
  }
  for (const node of asArray(parent.objectgroup)) {
    layers.push(parseObjectGroupNode(node));
  }
  for (const node of asArray(parent.imagelayer)) {
    layers.push(parseImageLayerNode(node));
  }
  for (const node of asArray(parent.group)) {
    layers.push(parseGroupNode(node, mapWidth, mapHeight));
  }

  return layers;
}

function baseLayer(node: any) {
  return {
    id: generateId(),
    name: node['@_name'] ?? '',
    visible: (node['@_visible'] ?? 1) !== 0,
    locked: (node['@_locked'] ?? 0) !== 0,
    opacity: node['@_opacity'] ?? 1,
    offset: { x: node['@_offsetx'] ?? 0, y: node['@_offsety'] ?? 0 },
    properties: parsePropertiesNode(node.properties),
  };
}

function parseTileLayerNode(node: any, mapWidth: number, mapHeight: number): DmTileLayer {
  const width = node['@_width'] ?? mapWidth;
  const height = node['@_height'] ?? mapHeight;
  const dataNode = node.data;
  let data: Uint32Array;

  if (dataNode) {
    const encoding = dataNode['@_encoding'];
    const compression = dataNode['@_compression'];
    const text = typeof dataNode === 'string' ? dataNode : (dataNode['#text'] ?? '');
    data = decodeTileData(text, encoding, compression, width * height);
  } else {
    data = new Uint32Array(width * height);
  }

  return { ...baseLayer(node), type: 'tile', width, height, data };
}

function parseObjectGroupNode(node: any): DmObjectLayer {
  const objects: DmObject[] = asArray(node.object).map((obj: any) => ({
    id: generateId(),
    name: obj['@_name'] ?? '',
    type: obj['@_type'] ?? obj['@_class'] ?? '',
    x: obj['@_x'] ?? 0,
    y: obj['@_y'] ?? 0,
    width: obj['@_width'] ?? 0,
    height: obj['@_height'] ?? 0,
    rotation: obj['@_rotation'] ?? 0,
    gid: obj['@_gid'],
    visible: (obj['@_visible'] ?? 1) !== 0,
    properties: parsePropertiesNode(obj.properties),
  }));
  return { ...baseLayer(node), type: 'object', objects };
}

function parseImageLayerNode(node: any): DmImageLayer {
  const image = node.image;
  const source = image?.['@_source'] ?? '';
  return { ...baseLayer(node), type: 'image', imageSource: source };
}

function parseGroupNode(node: any, mapWidth: number, mapHeight: number): DmGroupLayer {
  return { ...baseLayer(node), type: 'group', layers: parseLayerNodes(node, mapWidth, mapHeight) };
}

function parsePropertiesNode(propsNode: any): DmPropertyBag | undefined {
  if (!propsNode) return undefined;
  const propArray = asArray(propsNode.property);
  if (propArray.length === 0) return undefined;
  const bag: DmPropertyBag = {};
  for (const p of propArray) {
    const name = p['@_name'];
    const type = (p['@_type'] ?? 'string') as DmPropertyType;
    let value: string | number | boolean = p['@_value'] ?? p['#text'] ?? '';
    if (type === 'bool') value = value === 'true' || value === true;
    if (type === 'int') value = parseInt(String(value), 10);
    if (type === 'float') value = parseFloat(String(value));
    bag[name] = { name, type, value };
  }
  return bag;
}

/**
 * Parse an embedded XML tileset node into a DmTileset.
 *
 * Used internally by {@link parseTmx} for inline tilesets and by
 * {@link parseTsxTileset} for standalone .tsx files.
 *
 * @param node - The parsed XML tileset node object.
 * @returns A DmTileset with tile data, animations, collision, and wang sets.
 */
export function parseTsxTilesetNode(node: any): DmTileset {
  const imageNode = node.image;
  const tileWidth = node['@_tilewidth'];
  const tileHeight = node['@_tileheight'];
  const imageWidth = imageNode?.['@_width'] ?? 0;
  const imageHeight = imageNode?.['@_height'] ?? 0;
  const columns = node['@_columns'] ?? (imageWidth > 0 ? Math.floor(imageWidth / tileWidth) : 0);
  const tileCount = node['@_tilecount'] ?? (columns > 0 ? columns * Math.floor(imageHeight / tileHeight) : 0);

  const tiles: Record<number, DmTileData> = {};
  for (const t of asArray(node.tile)) {
    const localId = t['@_id'];
    const tileData: any = { localId };
    if (t.animation) {
      tileData.animation = asArray(t.animation?.frame ?? t.animation).map((f: any) => ({
        tileId: f['@_tileid'],
        duration: f['@_duration'],
      }));
    }
    if (t.objectgroup?.object) {
      tileData.collision = asArray(t.objectgroup.object).map((obj: any) => {
        if (obj.ellipse !== undefined) {
          return { type: 'ellipse' as const, data: [obj['@_x'] ?? 0, obj['@_y'] ?? 0, obj['@_width'] ?? 0, obj['@_height'] ?? 0] };
        }
        if (obj.polygon) {
          const points = (obj.polygon['@_points'] ?? '').split(' ').flatMap((p: string) => {
            const [x, y] = p.split(',').map(Number);
            return [(obj['@_x'] ?? 0) + x, (obj['@_y'] ?? 0) + y];
          });
          return { type: 'polygon' as const, data: points };
        }
        return { type: 'rect' as const, data: [obj['@_x'] ?? 0, obj['@_y'] ?? 0, obj['@_width'] ?? 0, obj['@_height'] ?? 0] };
      });
    }
    if (t['@_probability'] !== undefined) tileData.probability = t['@_probability'];
    const props = parsePropertiesNode(t.properties);
    if (props) tileData.properties = props;
    tiles[localId] = tileData;
  }

  const wangSets = asArray(node.wangsets?.wangset).map((ws: any) => ({
    name: ws['@_name'] ?? '',
    type: (ws['@_type'] ?? 'corner') as 'corner' | 'edge' | 'mixed',
    colors: asArray(ws.wangcolor).map((c: any) => ({
      name: c['@_name'] ?? '',
      color: c['@_color'] ?? '#000000',
      tile: c['@_tile'] ?? -1,
      probability: c['@_probability'] ?? 1,
    })),
    wangTiles: asArray(ws.wangtile).map((wt: any) => ({
      tileId: wt['@_tileid'],
      wangId: (wt['@_wangid'] ?? '').split(',').map(Number),
    })),
  }));

  return {
    id: generateId(),
    name: node['@_name'] ?? 'Untitled Tileset',
    imageSource: imageNode?.['@_source'] ?? '',
    imageSize: { width: imageWidth, height: imageHeight },
    tileSize: { width: tileWidth, height: tileHeight },
    columns,
    tileCount,
    spacing: node['@_spacing'] ?? 0,
    margin: node['@_margin'] ?? 0,
    tiles,
    properties: parsePropertiesNode(node.properties),
    ...(wangSets.length > 0 ? { wangSets } : {}),
  };
}

function asArray<T>(val: T | T[] | undefined | null): T[] {
  if (val == null) return [];
  return Array.isArray(val) ? val : [val];
}
