import { generateId } from '@dimetric/core';
import type {
  DmTileset, DmTileData, DmTileAnimationFrame, DmCollisionShape,
} from '@dimetric/core';
import type { DmWangSet, DmWangColor, DmWangTile } from '@dimetric/core';
import type { DmPropertyBag, DmPropertyType } from '@dimetric/core';

/**
 * Parse a Tiled JSON tileset (.tsj) into a DmTileset.
 *
 * Handles tile animations, collision shapes, wang sets, and per-tile properties.
 *
 * @param json - The parsed JSON object from a .tsj file or an embedded tileset entry.
 * @returns A DmTileset with all tile metadata populated.
 */
export function parseTsjTileset(json: any): DmTileset {
  const tileWidth = json.tilewidth;
  const tileHeight = json.tileheight;
  const imageWidth = json.imagewidth ?? 0;
  const imageHeight = json.imageheight ?? 0;
  const columns = json.columns ?? (imageWidth > 0 ? Math.floor(imageWidth / tileWidth) : 0);
  const tileCount = json.tilecount ?? (columns * (imageHeight > 0 ? Math.floor(imageHeight / tileHeight) : 0));

  const tiles: Record<number, DmTileData> = {};
  for (const t of json.tiles ?? []) {
    tiles[t.id] = parseTileData(t);
  }

  const wangSets = (json.wangsets ?? []).map(parseWangSet);

  return {
    id: generateId(),
    name: json.name ?? 'Untitled Tileset',
    imageSource: json.image ?? '',
    imageSize: { width: imageWidth, height: imageHeight },
    tileSize: { width: tileWidth, height: tileHeight },
    columns,
    tileCount,
    spacing: json.spacing ?? 0,
    margin: json.margin ?? 0,
    tiles,
    properties: parseProperties(json.properties),
    ...(wangSets.length > 0 ? { wangSets } : {}),
  };
}

function parseTileData(t: any): DmTileData {
  const data: DmTileData = { localId: t.id };

  if (t.animation) {
    data.animation = t.animation.map((f: any) => ({
      tileId: f.tileid,
      duration: f.duration,
    } as DmTileAnimationFrame));
  }

  if (t.objectgroup?.objects) {
    data.collision = t.objectgroup.objects.map((obj: any): DmCollisionShape => {
      if (obj.ellipse) {
        return { type: 'ellipse', data: [obj.x, obj.y, obj.width, obj.height] };
      }
      if (obj.polygon) {
        const flat: number[] = [];
        for (const pt of obj.polygon) {
          flat.push(obj.x + pt.x, obj.y + pt.y);
        }
        return { type: 'polygon', data: flat };
      }
      return { type: 'rect', data: [obj.x, obj.y, obj.width, obj.height] };
    });
  }

  if (t.probability !== undefined) {
    data.probability = t.probability;
  }

  const props = parseProperties(t.properties);
  if (props) data.properties = props;

  return data;
}

function parseWangSet(ws: any): DmWangSet {
  const colors: DmWangColor[] = (ws.colors ?? []).map((c: any) => ({
    name: c.name ?? '',
    color: c.color ?? '#000000',
    tile: c.tile ?? -1,
    probability: c.probability ?? 1,
    ...(parseProperties(c.properties) ? { properties: parseProperties(c.properties) } : {}),
  }));

  const wangTiles: DmWangTile[] = (ws.wangtiles ?? []).map((wt: any) => ({
    tileId: wt.tileid,
    wangId: wt.wangid,
  }));

  return {
    name: ws.name ?? '',
    type: ws.type ?? 'corner',
    colors,
    wangTiles,
    ...(parseProperties(ws.properties) ? { properties: parseProperties(ws.properties) } : {}),
  };
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
