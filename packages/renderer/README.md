# @dimetric/renderer

PixiJS-based isometric tile map renderer for the Dimetric engine. Handles tile, object, image, and group layers with pan/zoom viewport, grid overlay, depth sorting, and tile animation.

## Installation

```bash
npm install @dimetric/renderer @dimetric/core pixi.js pixi-viewport
```

Peer dependencies: `@dimetric/core`, `pixi.js` (v8+), and `pixi-viewport` (v6+).

## Quick Start

```typescript
import { DmRenderer, sliceTilesetTextures } from '@dimetric/renderer';
import { createMap, createTileset } from '@dimetric/core';
import { Assets } from 'pixi.js';

// Create the renderer
const renderer = new DmRenderer();
await renderer.init({
  container: document.getElementById('game')!,
  backgroundColor: 0x1a1a2e,
});

// Load a map
const map = createMap({
  name: 'Demo',
  mapSize: { width: 20, height: 20 },
  tileSize: { width: 64, height: 32 },
});

renderer.setMap(map);

// Load tileset textures
const baseTexture = await Assets.load('terrain.png');
const textures = sliceTilesetTextures(baseTexture, tileset, 1);
renderer.setTileTextures(textures);

// Camera control
renderer.camera.panTo(640, 320);
renderer.camera.setZoom(1.5);
renderer.camera.zoomIn();   // 1.25x multiplier
renderer.camera.zoomOut();

// Toggle grid overlay
renderer.setGridVisible(false);

// Layer visibility and opacity
renderer.setLayerVisible(layerId, false);
renderer.setLayerOpacity(layerId, 0.5);

// Clean up
renderer.destroy();
```

## DmRenderer

The main renderer class. Owns a PixiJS `Application`, a `pixi-viewport` for pan/zoom, and manages all layer renderers.

```typescript
class DmRenderer {
  readonly camera: DmCamera;
  readonly gridOverlay: GridOverlayRenderer;
  readonly highlight: HighlightRenderer;
  readonly cursor: CursorRenderer;
  readonly animationTicker: AnimationTicker;

  init(options: DmRendererOptions): Promise<void>;
  setMap(map: DmMap): void;
  setTileTextures(textures: Map<number, Texture>): void;
  rebuildLayers(map: DmMap): void;
  getTileLayerRenderer(layerId: string): TileLayerRenderer | undefined;
  setLayerVisible(layerId: string, visible: boolean): void;
  setLayerOpacity(layerId: string, opacity: number): void;
  setGridVisible(visible: boolean): void;
  getApp(): Application;
  getViewport(): DmViewport;
  destroy(): void;
}
```

### init

Mount the PixiJS canvas to a DOM element. Sets up the viewport with drag, pinch, and wheel zoom (0.1x to 10x), a resize observer, and the animation ticker.

### setMap

Load a `DmMap`. Draws the isometric grid overlay, builds all layer renderers (recursively for group layers), and centers the camera on the map.

### setTileTextures

Provide a `Map<number, Texture>` mapping global tile IDs (GIDs) to PixiJS textures. Triggers a full layer rebuild so tiles render with their assigned sprites.

## DmCamera

High-level camera with pan, zoom, and coordinate conversion.

```typescript
const state = renderer.camera.getState();   // { x, y, zoom }
renderer.camera.panTo(worldX, worldY);
renderer.camera.setZoom(2.0);
renderer.camera.zoomIn(1.25);
renderer.camera.zoomOut(1.25);

const { wx, wy } = renderer.camera.screenToWorld(clientX, clientY);
```

## Texture Loading

Slice a tileset image into individual tile textures by GID.

```typescript
import { sliceTilesetTextures, buildTileTextureMap } from '@dimetric/renderer';
import { Assets, Texture } from 'pixi.js';

// Single tileset
const base = await Assets.load('terrain.png');
const textures = sliceTilesetTextures(base, tileset, firstGid);

// Multiple tilesets at once
const tilesetTextures = new Map();
for (const ref of map.tilesets) {
  const base = await Assets.load(ref.tileset.imageSource);
  tilesetTextures.set(ref.tileset.id, { baseTexture: base, ref });
}
const allTextures = buildTileTextureMap(tilesetTextures);
renderer.setTileTextures(allTextures);
```

## Layer Renderers

Each layer type has a dedicated renderer:

- **TileLayerRenderer** -- renders `DmTileLayer` as positioned sprites with Tiled-compatible flip flag support (horizontal, vertical, diagonal).
- **ObjectLayerRenderer** -- renders `DmObjectLayer` objects as sprites (for GID-based objects) or wireframe bounding boxes (in editor mode).
- **ImageLayerRenderer** -- renders `DmImageLayer` as a single positioned sprite.
- **Group layers** -- handled recursively by `DmRenderer.buildLayerTree()`, creating nested PixiJS containers with correct visibility and opacity.

## Depth Sorting

Sort sprites in isometric draw order.

```typescript
import { depthSortKey, depthSortContainer } from '@dimetric/renderer';

// Compute sort key for an isometric position
const key = depthSortKey(col, row, z);

// Assign keys and sort a container's children
for (const child of container.children) {
  (child as any)._depthKey = depthSortKey(col, row);
}
depthSortContainer(container);
```

## Animation Ticker

Animate tiles that have multi-frame animation data.

```typescript
import { AnimationTicker } from '@dimetric/renderer';

const ticker = new AnimationTicker();
ticker.add(sprite, [
  { texture: frame0, duration: 200 },
  { texture: frame1, duration: 200 },
  { texture: frame2, duration: 200 },
]);

// Called automatically when using DmRenderer; or manually:
ticker.tick(deltaMs);
ticker.count;   // number of active animations
ticker.clear();
```

## License

MIT
