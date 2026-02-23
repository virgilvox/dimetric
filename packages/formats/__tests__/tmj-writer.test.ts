import { describe, it, expect } from 'vitest';
import { parseTmj } from '../src/tmx/tmj-parser';
import { writeTmj } from '../src/tmx/tmj-writer';

describe('TMJ round-trip', () => {
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

  it('preserves map dimensions through round-trip', async () => {
    const map = await parseTmj(minimalMap);
    const output = writeTmj(map);
    expect(output.width).toBe(4);
    expect(output.height).toBe(4);
    expect(output.tilewidth).toBe(64);
    expect(output.tileheight).toBe(32);
    expect(output.orientation).toBe('isometric');
  });

  it('preserves tile data through round-trip', async () => {
    const map = await parseTmj(minimalMap);
    const output = writeTmj(map);
    expect(output.layers[0].data).toEqual([1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('preserves tileset info through round-trip', async () => {
    const map = await parseTmj(minimalMap);
    const output = writeTmj(map);
    expect(output.tilesets[0].firstgid).toBe(1);
    expect(output.tilesets[0].name).toBe('terrain');
    expect(output.tilesets[0].tilecount).toBe(32);
  });
});
