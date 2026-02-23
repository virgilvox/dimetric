import { describe, it, expect } from 'vitest';
import { parseTmx } from '../src/tmx/tmx-parser';

describe('parseTmx', () => {
  const minimalTmx = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.10" orientation="isometric" renderorder="right-down" width="4" height="4" tilewidth="64" tileheight="32">
  <tileset firstgid="1" name="terrain" tilewidth="32" tileheight="32" tilecount="32" columns="8">
    <image source="terrain.png" width="256" height="128"/>
  </tileset>
  <layer name="Ground" width="4" height="4">
    <data encoding="csv">
1,2,3,0,
0,0,0,0,
0,0,0,0,
0,0,0,0
    </data>
  </layer>
</map>`;

  it('parses map dimensions', async () => {
    const map = await parseTmx(minimalTmx);
    expect(map.mapSize).toEqual({ width: 4, height: 4 });
    expect(map.tileSize).toEqual({ width: 64, height: 32 });
    expect(map.orientation).toBe('isometric');
  });

  it('parses tile layer with CSV data', async () => {
    const map = await parseTmx(minimalTmx);
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

  it('parses embedded tilesets', async () => {
    const map = await parseTmx(minimalTmx);
    expect(map.tilesets.length).toBe(1);
    expect(map.tilesets[0].firstGid).toBe(1);
    expect(map.tilesets[0].tileset.name).toBe('terrain');
  });

  it('parses object groups', async () => {
    const tmx = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.10" orientation="orthogonal" renderorder="right-down" width="4" height="4" tilewidth="32" tileheight="32">
  <objectgroup name="Entities">
    <object id="1" name="player" type="spawn" x="64" y="96" width="16" height="16"/>
  </objectgroup>
</map>`;
    const map = await parseTmx(tmx);
    expect(map.layers[0].type).toBe('object');
    if (map.layers[0].type === 'object') {
      expect(map.layers[0].objects[0].name).toBe('player');
      expect(map.layers[0].objects[0].x).toBe(64);
    }
  });
});
