import { XMLParser } from 'fast-xml-parser';
import { parseTsxTilesetNode } from './tmx-parser';
import type { DmTileset } from '@dimetric/core';

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => ['tile', 'frame', 'object', 'property', 'wangset', 'wangcolor', 'wangtile'].includes(name),
  parseAttributeValue: true,
});

/**
 * Parse a Tiled XML tileset (.tsx) into a DmTileset.
 *
 * @param xml - The raw XML string from a .tsx file.
 * @returns A DmTileset with all tile metadata populated.
 * @throws If the XML does not contain a valid tileset root element.
 */
export function parseTsxTileset(xml: string): DmTileset {
  const doc = xmlParser.parse(xml);
  const tsNode = doc.tileset;
  if (!tsNode) throw new Error('Invalid TSX: no <tileset> root element');
  return parseTsxTilesetNode(tsNode);
}
