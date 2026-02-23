# @dimetric/core

Core types, isometric math, and factory functions for the Dimetric tile map engine. Zero runtime dependencies.

## Installation

```bash
npm install @dimetric/core
```

## Overview

`@dimetric/core` provides the foundational data model for isometric tile maps. It includes TypeScript types for maps, layers, tilesets, and geometry; pure-function isometric coordinate math; factory functions for creating maps and tilesets; and bit-flag utilities compatible with the Tiled editor's GID format.

## Key Types

### Geometry

```typescript
interface GridCoord { col: number; row: number }
interface ScreenCoord { sx: number; sy: number }
interface WorldCoord { wx: number; wy: number }
interface Point { x: number; y: number }
interface Size { width: number; height: number }
interface Rect { x: number; y: number; width: number; height: number }
```

### Map and Layers

```typescript
interface DmMap {
  id: string;
  name: string;
  orientation: DmOrientation;       // 'isometric' | 'orthogonal' | 'staggered' | 'hexagonal'
  renderOrder: DmRenderOrder;       // 'right-down' | 'right-up' | 'left-down' | 'left-up'
  mapSize: Size;                    // dimensions in tiles
  tileSize: Size;                   // tile dimensions in pixels
  layers: DmLayer[];                // bottom-to-top draw order
  tilesets: DmTilesetRef[];         // sorted by firstGid
  properties?: DmPropertyBag;
}

// DmLayer is a discriminated union:
type DmLayer = DmTileLayer | DmObjectLayer | DmImageLayer | DmGroupLayer;
```

`DmTileLayer` stores tile data as a `Uint32Array`, where each 32-bit value encodes a GID with optional flip flags in the top 3 bits (matching the Tiled convention).

### Tileset

```typescript
interface DmTileset {
  id: string;
  name: string;
  imageSource: string;     // path or data URI
  imageSize: Size;
  tileSize: Size;
  columns: number;
  tileCount: number;
  spacing: number;
  margin: number;
  tiles: Record<number, DmTileData>;   // per-tile collision, animation, properties
}
```

## Isometric Math

Convert between grid coordinates and screen pixel coordinates using a standard isometric projection where `tileWidth = 2 * tileHeight`.

```typescript
import { gridToScreen, screenToGrid, snapToGrid } from '@dimetric/core';

// Grid cell (5, 3) to screen pixels with 64x32 tiles
const { sx, sy } = gridToScreen(5, 3, 64, 32);
// sx = 64, sy = 128

// Screen pixels back to fractional grid coordinates
const { col, row } = screenToGrid(sx, sy, 64, 32);
// col = 5, row = 3

// Snap an arbitrary screen position to the nearest tile
const cell = snapToGrid(70, 130, 64, 32);
// cell = { col: 5, row: 3 }
```

## Factory Functions

Create maps, layers, and tilesets with sensible defaults.

```typescript
import { createMap, createTileset, createTileLayer, createObjectLayer } from '@dimetric/core';

// Create a 30x30 isometric map with 64x32 tiles
const map = createMap({
  name: 'My Map',
  mapSize: { width: 30, height: 30 },
  tileSize: { width: 64, height: 32 },
});
// map.layers[0] is a pre-created empty tile layer

// Create a tileset from an image
const tileset = createTileset({
  name: 'terrain',
  imageSource: 'terrain.png',
  imageSize: { width: 512, height: 256 },
  tileSize: { width: 64, height: 32 },
});

// Create additional layers
const ground = createTileLayer({ name: 'Ground', width: 30, height: 30 });
const objects = createObjectLayer({ name: 'Entities' });
```

## Bit Flag Utilities

Extract and compose GIDs with Tiled-compatible flip flags.

```typescript
import { extractGid, extractFlipFlags, composeGid, FLIP_FLAGS } from '@dimetric/core';

const rawGid = 0x80000005; // tile 5, flipped horizontally
const gid = extractGid(rawGid);          // 5
const flags = extractFlipFlags(rawGid);   // { horizontal: true, vertical: false, diagonal: false }

const composed = composeGid(5, { horizontal: true });  // 0x80000005
```

## Rectangle Utilities

```typescript
import { intersects, contains, containsPoint, expandToContain } from '@dimetric/core';

intersects(rectA, rectB);             // true if overlapping
contains(outer, inner);               // true if outer fully contains inner
containsPoint(rect, px, py);          // true if point is inside rect
expandToContain(rectA, rectB);        // smallest rect containing both
```

## Constants

```typescript
import {
  DEFAULT_TILE_WIDTH,   // 64
  DEFAULT_TILE_HEIGHT,  // 32
  DEFAULT_MAP_COLS,     // 20
  DEFAULT_MAP_ROWS,     // 20
  PROJECT_VERSION,      // 1
} from '@dimetric/core';
```

## License

MIT
