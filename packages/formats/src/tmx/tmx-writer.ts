import type {
  DmMap, DmLayer, DmObject, DmTilesetRef,
} from '@dimetric/core';
import type { DmPropertyBag } from '@dimetric/core';

/**
 * Convert a DmMap to a Tiled XML string (.tmx).
 *
 * Produces a complete TMX document with CSV-encoded tile data and
 * embedded tilesets.
 *
 * @param map - The map to convert.
 * @returns A well-formed XML string.
 */
export function writeTmx(map: DmMap): string {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push(`<map version="1.10" tiledversion="1.10.0" orientation="${map.orientation}" renderorder="${map.renderOrder}" width="${map.mapSize.width}" height="${map.mapSize.height}" tilewidth="${map.tileSize.width}" tileheight="${map.tileSize.height}" infinite="0">`);

  writePropertiesXml(lines, map.properties, 1);

  for (const ref of map.tilesets) {
    writeTilesetXml(lines, ref, 1);
  }

  for (const layer of map.layers) {
    writeLayerXml(lines, layer, 1);
  }

  lines.push('</map>');
  return lines.join('\n');
}

function indent(level: number): string {
  return '  '.repeat(level);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function writeLayerXml(lines: string[], layer: DmLayer, level: number): void {
  const vis = layer.visible ? '' : ' visible="0"';
  const opac = layer.opacity < 1 ? ` opacity="${layer.opacity}"` : '';
  const off = (layer.offset.x || layer.offset.y) ? ` offsetx="${layer.offset.x}" offsety="${layer.offset.y}"` : '';

  switch (layer.type) {
    case 'tile': {
      lines.push(`${indent(level)}<layer name="${escapeXml(layer.name)}" width="${layer.width}" height="${layer.height}"${vis}${opac}${off}>`);
      writePropertiesXml(lines, layer.properties, level + 1);
      const csv = Array.from(layer.data).join(',');
      lines.push(`${indent(level + 1)}<data encoding="csv">`);
      lines.push(`${indent(level + 2)}${csv}`);
      lines.push(`${indent(level + 1)}</data>`);
      lines.push(`${indent(level)}</layer>`);
      break;
    }
    case 'object': {
      lines.push(`${indent(level)}<objectgroup name="${escapeXml(layer.name)}"${vis}${opac}${off}>`);
      writePropertiesXml(lines, layer.properties, level + 1);
      for (const obj of layer.objects) {
        writeObjectXml(lines, obj, level + 1);
      }
      lines.push(`${indent(level)}</objectgroup>`);
      break;
    }
    case 'image': {
      lines.push(`${indent(level)}<imagelayer name="${escapeXml(layer.name)}"${vis}${opac}${off}>`);
      writePropertiesXml(lines, layer.properties, level + 1);
      lines.push(`${indent(level + 1)}<image source="${escapeXml(layer.imageSource)}"/>`);
      lines.push(`${indent(level)}</imagelayer>`);
      break;
    }
    case 'group': {
      lines.push(`${indent(level)}<group name="${escapeXml(layer.name)}"${vis}${opac}${off}>`);
      writePropertiesXml(lines, layer.properties, level + 1);
      for (const child of layer.layers) {
        writeLayerXml(lines, child, level + 1);
      }
      lines.push(`${indent(level)}</group>`);
      break;
    }
  }
}

function writeObjectXml(lines: string[], obj: DmObject, level: number): void {
  const attrs = [
    `id="0"`,
    `name="${escapeXml(obj.name)}"`,
    `type="${escapeXml(obj.type)}"`,
    `x="${obj.x}"`,
    `y="${obj.y}"`,
  ];
  if (obj.width) attrs.push(`width="${obj.width}"`);
  if (obj.height) attrs.push(`height="${obj.height}"`);
  if (obj.rotation) attrs.push(`rotation="${obj.rotation}"`);
  if (obj.gid !== undefined) attrs.push(`gid="${obj.gid}"`);
  if (!obj.visible) attrs.push(`visible="0"`);

  const hasProps = obj.properties && Object.keys(obj.properties).length > 0;
  if (hasProps) {
    lines.push(`${indent(level)}<object ${attrs.join(' ')}>`);
    writePropertiesXml(lines, obj.properties, level + 1);
    lines.push(`${indent(level)}</object>`);
  } else {
    lines.push(`${indent(level)}<object ${attrs.join(' ')}/>`);
  }
}

function writeTilesetXml(lines: string[], ref: DmTilesetRef, level: number): void {
  const ts = ref.tileset;
  lines.push(`${indent(level)}<tileset firstgid="${ref.firstGid}" name="${escapeXml(ts.name)}" tilewidth="${ts.tileSize.width}" tileheight="${ts.tileSize.height}" tilecount="${ts.tileCount}" columns="${ts.columns}"${ts.spacing ? ` spacing="${ts.spacing}"` : ''}${ts.margin ? ` margin="${ts.margin}"` : ''}>`);
  lines.push(`${indent(level + 1)}<image source="${escapeXml(ts.imageSource)}" width="${ts.imageSize.width}" height="${ts.imageSize.height}"/>`);
  lines.push(`${indent(level)}</tileset>`);
}

function writePropertiesXml(lines: string[], props: DmPropertyBag | undefined, level: number): void {
  if (!props || Object.keys(props).length === 0) return;
  lines.push(`${indent(level)}<properties>`);
  for (const p of Object.values(props)) {
    lines.push(`${indent(level + 1)}<property name="${escapeXml(p.name)}" type="${p.type}" value="${escapeXml(String(p.value))}"/>`);
  }
  lines.push(`${indent(level)}</properties>`);
}
