# Dimetric: Developer Handoff

## Project Overview

Dimetric is a browser-based isometric tile/map editor and embeddable game runtime. It replaces Tiled (Qt desktop app) with a modern web tool that handles isometric depth preview, smart asset import, and can embed maps directly in games as components.

**Stack:** Vue 3 (Composition API), TypeScript, PixiJS v8, pnpm monorepo.

---

## Completion Status

| Phase | Feature | Status | Tests |
|-------|---------|--------|-------|
| 0 | Monorepo scaffolding | Done | - |
| 1 | Core data model | Done | 55 |
| 2 | Renderer foundation | Done | - |
| 3 | MVP editor shell | Done | - |
| 4 | Persistence (save/load) | Done | 20 |
| — | Audit hardening pass | Done | — |
| 5 | Undo/redo + keyboard shortcuts | Not started | - |
| 6 | Format parsers (TMX/Aseprite/TexturePacker) | Not started | - |
| 7 | Advanced rendering (animations, depth sort, object layers) | Not started | - |
| 8 | Runtime package (game loop, pathfinding, entities) | Not started | - |

**MVP boundary: Phases 0-4 are complete + audit hardened.** 75 tests passing, all packages build, dev server runs.

---

## Package Architecture

```
@dimetric/core       (zero deps, pure TS)
    ^         ^
    |         |
@dimetric/formats    @dimetric/renderer
    ^                    ^        ^
    |                    |        |
    +--------------------+        |
    |                             |
@dimetric/editor             @dimetric/runtime
(Vue 3 app, private)         (embeddable lib, placeholder)
```

| Package | LOC | Purpose |
|---------|-----|---------|
| `core` | ~580 | Types, isometric math, factories, constants |
| `formats` | ~270 | Native JSON serialize/deserialize |
| `renderer` | ~660 | PixiJS rendering, camera, grid, tile layers, overlays |
| `editor` | ~2050 | Vue 3 UI, Pinia stores, tools, dialogs |
| `runtime` | ~50 | Placeholder stubs |

---

## Build & Dev Commands

```bash
pnpm install        # Install all workspace deps
pnpm build          # Build all packages (libs first, then editor)
pnpm test           # Run vitest across core + formats
pnpm dev            # Start Vite dev server for editor
pnpm clean          # Clean all package dist/ folders
```

Build order: `core` → `formats` + `renderer` (parallel) → `runtime` → `editor`

Dev mode uses Vite source aliases so `@dimetric/core` resolves to `packages/core/src/index.ts` directly (instant HMR across packages).

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| **PixiJS v8 directly** (not vue3-pixi) | Simpler, more debuggable, avoids abstraction layer |
| **Uint32Array for tile data** | Matches Tiled's 32-bit GIDs with flip flags in top 3 bits |
| **pixi-viewport for camera** | Handles drag, wheel zoom, pinch, momentum, clamping |
| **Immer patches for undo/redo** (Phase 5) | Auto-captures forward/reverse diffs, no manual Command objects |
| **typed mitt for event bus** | Lightweight, type-safe decoupling between tools/stores/renderer |
| **Native JSON format** | `_format: "dimetric-project"`, `_version: 1`, Uint32Array → number[] in JSON |

---

## Data Flow

```
User interacts with PixiJS canvas (EditorCanvas.vue)
    ↓
Raw pointer events → screenToWorld → snapToGrid → grid coordinates
    ↓
editorBus emits canvas:pointerdown / canvas:pointerdrag / canvas:hover
    ↓
Active Tool (brush/eraser/fill/eyedropper) processes events
    ↓
Tool calls project store mutations (setTile, etc.)
    ↓
editorBus emits map:changed
    ↓
EditorCanvas.vue listener calls renderer.rebuildLayers()
    ↓
Auto-save debounces to localStorage (2s delay)
```

---

## What the MVP Editor Can Do

- Create maps with custom dimensions and tile sizes
- Import tileset images (PNG) with configurable tile grid
- Select tiles from the tileset panel
- Paint tiles with brush tool (click and drag)
- Erase tiles
- Flood fill with fill tool (BFS)
- Pick tiles with eyedropper
- Pan and zoom the viewport (drag, scroll wheel, pixi-viewport)
- Toggle isometric grid overlay
- Manage layers (add, remove, toggle visibility)
- Save project to disk (Ctrl+S → `.dimetric.json` download)
- Open project from file
- Auto-save to localStorage every 2 seconds

**Keyboard shortcuts:** B (brush), E (eraser), G (fill), H (pan), I (eyedropper), +/- (zoom), # (grid toggle), Ctrl+S (save)

---

## File Tree (Key Files)

```
packages/
├── core/src/
│   ├── types/          # geometry, map, tileset, properties, project, wang
│   ├── math/
│   │   ├── iso.ts      # gridToScreen, screenToGrid, snapToGrid
│   │   ├── bitflags.ts # extractGid, extractFlipFlags, composeGid
│   │   └── rect.ts     # intersects, contains, containsPoint, expandToContain
│   ├── model/
│   │   ├── map-factory.ts      # createMap, createTileLayer, etc.
│   │   ├── tileset-factory.ts  # createTileset
│   │   └── id-generator.ts
│   └── constants.ts    # DEFAULT_TILE_WIDTH=64, DEFAULT_TILE_HEIGHT=32
│
├── formats/src/native/
│   ├── schema.ts       # SerializedProject types, FORMAT_MAGIC, SCHEMA_VERSION
│   ├── serialize.ts    # DmProject → JSON (Uint32Array → number[])
│   └── deserialize.ts  # JSON → DmProject (number[] → Uint32Array)
│
├── renderer/src/
│   ├── engine/
│   │   ├── renderer.ts   # DmRenderer: init, destroy, setMap, rebuildLayers
│   │   ├── camera.ts     # DmCamera: panTo, setZoom, screenToWorld
│   │   └── viewport.ts   # DmViewport: pixi-viewport adapter
│   ├── layers/
│   │   ├── grid-overlay-renderer.ts  # Wireframe iso diamond grid
│   │   └── tile-layer-renderer.ts    # Renders tiles from GID data
│   ├── selection/
│   │   ├── highlight-renderer.ts     # Hover diamond highlight
│   │   └── cursor-renderer.ts        # Ghost tile at cursor
│   └── sprites/
│       ├── atlas-loader.ts   # sliceTilesetTextures, buildTileTextureMap
│       └── sprite-pool.ts
│
├── editor/src/
│   ├── App.vue         # Root: welcome screen ↔ editor layout, save/load
│   ├── stores/
│   │   ├── project.ts  # DmMap[], DmTileset[], tile CRUD, layer CRUD
│   │   ├── editor.ts   # activeTool, activeLayerId, selectedGid, showGrid
│   │   └── camera.ts   # x, y, zoom (mirrors renderer camera)
│   ├── tools/
│   │   ├── tool.ts            # Tool interface
│   │   ├── brush-tool.ts      # Paint selected GID
│   │   ├── eraser-tool.ts     # Paint GID 0
│   │   ├── fill-tool.ts       # BFS flood fill
│   │   ├── eyedropper-tool.ts # Pick GID, switch to brush
│   │   └── pan-tool.ts        # No-op (viewport handles panning)
│   ├── components/
│   │   ├── canvas/EditorCanvas.vue      # Owns DmRenderer, pointer→grid events
│   │   ├── canvas/CanvasOverlay.vue     # Coords + zoom % display
│   │   ├── toolbar/Toolbar.vue          # Tool buttons
│   │   ├── sidebar/TilesetPanel.vue     # Import tileset, select tiles
│   │   ├── sidebar/LayerPanel.vue       # Add/remove/toggle layers
│   │   ├── dialogs/NewMapDialog.vue
│   │   └── dialogs/ImportTilesetDialog.vue
│   ├── composables/
│   │   ├── use-tool.ts          # Tool instance registry + dispatch
│   │   └── use-keyboard.ts      # Global keyboard shortcuts
│   └── events/bus.ts            # typed mitt<EditorEvents> instance
│
└── runtime/src/
    └── index.ts  # Placeholder
```

---

## Known Gaps & Placeholders

1. **`TileLayerRenderer.updateTile()`** does a full rebuild — optimize with targeted sprite updates later
2. **No tests for renderer or editor** — only core (55) and formats (20) have tests
3. **Git status**: All source files are untracked (not yet committed)

---

## Audit Hardening Pass (Completed)

Post-MVP audit that fixed bugs, memory leaks, missing validation, and dead code:

| Fix | Category | What Changed |
|-----|----------|-------------|
| EditorCanvas cleanup | Memory leak | Canvas pointer listeners + viewport `moved` listener now removed in `onUnmounted`; cleanup runs before `renderer.destroy()` |
| Renderer destroy | Memory leak | `tileTextures.clear()` and `currentMap = null` added to `destroy()` |
| Deserialization validation | Input safety | Validates input is object, checks `tilesets`/`maps` arrays exist, validates tile layer `width`/`height`/`data` with descriptive errors |
| Fill tool bounds | Crash prevention | Validates start coordinate is within map bounds before flood fill |
| Factory validation | Input safety | `createMap` and `createTileLayer` throw on zero/negative dimensions |
| Rect half-open intervals | Correctness | `containsPoint` uses `[x, x+w)` convention consistent with `intersects` |
| Dead code removal | Cleanup | Deleted unused `use-canvas-events.ts`, `ExportDialog.vue`; removed placeholder `select` tool type |
| Config hardening | Build | Expanded `.gitignore`, added `clean` script, added `pixi-viewport` to runtime externals |
| Test coverage | Quality | 20 new tests: malformed input, object/empty/properties round-trips, factory validation |

---

## Phase 5: Undo/Redo (Next Up)

**Approach:** Immer `produceWithPatches` for automatic forward/reverse diffs.

**Files to create:**
- `editor/src/stores/history.ts` — Undo/redo stacks with Immer patches
- `editor/src/commands/paint-tile.ts` — Wrap tile mutations in produce
- `editor/src/commands/erase-tile.ts`
- `editor/src/commands/fill-area.ts`
- `editor/src/commands/add-layer.ts`, `remove-layer.ts`
- `editor/src/commands/batch.ts` — Group multiple operations

**Changes needed:**
- Wrap `project.setTile()` calls in tools to go through history store
- Add Ctrl+Z / Ctrl+Shift+Z to `use-keyboard.ts`
- Immer is already installed as a dependency

---

## Phase 6: Format Parsers

**Files to create in `formats/src/`:**
- `tmx/tmj-parser.ts` — Tiled JSON → DmMap
- `tmx/tmx-parser.ts` — Tiled XML → DmMap
- `tmx/tsx-parser.ts` — Tileset XML → DmTileset
- `tmx/tmx-writer.ts`, `tmj-writer.ts` — Export back to Tiled format
- `tmx/gid-utils.ts` — firstgid remapping, flip flags
- `aseprite/ase-parser.ts` — .ase binary → sprite atlas
- `aseprite/ase-json-parser.ts` — Aseprite JSON export
- `atlas/texturepacker-parser.ts` — TexturePacker JSON
- `atlas/grid-slicer.ts` — Raw PNG + grid params → DmTileset

**Dependencies to add:** `pako` (zlib for compressed TMX), `ase-parser` (Aseprite binary)

---

## Phase 7: Advanced Rendering

**Depth sorting** is the hardest problem. README Section 7 covers approaches:
- Basic: `sortOrder = gridX + gridY`
- Multi-tile objects need topological sort or AABB comparison
- Elevation: `sortOrder = (floor * 10000) + (gridX + gridY)`

**Files to create:**
- `renderer/src/sorting/depth-sort.ts` — y-sort + topological for multi-tile
- `renderer/src/sorting/sort-key.ts`
- `renderer/src/sprites/animation-ticker.ts`
- `renderer/src/layers/object-layer-renderer.ts`
- `renderer/src/layers/image-layer-renderer.ts`

---

## Phase 8: Runtime Package

**Files to create in `runtime/src/`:**
- `engine/game-loop.ts` — rAF with fixed timestep
- `engine/game-world.ts` — Map + entities + systems
- `entities/entity.ts`, `character.ts`
- `systems/movement.ts`, `animation.ts`, `camera-follow.ts`
- `input/input-manager.ts`, `pointer.ts`
- `pathfinding/astar.ts`, `grid-graph.ts`

---

## Isometric Math Reference

```
Screen from grid:
  sx = (col - row) * (tileWidth / 2)
  sy = (col + row) * (tileHeight / 2)

Grid from screen (inverse):
  col = (sx/halfW + sy/halfH) / 2
  row = (sy/halfH - sx/halfW) / 2

Default tile: 64×32px (2:1 isometric ratio)
Default map: 20×20 tiles

Tiled GID bit layout (32-bit):
  Bit 31: horizontal flip
  Bit 30: vertical flip
  Bit 29: diagonal flip
  Bits 0-28: actual tile ID (max ~537M tiles)
```
