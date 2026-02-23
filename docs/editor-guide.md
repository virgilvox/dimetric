# Editor Guide

The Dimetric editor is a browser-based isometric tile map editor built with Vue 3 and PixiJS. It supports tile painting, layer management, tileset import, undo/redo, preview mode, and export to multiple formats.

## Starting the Editor

From the repository root:

```bash
pnpm install
pnpm dev
```

This starts the Vite dev server. Open the URL printed in the terminal (typically `http://localhost:5173`).

## Welcome Screen

On launch, the editor shows a welcome screen with two options:

- **New Map** -- opens the new map dialog.
- **Open Project** -- opens a file picker for `.json` / `.dimetric` project files.

The editor also attempts to restore the last session from `localStorage` auto-save.

## Creating a New Map

Click **New Map** to open the creation dialog. Configure:

| Field | Description | Default |
|---|---|---|
| Name | Display name for the map | `Untitled Map` |
| Columns | Map width in tiles | 20 |
| Rows | Map height in tiles | 20 |
| Tile Width | Tile width in pixels | 64 |
| Tile Height | Tile height in pixels | 32 |

Click **Create** to generate the map. The editor opens the canvas view with an isometric grid and one empty tile layer.

## Importing Tilesets

Click the **+** button in the Tileset panel (right sidebar) to open the import dialog. Select a sprite sheet image (PNG recommended) and specify the tile dimensions. The editor will:

1. Load the image and compute the tile grid layout (columns, rows, tile count).
2. Register the tileset with the map at the next available `firstGid`.
3. Slice the image into individual tile textures for the renderer.
4. Display the tileset grid in the sidebar panel.

Click any tile in the tileset grid to select it as the active brush tile. When multiple tilesets are loaded, use the dropdown above the grid to switch between them.

## Tools

The toolbar runs vertically along the left edge. Each tool has a keyboard shortcut.

### Brush (B)

Paints the selected tile GID onto the active tile layer. Click to place a single tile or click-and-drag to paint a stroke. Each stroke is recorded as a single undo entry.

### Eraser (E)

Sets tiles to GID 0 (empty). Works identically to the brush but always writes zero.

### Fill (G)

Flood-fills a contiguous region of identical GIDs with the selected tile. Click a tile to fill all connected cells that share its GID.

### Eyedropper (I)

Click a tile on the canvas to pick its GID and switch back to the brush tool. Useful for sampling existing tiles without scrolling through the tileset panel.

### Pan (H)

Click-and-drag to pan the viewport. The viewport also supports pan via middle-mouse-button drag and zoom via scroll wheel regardless of the active tool.

### Terrain (T)

Terrain auto-tiling using Wang sets defined on the tileset. Select a terrain type and paint; the tool automatically resolves edge and corner tiles based on the Wang set rules.

## Layer Management

The Layers panel is in the right sidebar, below the tileset panel. Layers are listed top-to-bottom in reverse draw order (topmost layer in the list draws last / appears on top).

### Adding Layers

Click the **+** button in the panel header. A new tile layer is created with the same dimensions as the map and added to the top of the stack.

### Selecting a Layer

Click a layer in the list to make it the active layer. All painting tools operate on the active layer. The active layer is highlighted in the list.

### Renaming

Double-click a layer name to enter inline rename mode. Press Enter to confirm or Escape to cancel.

### Visibility

Click the **V** / **-** toggle on each layer to show or hide it. Hidden layers are not rendered but their data is preserved.

### Locking

Click the **U** / **L** toggle to lock or unlock a layer. Locked layers cannot be painted on.

### Opacity

When a layer is selected, an opacity slider appears below the layer list. Drag to adjust opacity from 0% to 100%. The final value is recorded for undo/redo.

### Deleting

Click the **x** button on a layer to remove it. At least one layer must remain; the delete button does nothing on the last layer.

## Tileset Editor

The tileset editor allows configuring per-tile metadata on the active tileset. Select a tile in the tileset grid to view and edit its properties.

### Custom Properties

Add arbitrary key-value properties to individual tiles. Properties support string, number, boolean, and color types. These are preserved in the project file and exported to Tiled format.

### Collision Shapes

Define collision regions on tiles for use in game runtime. Supported shape types:

- **Rectangle** -- axis-aligned bounding box with x, y, width, height.
- **Ellipse** -- inscribed in a bounding rectangle.
- **Polygon** -- arbitrary vertex list.

### Animation

Define frame-by-frame animation for a tile. Each frame specifies a local tile ID (within the same tileset) and a duration in milliseconds. The renderer's `AnimationTicker` automatically advances these at runtime.

### Terrain / Wang Sets

Configure Wang sets for terrain auto-tiling. A Wang set defines:

- **Type**: corner, edge, or mixed.
- **Colors**: named terrain types (e.g., grass, water, road) with associated tile IDs.
- **Wang tiles**: mappings from tile IDs to 8-element Wang ID arrays encoding which color occupies each corner/edge slot.

## Preview Mode

### Starting Preview

Click the **Play** button in the toolbar or press **F5**. The editor enters preview mode:

- All editing tools are disabled.
- The game loop starts with the current map.
- Entities and systems run if configured.

### Stopping Preview

Click **Stop** or press **Escape** to exit preview mode and return to editing. Map state is restored to the pre-preview snapshot.

## Export

Click the **Export** button in the toolbar or press **Ctrl+Shift+E** to open the export dialog.

### Formats

| Format | Description |
|---|---|
| **Standalone HTML** | Self-contained HTML file with embedded renderer, textures, and map data. Opens directly in a browser. |
| **JSON Bundle** | Native Dimetric project JSON (`.dimetric.json`). Contains all maps, tilesets, and tile data. Tileset images are embedded as data URIs. |
| **TMX** | Tiled XML map format. Compatible with the Tiled editor and any TMX-compatible game engine. |
| **TMJ** | Tiled JSON map format. Same data as TMX in JSON form. |

## Saving

### Manual Save

Press **Ctrl+S** to download the project as a `.dimetric.json` file.

### Auto-Save

The editor auto-saves to `localStorage` every 2 seconds after any map change. On next launch, the last auto-saved session is restored automatically.

### Opening a Project

Click **Open Project** on the welcome screen or reload the page to restore the auto-save. The file picker accepts `.json` and `.dimetric` files.

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `B` | Brush tool |
| `E` | Eraser tool |
| `G` | Fill tool |
| `I` | Eyedropper tool |
| `H` | Pan tool |
| `T` | Terrain tool |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+Y` | Redo (alternate) |
| `Ctrl+S` | Save project to file |
| `Ctrl+Shift+E` | Open export dialog |
| `#` | Toggle grid overlay |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `F5` | Start preview mode |
| `Escape` | Stop preview mode |

All tool shortcuts are single keys and are disabled when a text input is focused or when modifier keys (Ctrl/Cmd) are held.
