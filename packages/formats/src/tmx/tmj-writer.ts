import type {
  DmMap, DmLayer, DmObject, DmTilesetRef,
} from '@dimetric/core';
import type { DmPropertyBag } from '@dimetric/core';

/**
 * Convert a DmMap to a Tiled JSON map object (.tmj).
 *
 * Produces a plain object conforming to the Tiled JSON map format,
 * with embedded tilesets and CSV-style tile data arrays.
 *
 * @param map - The map to convert.
 * @returns A plain object ready for JSON.stringify.
 */
export function writeTmj(map: DmMap): any {
  return {
    type: 'map',
    version: '1.10',
    tiledversion: '1.10.0',
    orientation: map.orientation,
    renderorder: map.renderOrder,
    width: map.mapSize.width,
    height: map.mapSize.height,
    tilewidth: map.tileSize.width,
    tileheight: map.tileSize.height,
    infinite: false,
    layers: map.layers.map(writeLayer),
    tilesets: map.tilesets.map(writeTilesetRef),
    ...(map.properties ? { properties: writeProperties(map.properties) } : {}),
  };
}

/**
 * Convert a DmMap to a pretty-printed Tiled JSON string (.tmj).
 *
 * @param map - The map to convert.
 * @returns A JSON string with 2-space indentation.
 */
export function writeTmjString(map: DmMap): string {
  return JSON.stringify(writeTmj(map), null, 2);
}

function writeLayer(layer: DmLayer): any {
  const base = {
    name: layer.name,
    visible: layer.visible,
    opacity: layer.opacity,
    offsetx: layer.offset.x,
    offsety: layer.offset.y,
    x: 0,
    y: 0,
    ...(layer.properties ? { properties: writeProperties(layer.properties) } : {}),
  };

  switch (layer.type) {
    case 'tile':
      return {
        ...base,
        type: 'tilelayer',
        width: layer.width,
        height: layer.height,
        data: Array.from(layer.data),
      };
    case 'object':
      return {
        ...base,
        type: 'objectgroup',
        draworder: 'topdown',
        objects: layer.objects.map(writeObject),
      };
    case 'image':
      return {
        ...base,
        type: 'imagelayer',
        image: layer.imageSource,
      };
    case 'group':
      return {
        ...base,
        type: 'group',
        layers: layer.layers.map(writeLayer),
      };
  }
}

function writeObject(obj: DmObject): any {
  return {
    id: 0,
    name: obj.name,
    type: obj.type,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    rotation: obj.rotation,
    visible: obj.visible,
    ...(obj.gid !== undefined ? { gid: obj.gid } : {}),
    ...(obj.properties ? { properties: writeProperties(obj.properties) } : {}),
  };
}

function writeTilesetRef(ref: DmTilesetRef): any {
  return {
    firstgid: ref.firstGid,
    name: ref.tileset.name,
    image: ref.tileset.imageSource,
    imagewidth: ref.tileset.imageSize.width,
    imageheight: ref.tileset.imageSize.height,
    tilewidth: ref.tileset.tileSize.width,
    tileheight: ref.tileset.tileSize.height,
    columns: ref.tileset.columns,
    tilecount: ref.tileset.tileCount,
    spacing: ref.tileset.spacing,
    margin: ref.tileset.margin,
  };
}

function writeProperties(bag: DmPropertyBag): any[] {
  return Object.values(bag).map((p) => ({
    name: p.name,
    type: p.type,
    value: p.value,
  }));
}
