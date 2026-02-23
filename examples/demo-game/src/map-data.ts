import type { DmMap } from '@dimetric/core';

/**
 * Hand-crafted 15×15 isometric map with ground and walls layers.
 * GID 1 = grass ground, GID 2 = wall tile
 * Walls form a border and some interior obstacles.
 */

const W = 15;
const H = 15;

// Ground layer: GID 1 everywhere
const groundData = new Uint32Array(W * H);
groundData.fill(1);

// Walls layer: GID 2 for border and interior walls, GID 0 for walkable
const wallsData = new Uint32Array(W * H);
for (let row = 0; row < H; row++) {
  for (let col = 0; col < W; col++) {
    const isBorder = row === 0 || row === H - 1 || col === 0 || col === W - 1;
    // Interior L-shaped wall
    const isInteriorWall =
      (row === 5 && col >= 3 && col <= 8) ||
      (col === 8 && row >= 5 && row <= 9) ||
      (row === 10 && col >= 10 && col <= 12);
    wallsData[row * W + col] = isBorder || isInteriorWall ? 2 : 0;
  }
}

export const demoMap: DmMap = {
  id: 'demo-map',
  name: 'Demo Map',
  orientation: 'isometric',
  renderOrder: 'right-down',
  mapSize: { width: W, height: H },
  tileSize: { width: 64, height: 32 },
  layers: [
    {
      id: 'ground',
      name: 'Ground',
      type: 'tile',
      visible: true,
      locked: false,
      opacity: 1,
      offset: { x: 0, y: 0 },
      width: W,
      height: H,
      data: groundData,
    },
    {
      id: 'walls',
      name: 'Walls',
      type: 'tile',
      visible: true,
      locked: false,
      opacity: 1,
      offset: { x: 0, y: 0 },
      width: W,
      height: H,
      data: wallsData,
    },
  ],
  tilesets: [
    {
      firstGid: 1,
      tileset: {
        id: 'demo-tileset',
        name: 'Demo Tileset',
        imageSource: '',
        imageSize: { width: 128, height: 32 },
        tileSize: { width: 64, height: 32 },
        columns: 2,
        tileCount: 2,
        spacing: 0,
        margin: 0,
        tiles: {},
      },
    },
  ],
};
