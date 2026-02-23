import type { DmProject, DmMap, DmLayer, DmTileset } from '@dimetric/core';
import { FORMAT_MAGIC, SCHEMA_VERSION, type SerializedProject, type SerializedMap, type SerializedLayer, type SerializedTileset } from './schema';

/** Serialize a DmProject to a plain JSON-compatible object. */
export function serializeProject(project: DmProject): SerializedProject {
  return {
    _format: FORMAT_MAGIC,
    _version: SCHEMA_VERSION,
    name: project.name,
    maps: project.maps.map(serializeMap),
    tilesets: project.tilesets.map(serializeTileset),
  };
}

function serializeMap(map: DmMap): SerializedMap {
  return {
    id: map.id,
    name: map.name,
    orientation: map.orientation,
    renderOrder: map.renderOrder,
    mapSize: { ...map.mapSize },
    tileSize: { ...map.tileSize },
    layers: map.layers.map(serializeLayer),
    tilesets: map.tilesets.map((ref) => ({
      firstGid: ref.firstGid,
      tilesetId: ref.tileset.id,
    })),
    properties: map.properties,
  };
}

function serializeLayer(layer: DmLayer): SerializedLayer {
  const base: SerializedLayer = {
    id: layer.id,
    name: layer.name,
    type: layer.type,
    visible: layer.visible,
    locked: layer.locked,
    opacity: layer.opacity,
    offset: { ...layer.offset },
    properties: layer.properties,
  };

  switch (layer.type) {
    case 'tile':
      base.width = layer.width;
      base.height = layer.height;
      base.data = Array.from(layer.data);
      break;
    case 'object':
      base.objects = layer.objects;
      break;
    case 'image':
      base.imageSource = layer.imageSource;
      break;
    case 'group':
      base.layers = layer.layers.map(serializeLayer);
      break;
  }

  return base;
}

function serializeTileset(ts: DmTileset): SerializedTileset {
  return {
    id: ts.id,
    name: ts.name,
    imageSource: ts.imageSource,
    imageSize: { ...ts.imageSize },
    tileSize: { ...ts.tileSize },
    columns: ts.columns,
    tileCount: ts.tileCount,
    spacing: ts.spacing,
    margin: ts.margin,
    tiles: ts.tiles as Record<string, unknown>,
    properties: ts.properties,
  };
}

/** Serialize a project to a JSON string. */
export function serializeProjectToJson(project: DmProject): string {
  return JSON.stringify(serializeProject(project), null, 2);
}
