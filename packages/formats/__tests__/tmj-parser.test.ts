import { describe, it, expect } from 'vitest';
import { parseTmj } from '../src/tmx/tmj-parser';

describe('parseTmj', () => {
  const minimalMap = {
    type: 'map',
    version: '1.10',
    orientation: 'isometric',
    renderorder: 'right-down',
    width: 4,
    height: 4,
    tilewidth: 64,
    tileheight: 32,
    layers: [
      {
        type: 'tilelayer',
        name: 'Ground',
        width: 4,
        height: 4,
        data: [1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        visible: true,
        opacity: 1,
      },
    ],
    tilesets: [
      {
        firstgid: 1,
        name: 'terrain',
        image: 'terrain.png',
        imagewidth: 256,
        imageheight: 128,
        tilewidth: 32,
        tileheight: 32,
        columns: 8,
        tilecount: 32,
        spacing: 0,
        margin: 0,
      },
    ],
  };

  it('parses map dimensions', async () => {
    const map = await parseTmj(minimalMap);
    expect(map.mapSize).toEqual({ width: 4, height: 4 });
    expect(map.tileSize).toEqual({ width: 64, height: 32 });
    expect(map.orientation).toBe('isometric');
    expect(map.renderOrder).toBe('right-down');
  });

  it('parses tile layer data', async () => {
    const map = await parseTmj(minimalMap);
    expect(map.layers.length).toBe(1);
    const layer = map.layers[0];
    expect(layer.type).toBe('tile');
    if (layer.type === 'tile') {
      expect(layer.data[0]).toBe(1);
      expect(layer.data[1]).toBe(2);
      expect(layer.data[2]).toBe(3);
      expect(layer.data[3]).toBe(0);
    }
  });

  it('parses tileset refs', async () => {
    const map = await parseTmj(minimalMap);
    expect(map.tilesets.length).toBe(1);
    expect(map.tilesets[0].firstGid).toBe(1);
    expect(map.tilesets[0].tileset.name).toBe('terrain');
  });

  it('parses object layers', async () => {
    const mapWithObjects = {
      ...minimalMap,
      layers: [
        {
          type: 'objectgroup',
          name: 'Objects',
          objects: [
            { id: 1, name: 'spawn', type: 'point', x: 100, y: 200, width: 0, height: 0, rotation: 0, visible: true },
          ],
          visible: true,
          opacity: 1,
        },
      ],
    };
    const map = await parseTmj(mapWithObjects);
    expect(map.layers[0].type).toBe('object');
    if (map.layers[0].type === 'object') {
      expect(map.layers[0].objects.length).toBe(1);
      expect(map.layers[0].objects[0].name).toBe('spawn');
    }
  });

  it('parses properties', async () => {
    const mapWithProps = {
      ...minimalMap,
      properties: [
        { name: 'difficulty', type: 'int', value: 5 },
        { name: 'title', type: 'string', value: 'Test Level' },
      ],
    };
    const map = await parseTmj(mapWithProps);
    expect(map.properties).toBeDefined();
    expect(map.properties!['difficulty'].value).toBe(5);
    expect(map.properties!['title'].value).toBe('Test Level');
  });

  it('parses group layers', async () => {
    const mapWithGroup = {
      ...minimalMap,
      layers: [
        {
          type: 'group',
          name: 'Group',
          layers: [
            { type: 'tilelayer', name: 'Sub', width: 4, height: 4, data: new Array(16).fill(0), visible: true, opacity: 1 },
          ],
          visible: true,
          opacity: 1,
        },
      ],
    };
    const map = await parseTmj(mapWithGroup);
    expect(map.layers[0].type).toBe('group');
    if (map.layers[0].type === 'group') {
      expect(map.layers[0].layers.length).toBe(1);
    }
  });
});
