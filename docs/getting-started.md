# Getting Started

This guide walks through using the Dimetric library packages to create an isometric tile map, render it with PixiJS, and run a game loop with entities and pathfinding.

## Installation

Install the core and renderer packages alongside their PixiJS peer dependencies:

```bash
npm install @dimetric/core @dimetric/renderer pixi.js pixi-viewport
```

For game runtime features (game loop, entities, pathfinding), also install:

```bash
npm install @dimetric/runtime
```

For file format support (Tiled TMJ/TMX, Aseprite, TexturePacker):

```bash
npm install @dimetric/formats
```

## Creating a Map

Use `createMap` from `@dimetric/core` to create a `DmMap`. By default it produces a 20x20 isometric map with 64x32 pixel tiles and one empty tile layer.

```typescript
import { createMap } from '@dimetric/core';

const map = createMap({
  name: 'My Map',
  mapSize: { width: 30, height: 30 },
  tileSize: { width: 64, height: 32 },
});

console.log(map.id);                    // auto-generated unique ID
console.log(map.layers.length);          // 1 (default tile layer)
console.log(map.layers[0].type);         // 'tile'
console.log(map.orientation);            // 'isometric'
```

### Map Structure

A `DmMap` contains:

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `name` | `string` | Display name |
| `orientation` | `DmOrientation` | `'isometric'`, `'orthogonal'`, `'staggered'`, or `'hexagonal'` |
| `renderOrder` | `DmRenderOrder` | `'right-down'`, `'right-up'`, `'left-down'`, or `'left-up'` |
| `mapSize` | `Size` | Width and height in tiles |
| `tileSize` | `Size` | Tile dimensions in pixels |
| `layers` | `DmLayer[]` | Layers in draw order (bottom to top) |
| `tilesets` | `DmTilesetRef[]` | Tilesets referenced by the map, sorted by `firstGid` |

### Adding a Tileset

Create a tileset from a sprite sheet image:

```typescript
import { createTileset } from '@dimetric/core';
import type { DmTilesetRef } from '@dimetric/core';

const tileset = createTileset({
  name: 'terrain',
  imageSource: '/assets/terrain.png',
  imageSize: { width: 512, height: 256 },
  tileSize: { width: 64, height: 32 },
  spacing: 0,
  margin: 0,
});

// Attach to the map with a firstGid (typically 1 for the first tileset)
const ref: DmTilesetRef = { firstGid: 1, tileset };
map.tilesets.push(ref);
```

The `firstGid` determines the starting global tile ID for this tileset. When using multiple tilesets, each subsequent tileset's `firstGid` must be `previousFirstGid + previousTileCount`.

### Writing Tile Data

Tile layers store data in a flat `Uint32Array`. Each element is a global tile ID (GID). A value of `0` means empty.

```typescript
import type { DmTileLayer } from '@dimetric/core';

const layer = map.layers[0] as DmTileLayer;

// Set tile at (col=5, row=3) to GID 1 (first tile of first tileset)
const index = 3 * layer.width + 5;
layer.data[index] = 1;

// Fill the entire layer with GID 2
layer.data.fill(2);
```

The top 3 bits of each GID encode flip flags (matching the Tiled convention). Use `composeGid` and `extractGid` to work with them:

```typescript
import { composeGid, extractGid, extractFlipFlags } from '@dimetric/core';

// Store tile 5 flipped horizontally
const raw = composeGid(5, { horizontal: true });
layer.data[0] = raw;

// Read it back
const gid = extractGid(layer.data[0]);       // 5
const flags = extractFlipFlags(layer.data[0]); // { horizontal: true, vertical: false, diagonal: false }
```

### Creating Additional Layers

```typescript
import { createTileLayer, createObjectLayer, createGroupLayer } from '@dimetric/core';

// Another tile layer
const groundLayer = createTileLayer({ name: 'Ground', width: 30, height: 30 });
map.layers.push(groundLayer);

// An object layer for spawn points, triggers, etc.
const objectLayer = createObjectLayer({ name: 'Objects' });
map.layers.push(objectLayer);

// A group layer to organize children
const group = createGroupLayer({ name: 'Decorations' });
group.layers.push(createTileLayer({ name: 'Trees', width: 30, height: 30 }));
map.layers.push(group);
```

## Setting Up the Renderer

The `DmRenderer` manages a PixiJS `Application`, a `pixi-viewport` instance for pan/zoom, and layer renderers for each layer type.

```typescript
import { DmRenderer } from '@dimetric/renderer';

const container = document.getElementById('game')!;
const renderer = new DmRenderer();

await renderer.init({
  container,
  backgroundColor: 0x1a1a2e,
});
```

### Loading Textures

Before tiles appear on screen, you must slice the tileset image into individual tile textures and provide them to the renderer.

```typescript
import { Texture } from 'pixi.js';
import { sliceTilesetTextures } from '@dimetric/renderer';

// Load the tileset image
const baseTexture = Texture.from('/assets/terrain.png');

// Slice it into per-tile textures keyed by GID
const tileTextures = sliceTilesetTextures(baseTexture, tileset, 1 /* firstGid */);

// Hand the texture map to the renderer
renderer.setTileTextures(tileTextures);
```

For multiple tilesets, merge all texture maps into one:

```typescript
const allTextures = new Map<number, Texture>();

for (const ref of map.tilesets) {
  const base = Texture.from(ref.tileset.imageSource);
  const textures = sliceTilesetTextures(base, ref.tileset, ref.firstGid);
  for (const [gid, tex] of textures) {
    allTextures.set(gid, tex);
  }
}

renderer.setTileTextures(allTextures);
```

### Rendering a Map

```typescript
renderer.setMap(map);
```

This draws the grid overlay, builds layer renderers for every layer in the map, and centers the camera on the map. Call `setMap` again whenever the map structure changes (layers added/removed). For tile data changes within a layer, use `rebuildLayers` or update individual tile layer renderers.

### Camera Control

```typescript
// Pan to world coordinates
renderer.camera.panTo(500, 300);

// Zoom
renderer.camera.setZoom(1.5);
renderer.camera.zoomIn();   // 1.25x multiplier
renderer.camera.zoomOut();  // 1/1.25x multiplier

// Read current state
const state = renderer.camera.getState(); // { x, y, zoom }
```

### Grid Overlay

```typescript
renderer.setGridVisible(true);  // show isometric grid lines
renderer.setGridVisible(false); // hide them
```

### Cleanup

```typescript
renderer.destroy(); // Removes the canvas, stops the ticker, frees all GPU resources
```

## Coordinate Math

`@dimetric/core` provides functions for converting between grid coordinates and screen (pixel) coordinates.

```typescript
import { gridToScreen, screenToGrid, snapToGrid } from '@dimetric/core';

const tileWidth = 64;
const tileHeight = 32;

// Grid -> Screen: returns the tile's top-center diamond point
const { sx, sy } = gridToScreen(5, 3, tileWidth, tileHeight);
// sx = (5 - 3) * 32 = 64
// sy = (5 + 3) * 16 = 128

// Screen -> Grid: returns fractional grid coordinates
const { col, row } = screenToGrid(64, 128, tileWidth, tileHeight);

// Snap to nearest integer grid cell
const snapped = snapToGrid(70, 130, tileWidth, tileHeight);
```

## Adding a Game Loop

The `@dimetric/runtime` package provides a fixed-timestep game loop, an entity system, and A* pathfinding.

### GameWorld

`GameWorld` orchestrates the loop, entities, and systems:

```typescript
import { GameWorld } from '@dimetric/runtime';

const world = new GameWorld({ fixedDt: 1 / 60 });
world.loadMap(map);
world.attachRenderer(renderer);
world.start();

// Later:
world.stop();
```

### GameLoop (standalone)

If you need the loop without the full world orchestration:

```typescript
import { GameLoop } from '@dimetric/runtime';

const loop = new GameLoop({ fixedDt: 1 / 60 });

loop.setFixedUpdate((dt) => {
  // dt is always fixedDt (in seconds)
  // Run physics, AI, input processing here
});

loop.setRender((alpha) => {
  // alpha is interpolation factor 0..1
  // Use for smooth rendering between fixed steps
});

loop.start();
```

The loop includes spiral-of-death protection: if a frame takes longer than `maxFrameTime` (default 0.25s), the excess time is discarded.

## Entities and Characters

### Entity

`Entity` is the base class with grid and pixel positions plus an arbitrary component map:

```typescript
import { Entity } from '@dimetric/runtime';

const npc = new Entity({ gridX: 5, gridY: 10 });
npc.setComponent('health', 100);
npc.setComponent('dialogue', ['Hello, traveler.']);

const hp = npc.getComponent<number>('health'); // 100
```

### Character

`Character` extends `Entity` with movement speed, facing direction, path following, and animation state:

```typescript
import { Character } from '@dimetric/runtime';

const player = new Character({
  gridX: 2,
  gridY: 2,
  speed: 4,         // tiles per second
  direction: 's',   // facing south
});

console.log(player.animationState); // 'idle'
console.log(player.isMoving);       // false
```

## Systems

Systems process entities each fixed-update tick. They implement the `System` interface:

```typescript
interface System {
  readonly name: string;
  update(dt: number, world: GameWorld): void;
}
```

### Built-in Systems

**MovementSystem** -- advances `Character` entities along their paths, interpolating pixel positions and updating facing direction:

```typescript
import { MovementSystem } from '@dimetric/runtime';

world.addSystem(new MovementSystem());
```

**AnimationSystem** -- updates sprite frames based on the character's `animationState` and `direction`.

**CameraFollowSystem** -- smoothly lerps the camera toward a target entity:

```typescript
import { CameraFollowSystem } from '@dimetric/runtime';

const cameraFollow = new CameraFollowSystem({
  target: player,
  lerpSpeed: 5,  // higher = snappier
});
world.addSystem(cameraFollow);
```

### Custom Systems

```typescript
import type { System } from '@dimetric/runtime';
import type { GameWorld } from '@dimetric/runtime';

class HealthRegenSystem implements System {
  readonly name = 'health-regen';

  update(dt: number, world: GameWorld): void {
    for (const entity of world.entities) {
      const hp = entity.getComponent<number>('health');
      if (hp !== undefined && hp < 100) {
        entity.setComponent('health', Math.min(100, hp + 5 * dt));
      }
    }
  }
}

world.addSystem(new HealthRegenSystem());
```

## Pathfinding

### GridGraph

`GridGraph` represents a walkability grid. Create one from a map's tile layer (tiles with GID 0 are walkable, non-zero tiles are obstacles):

```typescript
import { GridGraph, astar } from '@dimetric/runtime';

// Build from a collision layer where painted tiles are walls
const graph = GridGraph.fromMap(map, collisionLayer.id, {
  allowDiagonals: true,
});

// Or build manually
const graph2 = new GridGraph(30, 30, true);
graph2.setWalkable(10, 5, false); // block a cell
```

### A* Search

```typescript
const result = astar(graph, { col: 2, row: 2 }, { col: 15, row: 12 });

if (result.found) {
  console.log('Path length:', result.path.length);
  console.log('Total cost:', result.cost);

  // Assign the path to a character
  player.setPath(result.path);
} else {
  console.log('No path found');
}
```

The A* implementation uses Chebyshev distance as its heuristic, with diagonal moves costing `sqrt(2)` and cardinal moves costing `1`.

### Wiring It Together

A complete example with click-to-move:

```typescript
import { createMap, createTileset, gridToScreen, snapToGrid } from '@dimetric/core';
import { DmRenderer, sliceTilesetTextures } from '@dimetric/renderer';
import {
  GameWorld, Character, MovementSystem,
  CameraFollowSystem, GridGraph, astar, InputManager,
} from '@dimetric/runtime';
import { Texture } from 'pixi.js';

// 1. Create map and tileset
const map = createMap({ name: 'Demo', mapSize: { width: 20, height: 20 } });
const tileset = createTileset({
  name: 'terrain',
  imageSource: '/terrain.png',
  imageSize: { width: 512, height: 256 },
  tileSize: { width: 64, height: 32 },
});
map.tilesets.push({ firstGid: 1, tileset });

// 2. Set up renderer
const renderer = new DmRenderer();
await renderer.init({ container: document.getElementById('game')! });

const base = Texture.from('/terrain.png');
renderer.setTileTextures(sliceTilesetTextures(base, tileset, 1));
renderer.setMap(map);

// 3. Build walkability graph
const graph = GridGraph.fromMap(map, map.layers[0].id);

// 4. Create player and world
const player = new Character({ gridX: 5, gridY: 5, speed: 4 });
const { sx, sy } = gridToScreen(5, 5, 64, 32);
player.pixelX = sx;
player.pixelY = sy;

const world = new GameWorld();
world.loadMap(map);
world.attachRenderer(renderer);
world.addEntity(player);
world.addSystem(new MovementSystem());
world.addSystem(new CameraFollowSystem({ target: player }));

// 5. Handle click-to-move
document.getElementById('game')!.addEventListener('click', (e) => {
  const worldPos = renderer.camera.screenToWorld(e.clientX, e.clientY);
  const target = snapToGrid(worldPos.wx, worldPos.wy, 64, 32);
  const result = astar(graph, { col: player.gridX, row: player.gridY }, target);
  if (result.found) {
    player.setPath(result.path);
  }
});

// 6. Start
world.start();
```

## Input Manager

`InputManager` tracks keyboard state per frame:

```typescript
import { InputManager } from '@dimetric/runtime';

const input = new InputManager();
input.attach(); // starts listening to keydown/keyup

// In your update loop:
if (input.isDown('ArrowUp')) { /* held */ }
if (input.justPressed('Space')) { /* pressed this frame */ }
if (input.justReleased('Escape')) { /* released this frame */ }

input.flush(); // call at end of each fixed update to clear just-pressed/released

// Cleanup:
input.detach();
```

## File Formats

The `@dimetric/formats` package handles serialization and format conversion.

### Native Format

Save and load Dimetric projects as JSON:

```typescript
import { serializeProjectToJson, deserializeProjectFromJson } from '@dimetric/formats';
import type { DmProject } from '@dimetric/core';

const project: DmProject = {
  version: 1,
  name: 'My Project',
  maps: [map],
  tilesets: [tileset],
};

// Serialize
const json = serializeProjectToJson(project);

// Deserialize
const restored = deserializeProjectFromJson(json);
```

### Tiled Format

Import from Tiled JSON (.tmj) or XML (.tmx):

```typescript
import { parseTmj, parseTmx, writeTmjString, writeTmx } from '@dimetric/formats';

// Parse a Tiled JSON map
const dmMap = parseTmj(tiledJsonObject);

// Parse a Tiled XML map
const dmMap2 = parseTmx(xmlString);

// Export back to Tiled JSON
const tmjString = writeTmjString(map);

// Export to Tiled XML
const tmxString = writeTmx(map);
```
