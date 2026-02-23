# Dimetric

A modular isometric tile map engine for the browser. Build, render, and play isometric games with a suite of TypeScript packages.

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| [`@dimetric/core`](packages/core) | Types, isometric math, factory functions | [![npm](https://img.shields.io/npm/v/@dimetric/core)](https://www.npmjs.com/package/@dimetric/core) |
| [`@dimetric/formats`](packages/formats) | Tiled TMX/TMJ, Aseprite, TexturePacker parsers | [![npm](https://img.shields.io/npm/v/@dimetric/formats)](https://www.npmjs.com/package/@dimetric/formats) |
| [`@dimetric/renderer`](packages/renderer) | PixiJS-based isometric renderer with depth sorting | [![npm](https://img.shields.io/npm/v/@dimetric/renderer)](https://www.npmjs.com/package/@dimetric/renderer) |
| [`@dimetric/runtime`](packages/runtime) | Game loop, entities, systems, A* pathfinding | [![npm](https://img.shields.io/npm/v/@dimetric/runtime)](https://www.npmjs.com/package/@dimetric/runtime) |
| [`@dimetric/editor`](packages/editor) | Vue 3 tile map editor (private) | - |

## Quick Start

### Install

```bash
npm install @dimetric/core @dimetric/renderer pixi.js pixi-viewport
```

### Render a Map

```typescript
import { DmRenderer } from '@dimetric/renderer';
import type { DmMap } from '@dimetric/core';

const renderer = new DmRenderer();
await renderer.init({ container: document.getElementById('game')! });

// Create tile textures from your tileset image
renderer.setTileTextures(textures);
renderer.setMap(myMap);

// Camera control
renderer.camera.panTo(200, 100);
renderer.camera.zoomIn();
```

### Add a Game Runtime

```bash
npm install @dimetric/runtime
```

```typescript
import { GameWorld, Character, MovementSystem, CameraFollowSystem, GridGraph, astar } from '@dimetric/runtime';

const world = new GameWorld();
world.loadMap(map);
world.attachRenderer(renderer);

const player = new Character({ id: 'player', gridX: 3, gridY: 3, speed: 4 });
world.addEntity(player);

const graph = GridGraph.fromMap(map, 'collision-layer-id');
const result = astar(graph, start, goal);
player.setPath(result.path);

world.addSystem(new MovementSystem());
world.addSystem(new CameraFollowSystem({ target: player }));
world.start();
```

### Import Tiled Maps

```bash
npm install @dimetric/formats
```

```typescript
import { parseTmj, parseTmx } from '@dimetric/formats';

// JSON format
const map = parseTmj(tiledJsonData, { resolveTileset });

// XML format
const map = parseTmx(tiledXmlString, { resolveTileset });
```

## Architecture

```
@dimetric/core          zero deps, types + iso math
    |
    +-- @dimetric/formats   parsers for Tiled, Aseprite, TexturePacker
    |
    +-- @dimetric/renderer  PixiJS rendering, camera, depth sort
    |       |
    |       +-- @dimetric/runtime   game loop, entities, pathfinding
    |
    +-- @dimetric/editor    Vue 3 map editor (uses all packages)
```

## Editor Features

- Isometric grid canvas with pan/zoom
- Tile painting: brush, eraser, flood fill, eyedropper
- Layer management: add, rename, lock, visibility, opacity
- Tileset editor: tile properties, collision shapes, animations, terrain/wang sets
- Preview mode: play-test maps directly in the editor
- Export: standalone HTML, JSON bundle, Tiled TMX/TMJ
- Undo/redo with command pattern
- Auto-save to localStorage
- Keyboard shortcuts for all tools

## Development

```bash
# Install dependencies
pnpm install

# Run the editor
pnpm dev

# Run the demo game
pnpm demo

# Run all tests
pnpm test

# Build all packages
pnpm build

# Type check
pnpm lint

# Generate API docs
pnpm docs
```

## Documentation

- [Getting Started](docs/getting-started.md) - Tutorial for using the packages
- [Editor Guide](docs/editor-guide.md) - User guide for the map editor
- [Architecture](docs/architecture.md) - Technical overview
- [API Reference](docs/api/) - Generated from TSDoc

## License

[MIT](LICENSE)
