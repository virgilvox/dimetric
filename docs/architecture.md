# Architecture

Technical overview of the Dimetric project structure, data model, rendering pipeline, and runtime design.

## Package Dependency Graph

Dimetric is a pnpm monorepo with five packages:

```
@dimetric/core          (zero dependencies)
    |
    +-- @dimetric/formats    (depends on core)
    |
    +-- @dimetric/renderer   (depends on core, pixi.js, pixi-viewport)
            |
            +-- @dimetric/runtime  (depends on core, renderer)
            |
            +-- @dimetric/editor   (depends on core, formats, renderer; Vue 3 + Pinia)
```

- **core** -- Types, isometric math, factory functions, constants. Zero runtime dependencies.
- **formats** -- Serialization for native JSON, Tiled TMJ/TSJ/TMX/TSX, Aseprite JSON, TexturePacker JSON.
- **renderer** -- PixiJS v8 rendering: tile/object/image/group layer renderers, depth sorting, animation ticker, camera, viewport, grid overlay.
- **editor** -- Vue 3 application (private, not published). Provides the GUI tile map editor.
- **runtime** -- Embeddable game runtime: fixed-timestep game loop, entity/character model, systems (movement, animation, camera follow), input, A* pathfinding.

### Build-time Source Imports

During development, the editor resolves sibling packages directly to their `src/` entry points via Vite aliases. This avoids rebuilding library packages on every change. Production builds use the compiled output via tsup.

## Data Model

### DmProject

Top-level container for a complete project file.

```typescript
interface DmProject {
  version: number;       // Schema version for migration (currently 1)
  name: string;
  maps: DmMap[];
  tilesets: DmTileset[];
}
```

### DmMap

A complete tile map. The `orientation` field determines projection math; currently only `'isometric'` is fully implemented.

```typescript
interface DmMap {
  id: string;
  name: string;
  orientation: 'isometric' | 'orthogonal' | 'staggered' | 'hexagonal';
  renderOrder: 'right-down' | 'right-up' | 'left-down' | 'left-up';
  mapSize: Size;           // { width, height } in tiles
  tileSize: Size;          // { width, height } in pixels
  layers: DmLayer[];       // draw order: index 0 = bottom
  tilesets: DmTilesetRef[];// sorted by firstGid
  properties?: DmPropertyBag;
}
```

### DmLayer

Discriminated union of four layer types:

| Type | Interface | Key Fields |
|---|---|---|
| `'tile'` | `DmTileLayer` | `width`, `height`, `data: Uint32Array` |
| `'object'` | `DmObjectLayer` | `objects: DmObject[]` |
| `'image'` | `DmImageLayer` | `imageSource: string` |
| `'group'` | `DmGroupLayer` | `layers: DmLayer[]` (recursive) |

All layer types share `DmLayerBase`: `id`, `name`, `type`, `visible`, `locked`, `opacity`, `offset`.

### DmTileLayer Data Encoding

Tile data is stored as a flat `Uint32Array` of length `width * height`. Index formula: `row * width + col`.

Each 32-bit value encodes a global tile ID (GID) in the lower 29 bits and three flip flags in the upper 3 bits, matching the Tiled convention:

```
Bit 31: Horizontal flip
Bit 30: Vertical flip
Bit 29: Diagonal flip (anti-diagonal / rotation)
Bits 0-28: Tile GID (0 = empty)
```

Helper functions:

- `extractGid(raw)` -- strips flip bits, returns the tile GID.
- `extractFlipFlags(raw)` -- returns `{ horizontal, vertical, diagonal }`.
- `composeGid(gid, flags)` -- combines a GID with optional flip flags.

### DmTileset

A sprite sheet sliced into a grid of tiles.

```typescript
interface DmTileset {
  id: string;
  name: string;
  imageSource: string;    // URL or data URI
  imageSize: Size;
  tileSize: Size;
  columns: number;        // tiles per row in the image
  tileCount: number;      // total tiles
  spacing: number;        // pixels between tiles
  margin: number;         // pixels around image edge
  tiles: Record<number, DmTileData>;  // per-tile metadata keyed by local ID
  wangSets?: DmWangSet[];
}
```

### DmTilesetRef

Links a tileset to a map with a starting GID:

```typescript
interface DmTilesetRef {
  firstGid: number;
  tileset: DmTileset;
}
```

A tile's local ID within its tileset is `gid - firstGid`. To resolve which tileset owns a GID, find the `DmTilesetRef` with the largest `firstGid` that is `<= gid`.

### DmTileData

Per-tile metadata stored on the tileset (not the layer):

```typescript
interface DmTileData {
  localId: number;
  collision?: DmCollisionShape[];
  animation?: DmTileAnimationFrame[];
  probability?: number;
  properties?: DmPropertyBag;
}
```

## Isometric Projection Math

All coordinate conversion lives in `@dimetric/core/src/math/iso.ts`.

### Grid to Screen

Given a tile at grid position `(col, row)` and tile dimensions `(tileWidth, tileHeight)`:

```
sx = (col - row) * (tileWidth / 2)
sy = (col + row) * (tileHeight / 2)
```

This produces the tile's top-center diamond point in screen space.

### Screen to Grid

Inverse of the above:

```
col = (sx / halfW + sy / halfH) / 2
row = (sy / halfH - sx / halfW) / 2
```

where `halfW = tileWidth / 2` and `halfH = tileHeight / 2`. Returns fractional coordinates; use `Math.floor()` to snap to integer cells.

### Coordinate Types

The codebase uses distinct types to prevent coordinate confusion:

- `GridCoord { col, row }` -- tile-space integer coordinates.
- `ScreenCoord { sx, sy }` -- pixel coordinates in world space (pre-camera).
- `WorldCoord { wx, wy }` -- alias for world-space pixels (used by camera).
- `Point { x, y }` -- general 2D point.

## Rendering Pipeline

### Overview

```
DmRenderer
  +-- PixiJS Application (canvas, ticker, WebGL context)
  +-- DmViewport (pixi-viewport: pan, zoom, scroll)
       +-- layerContainer (Container)
       |    +-- TileLayerRenderer per tile layer
       |    +-- ObjectLayerRenderer per object layer
       |    +-- ImageLayerRenderer per image layer
       |    +-- nested Containers for group layers (recursive)
       +-- GridOverlayRenderer (isometric grid lines)
       +-- HighlightRenderer (selection highlight)
       +-- CursorRenderer (hover cursor)
```

### Initialization

`DmRenderer.init(options)`:

1. Creates a PixiJS `Application` and appends its canvas to the given DOM container.
2. Creates a `DmViewport` wrapping `pixi-viewport` with drag, pinch, and wheel zoom.
3. Adds the viewport to the stage.
4. Attaches the `DmCamera` to the viewport.
5. Creates child containers for layers, grid overlay, and selection overlays.
6. Hooks the `AnimationTicker` into the PixiJS app ticker.
7. Starts a `ResizeObserver` on the container to auto-resize the canvas.

### Layer Tree Building

`DmRenderer.setMap(map)` calls `rebuildLayers(map)` which:

1. Destroys all existing layer renderers.
2. Walks `map.layers` recursively via `buildLayerTree()`.
3. For each layer type, creates the appropriate renderer:
   - `TileLayerRenderer` -- iterates every cell, creates a `Sprite` per non-empty tile positioned using `gridToScreen`. Applies flip flags via `scale.x/y` and rotation.
   - `ObjectLayerRenderer` -- creates sprites for objects with GIDs, positioned at `(x, y)`.
   - `ImageLayerRenderer` -- displays a single background image sprite.
   - Group layers create a nested `Container` and recurse into `layer.layers`.

### Tile Sprite Positioning

For a tile at `(col, row)`:

```
screenPos = gridToScreen(col, row, tileWidth, tileHeight)
sprite.anchor = (0.5, 1)     // bottom-center of the sprite image
sprite.x = screenPos.sx
sprite.y = screenPos.sy + tileHeight / 2
```

The anchor at `(0.5, 1)` means the sprite's bottom-center aligns with the diamond's top vertex, which is the standard convention for isometric tile images that include vertical height.

### Depth Sorting

`depthSortKey(col, row, z)` returns `col + row + z`. Objects/entities further from the camera (higher col+row sum) draw later, producing correct occlusion. `depthSortContainer(container)` reorders a PixiJS container's children by their `_depthKey` property.

### Animation Ticker

`AnimationTicker` maintains a list of `AnimatedTileEntry` records. Each entry tracks a sprite, its frame array (texture + duration in ms), current frame index, and elapsed time. On each PixiJS ticker frame, `tick(deltaMs)` advances all entries, swapping sprite textures at the defined intervals.

### Texture Slicing

`sliceTilesetTextures(baseTexture, tileset, firstGid)` creates a `Map<number, Texture>` by computing UV rectangles from the tileset's `columns`, `tileSize`, `spacing`, and `margin` properties. Each resulting texture is keyed by its global tile ID (`firstGid + localId`).

## Event Flow in the Editor

### Event Bus

The editor uses a typed `mitt` instance (`editorBus`) as its central event bus. Event types are defined in `EditorEvents`:

```typescript
type EditorEvents = {
  'canvas:hover': GridCoord;
  'canvas:pointerdown': GridCoord & { button: number };
  'canvas:pointerup': GridCoord & { button: number };
  'canvas:pointerdrag': GridCoord;
  'canvas:pointerleave': void;
  'map:changed': void;
  'preview:start': void;
  'preview:stop': void;
};
```

### Pointer Event Flow

1. `EditorCanvas.vue` listens to native `pointerdown`, `pointermove`, `pointerup` on the PixiJS viewport.
2. Converts screen coordinates to grid coordinates using `camera.screenToWorld()` then `snapToGrid()`.
3. Emits typed events on `editorBus` (`canvas:pointerdown`, `canvas:pointerdrag`, `canvas:hover`).
4. The `useTool` composable subscribes to these events and dispatches them to the active tool instance.

### Tool Dispatch

Each tool implements the `Tool` interface:

```typescript
interface Tool {
  readonly name: string;
  onPointerDown(coord: GridCoord, button: number): void;
  onPointerDrag(coord: GridCoord): void;
  onPointerUp(coord: GridCoord, button: number): void;
  onHover(coord: GridCoord): void;
}
```

The editor store (`useEditorStore`) holds the `activeTool` string. The `useTool` composable maintains a map of tool instances (`BrushTool`, `EraserTool`, `FillTool`, etc.) and routes bus events to the active one.

### Map Change Propagation

When a tool modifies tile data, it:

1. Calls `project.setTile(mapId, layerId, col, row, gid)` on the Pinia store.
2. Emits `editorBus.emit('map:changed')`.
3. Listeners on `map:changed` trigger the auto-save debounce timer and renderer updates.

## Undo/Redo System

### Design

The undo/redo system uses the **command pattern** (not Immer, which does not support `Uint32Array`). The history store maintains two stacks of `HistoryEntry` records with a max depth of 100.

### Entry Types

```typescript
type HistoryEntry =
  | TileMutationEntry      // batch of tile changes (col, row, oldGid, newGid)
  | LayerAddEntry          // layer added at index
  | LayerRemoveEntry       // layer removed from index
  | LayerPropertyEntry     // scalar property changed (name, opacity, etc.)
  | TilePropertyEntry      // per-tile custom property changed
  | CollisionShapeEntry    // collision shapes modified
  | AnimationFrameEntry;   // animation frames modified
```

### Batch Accumulation

Brush and eraser strokes produce many individual tile changes. Rather than creating one entry per tile, the history store supports batch accumulation:

1. `beginBatch(mapId, layerId)` -- starts collecting changes.
2. `addToBatch(col, row, oldGid, newGid)` -- records a single cell change (skips if old === new).
3. `endBatch()` -- pushes a single `TileMutationEntry` with all accumulated changes. Clears the redo stack.

### Apply / Reverse

Each entry type has forward (`applyForward`) and reverse (`applyReverse`) handlers in the history store:

- **TileMutationEntry**: forward writes `newGid` at each cell; reverse writes `oldGid` in reverse order.
- **LayerAddEntry**: forward splices the layer in; reverse removes it.
- **LayerRemoveEntry**: forward removes; reverse splices back at the original index.
- **LayerPropertyEntry**: forward writes `newValue`; reverse writes `oldValue`.
- **TilePropertyEntry/CollisionShapeEntry/AnimationFrameEntry**: same pattern on tileset tile data.

### Integration

- `Ctrl+Z` calls `history.undo()` then emits `map:changed`.
- `Ctrl+Shift+Z` / `Ctrl+Y` calls `history.redo()` then emits `map:changed`.
- New pushes to the undo stack clear the redo stack (standard undo semantics).

## Runtime Architecture

### Game Loop

`GameLoop` implements a fixed-timestep loop with `requestAnimationFrame`:

```
accumulator += min(frameTime, maxFrameTime)

while accumulator >= fixedDt:
    onFixedUpdate(fixedDt)
    accumulator -= fixedDt

onRender(accumulator / fixedDt)   // interpolation alpha
```

- `fixedDt` defaults to `1/60` seconds.
- `maxFrameTime` defaults to `0.25` seconds (spiral-of-death protection: if the browser tab was backgrounded for seconds, the loop does not try to catch up with hundreds of ticks).

### GameWorld

`GameWorld` orchestrates the loop, entities, systems, map, and renderer:

```
GameWorld
  +-- GameLoop
  |     +-- fixedUpdate -> iterates systems in order
  |     +-- render -> (available for interpolation; PixiJS handles actual draw)
  +-- Entity[]
  +-- System[]
  +-- DmMap (optional)
  +-- DmRenderer (optional, for headless mode)
```

Systems run in the order they are added via `addSystem()`. Each system's `update(dt, world)` receives the fixed timestep and the world reference.

### Entity Model

The entity model is lightweight and component-based:

```
Entity
  +-- id: string
  +-- gridX, gridY: number       (integer tile coordinates)
  +-- pixelX, pixelY: number     (smooth screen coordinates)
  +-- components: Map<string, unknown>

Character extends Entity
  +-- speed: number              (tiles/second)
  +-- direction: Direction       (8-directional)
  +-- path: GridCoord[]          (waypoints)
  +-- animationState: string     ('idle', 'walk', etc.)
```

Components are stored in a generic `Map<string, unknown>` and accessed via `getComponent<T>(name)` / `setComponent(name, value)`. This is not a full ECS (no component storage arrays, no archetype queries) but provides a flexible extension point without requiring class inheritance for every entity variant.

### Built-in Systems

**MovementSystem**: For each `Character` entity with a non-empty path, computes the pixel distance to the next waypoint, advances `pixelX/pixelY` by `speed * tilePixelSize * dt`, and pops waypoints as they are reached. Updates `direction` based on movement delta using 8-directional angle binning.

**AnimationSystem**: Updates character sprite frames based on `animationState` and `direction`.

**CameraFollowSystem**: Each tick, lerps `camera.panTo()` toward the target entity's pixel position using exponential smoothing: `t = 1 - exp(-lerpSpeed * dt)`.

### Pathfinding

**GridGraph**: A boolean walkability grid. `GridGraph.fromMap(map, layerId)` marks cells with non-zero GIDs as blocked. Supports 4-directional or 8-directional neighbors.

**astar(graph, start, goal)**: Standard A* with Chebyshev heuristic. Cardinal moves cost 1, diagonal moves cost `sqrt(2)`. Returns `{ path, found, cost }`. The path array includes both start and goal coordinates.

### Input

**InputManager**: Tracks keyboard state via `keydown`/`keyup` listeners. Maintains three sets: `keysDown` (currently held), `keysJustPressed` (pressed since last flush), `keysJustReleased` (released since last flush). Call `flush()` at the end of each fixed update to clear the per-frame sets.

**Pointer**: Tracks mouse/touch position and button state for pointer-based input.

## Serialization

### Native Format

The native format uses JSON with a `_format: "dimetric-project"` marker and `_version: 1`. Tile layer data (originally `Uint32Array`) is serialized as a plain `number[]` array and reconstructed to `Uint32Array` on deserialization. Tileset images are embedded as data URIs.

### Tiled Format

The formats package provides bidirectional conversion between DmMap and Tiled's TMJ (JSON) and TMX (XML) formats. GID remapping handles the firstGid offset and flip flags. The compression module supports base64 and zlib-compressed tile data encoding used by TMX files.
