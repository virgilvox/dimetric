# dimetric

(isometric is taken as a package name and organization so when building this use dimetric which we already have the org name for on npm)

# Isometric Sprites, Tiles & Map Editors: Complete Technical Deep Dive

a comprehensive research document for building a browser-based isometric design tool

---

## 1. The Isometric Projection Model

isometric projection fakes 3d on a flat screen using a roughly 30-degree angle from horizontal (technically 26.57° due to the 2:1 pixel ratio). the key ratio is **2:1** — for every 2 pixels horizontal, you go 1 pixel vertical. this gives you diamond-shaped tiles.

there are actually three variants used in games:

- **true isometric** — 30° rotation, used in Diablo, Age of Empires. tile diamonds are wider than tall at 2:1
- **staggered isometric** — same visual result but stored in a staggered rectangular grid. rows are offset by half a tile width. used by some SimCity-style games
- **dimetric** — slight variation where angles aren't equal. some games use this for aesthetic reasons

the standard convention is that a tile with a "world size" of 64x64 pixels renders as a **64x32 diamond** on screen (2:1 ratio). common tile sizes in the wild:

| base size | diamond on screen | common use |
|-----------|------------------|------------|
| 32x32 | 32x16 | retro pixel art, mobile |
| 64x64 | 64x32 | most common standard |
| 128x128 | 128x64 | high-detail desktop |
| 256x256 | 256x128 | HD isometric |

### coordinate conversion

the math to go between cartesian (grid) and screen (iso) coordinates:

```
screen_x = (grid_x - grid_y) * (tile_width / 2)
screen_y = (grid_x + grid_y) * (tile_height / 2)

grid_x = (screen_x / (tile_width / 2) + screen_y / (tile_height / 2)) / 2
grid_y = (screen_y / (tile_height / 2) - screen_x / (tile_width / 2)) / 2
```

every isometric engine needs these conversions. they're the backbone of mouse picking, placement, pathfinding, everything.

---

## 2. Asset Categories & How They Differ

isometric games break assets into distinct categories that each have different rules for rendering, collision, and storage.

### ground tiles (floor tiles)

- exactly one tile in footprint (1x1)
- perfectly diamond-shaped, designed to tile seamlessly
- no height/volume — they're flat
- stored in tile layers as simple grid indices
- need transition tiles for edges (grass-to-dirt, water-to-land)
- artists typically create 3-5 variants per terrain type to break repetition
- common sizes: 64x32, 128x64

### wall tiles

- occupy edges between tiles rather than tile centers
- need variants for all orientations (N, S, E, W walls and corners)
- taller than ground tiles — the image extends above the diamond footprint
- some systems treat walls as objects on tile edges, others as full tiles with transparency
- auto-tiling (wang tiles / terrain sets) handles wall connections automatically

### objects / furniture / props

- occupy one or more tiles (footprint can be 1x1, 2x1, 2x2, 3x2, etc.)
- image is larger than their footprint — extends upward for height
- have a **ground footprint** (which tiles they occupy) separate from their **visual bounds**
- need an **anchor point** (registration point / pivot) — typically bottom-center of the footprint diamond
- the anchor point is critical for positioning: in isometric, objects align to bottom-center, not top-left
- can be walkable or non-walkable (a rug vs a table)
- placed on **object layers** in map editors, not tile layers

### buildings / large structures

- multi-tile footprint (e.g. 4x3)
- image extends significantly above footprint
- usually broken into smaller tile-sized pieces for proper depth sorting, OR rendered as a single large sprite with careful z-ordering
- depth sorting for multi-tile objects is the hardest problem in isometric rendering
- some engines split large sprites into column-strips for per-tile depth interleaving

### characters / NPCs

- typically rendered at the same scale as a 1x1 tile but visually smaller
- **8 directional sprites** is the convention for isometric: N, NE, E, SE, S, SW, W, NW
- some games use 4 directions and mirror left/right (saves ~37% memory)
- some older games used 16 or even 32 directions (StarCraft)
- each direction has multiple animation states: idle, walk, run, attack, die, etc.
- spritesheet layout convention: rows = directions, columns = animation frames
- mirroring trick: you can often get away with only drawing 5 directions (S, SE, E, NE, N) and flipping for the other 3
- **anchor point** is at the feet — the character's feet should align with the center of the tile they occupy
- characters need to participate in depth sorting dynamically every frame

### items / collectibles

- typically 1x1 or smaller than a tile
- simpler than furniture — often just a static sprite
- may have pickup animations
- placed via object layers
- collision is usually just "overlapping the character's position"

### decorations / overlays

- things like shadows, ground decals, particle effects
- rendered at specific z-order relative to other elements
- may not participate in collision at all

---

## 3. Sprite Sheet Conventions & File Formats

### sprite sheet / atlas formats

the industry has settled on two main approaches:

**1. grid-based sheets** — sprites arranged in a uniform grid
- simple to parse: frame = row * columns + column
- wasteful if sprites vary in size
- common for tilesets and character animations
- format: just a PNG with metadata about grid dimensions

**2. packed atlases** — sprites packed tightly with a JSON/XML manifest
- TexturePacker, Aseprite, Shoebox all produce these
- much more efficient use of texture space
- manifest maps frame names to {x, y, width, height} rectangles
- better for mixed-size assets

### the aseprite JSON format (de facto standard for indie/pixel art)

aseprite exports a PNG spritesheet + JSON manifest:

```json
{
  "frames": {
    "sprite_0.aseprite": {
      "frame": {"x": 0, "y": 0, "w": 64, "h": 64},
      "rotated": false,
      "trimmed": false,
      "spriteSourceSize": {"x": 0, "y": 0, "w": 64, "h": 64},
      "sourceSize": {"w": 64, "h": 64},
      "duration": 100
    }
  },
  "meta": {
    "app": "http://www.aseprite.org/",
    "image": "spritesheet.png",
    "size": {"w": 512, "h": 256},
    "scale": "1",
    "frameTags": [
      {"name": "walk_south", "from": 0, "to": 7, "direction": "forward"},
      {"name": "walk_north", "from": 8, "to": 15, "direction": "forward"},
      {"name": "idle", "from": 16, "to": 19, "direction": "pingpong"}
    ],
    "slices": [
      {"name": "hitbox", "keys": [{"frame": 0, "bounds": {"x": 10, "y": 40, "w": 44, "h": 24}}]}
    ]
  }
}
```

key concepts:
- **frameTags** define named animations with frame ranges and direction (forward, reverse, pingpong)
- **slices** can define collision regions, anchor points, etc.
- **duration** per frame allows variable-speed animation
- **trimmed** sprites have transparent edges cropped for efficiency
- **spriteSourceSize** tells you the offset to restore the original canvas position

### texturepacker JSON format

similar but with some extras:

```json
{
  "frames": [
    {
      "filename": "walk_0001.png",
      "frame": {"x": 0, "y": 0, "w": 64, "h": 64},
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": {"x": 5, "y": 3, "w": 54, "h": 58},
      "sourceSize": {"w": 64, "h": 64},
      "pivot": {"x": 0.5, "y": 1.0}
    }
  ],
  "meta": {
    "image": "atlas.png",
    "format": "RGBA8888",
    "size": {"w": 1024, "h": 1024}
  }
}
```

the **pivot** field is critical for isometric — it defines the anchor point as a normalized 0-1 value. (0.5, 1.0) means bottom-center, which is the isometric standard.

### other formats you'll encounter

| format | extension | notes |
|--------|-----------|-------|
| aseprite native | .ase / .aseprite | binary format, can be parsed directly (specs are open) |
| Tiled tileset | .tsx | XML describing a tileset (tile dimensions, image source, per-tile properties) |
| Tiled map | .tmx / .tmj | XML or JSON map with layers, tilesets, objects |
| LDtk | .ldtk | JSON project file, focused on platformers, no isometric support |
| Godot tileset | .tres | Godot resource format |
| Unity tilemap | .asset | Unity-specific binary |
| raw PNG grid | .png | just an image, grid dimensions in filename or convention |
| GIF | .gif | animated sprites, frame timing built in |
| WebP | .webp | modern alternative with animation support and better compression |

---

## 4. The TMX Format (Tiled's Map Format) — The Industry Standard

tiled is the most widely used map editor. its TMX format is the closest thing to a universal standard. understanding it deeply is essential.

### map structure

```xml
<map version="1.10" orientation="isometric" 
     renderorder="right-down"
     width="20" height="20" 
     tilewidth="64" tileheight="32">
  
  <!-- tilesets reference external .tsx files or embed directly -->
  <tileset firstgid="1" source="terrain.tsx"/>
  <tileset firstgid="73" source="buildings.tsx"/>
  
  <!-- tile layers — flat grids of tile indices -->
  <layer name="Ground" width="20" height="20">
    <data encoding="csv">
      1,2,3,1,2,...
    </data>
  </layer>
  
  <!-- object layers — freeform positioned entities -->
  <objectgroup name="Furniture">
    <object id="1" name="table" gid="85" x="128" y="96" width="64" height="32"/>
    <object id="2" name="spawn_point" x="200" y="150">
      <properties>
        <property name="type" value="player"/>
      </properties>
    </object>
  </objectgroup>
  
  <!-- image layers — full background/overlay images -->
  <imagelayer name="Background">
    <image source="bg.png"/>
  </imagelayer>
</map>
```

### critical TMX concepts

**global tile IDs (GID):** each tile across all tilesets gets a unique ID. first tileset starts at firstgid=1, second tileset starts at firstgid = 1 + (number of tiles in first set). GID 0 means empty/no tile.

**tile flipping flags:** the top 3 bits of a GID encode horizontal flip, vertical flip, and diagonal flip. you must mask these out before looking up the tile.

```
bit 31: horizontal flip
bit 30: vertical flip
bit 29: diagonal (anti-diagonal) flip
actual_gid = raw_gid & 0x1FFFFFFF
```

**data encoding options:**
- CSV: comma-separated GIDs, human readable
- base64: base64-encoded binary, optionally compressed with zlib, gzip, or zstd
- XML: each tile as an XML element (verbose)

**layer types:**
- `<layer>` — tile layer, grid-based
- `<objectgroup>` — object layer, coordinate-based
- `<imagelayer>` — single image overlay
- `<group>` — folder that contains other layers

**object alignment:** in isometric maps, tile objects (objects with a GID) align to bottom-center by default. this is different from orthogonal maps which align bottom-left.

### tileset format (.tsx)

```xml
<tileset name="terrain" tilewidth="64" tileheight="32" tilecount="72" columns="8">
  <image source="terrain.png" width="512" height="288"/>
  
  <!-- per-tile properties -->
  <tile id="5">
    <properties>
      <property name="walkable" type="bool" value="false"/>
    </properties>
  </tile>
  
  <!-- per-tile collision shapes -->
  <tile id="10">
    <objectgroup>
      <object x="0" y="0" width="64" height="32"/>
    </objectgroup>
  </tile>
  
  <!-- animated tiles -->
  <tile id="20">
    <animation>
      <frame tileid="20" duration="200"/>
      <frame tileid="21" duration="200"/>
      <frame tileid="22" duration="200"/>
    </animation>
  </tile>
  
  <!-- wang sets / terrain sets for auto-tiling -->
  <wangsets>
    <wangset name="Terrain" type="corner" tile="-1">
      <wangcolor name="Grass" color="#00ff00" tile="1"/>
      <wangcolor name="Dirt" color="#aa5500" tile="5"/>
      <wangtile tileid="0" wangid="0,1,0,1,0,1,0,1"/>
    </wangset>
  </wangsets>
</tileset>
```

**collection of images tilesets:** instead of one big spritesheet image, each tile can reference its own image file. useful for objects/furniture of varying sizes.

```xml
<tileset name="furniture" tilewidth="128" tileheight="128">
  <tile id="0">
    <image source="table.png" width="128" height="96"/>
  </tile>
  <tile id="1">
    <image source="chair.png" width="64" height="80"/>
  </tile>
</tileset>
```

### what tiled's JSON format looks like

tiled can also export as JSON (.tmj). same structure, easier to parse in JS:

```json
{
  "orientation": "isometric",
  "width": 20, "height": 20,
  "tilewidth": 64, "tileheight": 32,
  "layers": [
    {
      "type": "tilelayer",
      "name": "Ground",
      "data": [1, 2, 3, ...],
      "width": 20, "height": 20
    },
    {
      "type": "objectgroup", 
      "name": "Objects",
      "objects": [
        {"id": 1, "gid": 85, "x": 128, "y": 96, "width": 64, "height": 32,
         "properties": [{"name": "walkable", "type": "bool", "value": false}]}
      ]
    }
  ],
  "tilesets": [
    {"firstgid": 1, "source": "terrain.tsj"}
  ]
}
```

---

## 5. Animations in Isometric Games

### tile animations

tiled supports animated tiles natively. an animated tile cycles through a sequence of other tile IDs with specified durations. stored in the tileset:

```
tile 20: frame 0 (200ms) → frame 1 (200ms) → frame 2 (200ms) → loop
```

used for: water, lava, torches, flickering lights, waving flags.

the engine just swaps which source rectangle it draws from the spritesheet on each timer tick.

### character/object animations

these use spritesheet-based animation, not tile animation. the standard approach:

1. each character has a spritesheet atlas (PNG + JSON manifest)
2. animations are defined as named frame sequences with timing
3. the animation system maintains: current animation name, current frame index, elapsed time
4. each frame, check if enough time has passed to advance to next frame
5. look up the source rectangle from the atlas for the current frame
6. draw that rectangle at the character's screen position, offset by the anchor point

**8-direction animation layout convention:**

```
row 0: south (facing camera)
row 1: south-west
row 2: west
row 3: north-west
row 4: north (facing away)
row 5: north-east (mirror of north-west, or unique)
row 6: east (mirror of west, or unique)
row 7: south-east (mirror of south-west, or unique)
```

with mirroring optimization, you only need 5 rows and flip horizontally for the other 3.

**animation states commonly needed:**

| state | frames | notes |
|-------|--------|-------|
| idle | 2-4 | subtle breathing/shifting |
| walk | 6-8 | full walk cycle per direction |
| run | 6-8 | faster cycle |
| attack | 4-8 | per weapon type |
| die | 4-6 | usually not directional |
| cast | 4-6 | spell/ability |
| interact | 4-6 | picking up, using |

at 8 directions × 8 frames × 6 states = 384 frames per character. at 64x64 per frame that's ~1.5MB uncompressed per character. this is why texture atlases and trimming matter.

### animation playback modes

- **forward**: play frames 0→N, loop
- **reverse**: play frames N→0, loop  
- **pingpong**: play 0→N→0, loop (good for idle animations)
- **once**: play 0→N, stop on last frame (good for death)

---

## 6. Collision / Walkability / Solid Areas

### how walkability is typically determined

**approach 1: per-tile walkability flag** (most common)

each tile in the tileset has a boolean `walkable` property. the collision layer is just the tile layer data — look up the tile at a grid position, check if walkable.

```
function canMoveTo(gridX, gridY) {
  const tileId = groundLayer.getTileAt(gridX, gridY);
  return tilesets.getTileProperty(tileId, 'walkable') !== false;
}
```

**approach 2: separate collision layer**

a dedicated tile layer that's invisible at runtime. uses special "collision tiles" to mark blocked areas. this is more flexible because collision shape can differ from visual tiles.

tiled supports this well — you create a tile layer called "Collision" and use specific tiles to paint walkable/non-walkable areas.

**approach 3: per-tile collision shapes**

tiled's collision editor lets you draw polygons on individual tiles. each tile can have:
- rectangles
- ellipses  
- polygons
- polylines

these are stored in the tileset and can be used for pixel-precise collision. the TilemapCollider in Unity uses these shapes directly.

**approach 4: object-based collision**

place collision rectangles/polygons as objects on an object layer. more flexible for irregular shapes. good for large obstacles that span multiple tiles.

### collision for multi-tile objects

if a table occupies a 2x2 footprint, all 4 tiles need to be marked as non-walkable. approaches:

1. mark all tiles under the object's footprint as blocked when the object is placed
2. store footprint data per object type and check dynamically
3. use a collision grid separate from the tile grid that gets updated when objects move

### collision detection for moving characters

since characters move in pixel space (not snapped to grid), you need to:

1. calculate which grid cell(s) the character would occupy at the new position
2. check if any of those cells are non-walkable
3. check against the character's collision bounds, not just their center point
4. for proper feel, check all four corners of the character's footprint

```
function isWalkable(pixelX, pixelY) {
  // convert pixel position to grid coordinates
  const gridPos = screenToGrid(pixelX, pixelY);
  // check the tile at that grid position
  return collisionMap[gridPos.y][gridPos.x] === 0;
}
```

---

## 7. Depth Sorting (Z-Ordering)

this is the single hardest problem in isometric rendering. getting it wrong makes everything look broken.

### the basic rule

in isometric view, objects farther from the camera (higher Y in screen space for same ground level, or lower X+Y in world space) should be drawn first. the standard formula:

```
sortOrder = gridX + gridY
```

objects with lower sortOrder are farther back and drawn first. for sub-tile precision:

```
sortOrder = worldX + worldY + (worldZ * some_factor)
```

### static levels (no moving objects)

two approaches:

**row-first:** assign sort order by completing each row before moving to the next.
```
sortOrder = row * numColumns + column
```

**painter's algorithm:** just iterate the 2D grid from top-left to bottom-right, drawing each tile. the natural iteration order produces correct depth.

### dynamic objects (characters, moving furniture)

this is where it gets hard. you can't just draw all tiles then all objects. a character walking behind a tree needs to be drawn before the tree, but walking in front of it needs to be drawn after.

**approach 1: interleave objects with tiles**

during the tile rendering loop, when you reach the row/column that matches a character's position, draw the character at that point in the sequence. this works for simple cases.

**approach 2: per-entity sort value**

assign every renderable entity (tiles, objects, characters) a sort value based on their position, then sort and draw in order.

```
entity.sortValue = entity.isoY + entity.isoX + (entity.isoZ * zFactor)
```

**approach 3: topological sort / dependency graph**

for complex scenes with overlapping multi-tile objects, you need to build a graph of "A must be drawn before B" relationships and topologically sort it. this is O(N²) worst case but can be optimized with spatial partitioning.

**approach 4: split into strips**

break tall objects into horizontal strips (one per tile row) and interleave them with other objects at the same depth. this is what many professional games do.

### the multi-tile object problem

a 3x2 building drawn as a single sprite can't be correctly sorted against a character walking past it using a single sort value. the character might be in front of the bottom-left corner but behind the top-right corner.

solutions:
- split the building sprite into per-tile pieces
- use the building's "base tile" (typically the front-most occupied tile) as the sort anchor
- use AABB-based depth comparison between all pairs of objects

### elevation / multiple floors

multiply floor level by a large constant and add to sort value:

```
sortOrder = (floor * 10000) + (gridX + gridY)
```

everything on floor 2 draws after everything on floor 1.

---

## 8. Popular Tools & What They Produce

### map editors

**Tiled** (mapeditor.org)
- the standard. free, open source, cross-platform (Qt/C++)
- supports orthogonal, isometric, staggered, hexagonal
- outputs: TMX (XML), TMJ (JSON), also exports to Godot, GameMaker, others
- tileset files: TSX (XML), TSJ (JSON)
- 12k+ GitHub stars
- plugin system for custom exporters
- scripting API for automation
- weakness: UI feels dated, no built-in preview/playback, limited isometric-specific features

**LDtk** (ldtk.io)
- from the creator of Dead Cells
- beautiful modern UI, very fast
- **explicitly does NOT support isometric** — platformers and top-down only
- outputs: JSON (.ldtk), can export to TMX for Tiled compatibility
- supports Aseprite files directly

**Sprite Fusion** (spritefusion.com)
- web-based tilemap editor
- exports to Unity Tilemap, Godot scenes, JSON
- newer, gaining traction
- free tier available

**OGMO Editor**
- lightweight, focused on simplicity
- JSON output
- no isometric support

### sprite creation tools

**Aseprite** ($20, open source buildable)
- the gold standard for pixel art and animation
- native .ase/.aseprite format (binary, specs are public)
- exports: PNG spritesheet + JSON atlas, GIF, individual frames
- animation tags, layers, onion skinning
- tilemap editing features (newer addition)
- CLI for batch export automation
- isometric grid support via plugins/scripts

**Pyxel Edit** ($9)
- built for tilesets specifically
- isometric tile support
- real-time tilemap preview
- exports PNG + JSON

**Piskel** (free, web-based)
- good for quick pixel art
- exports: PNG spritesheet, GIF, ZIP of frames
- no atlas JSON export

**TexturePacker** ($40)
- not for creation but for packing
- takes individual sprite images and produces optimized atlases
- exports: JSON (array/hash), XML, custom formats for every engine
- algorithm packing minimizes wasted space
- trim, rotate, polygon mesh for tighter packing
- integrations with Unity, Godot, Phaser, Cocos2d, etc.

**Blender** (free)
- several isometric rendering add-ons exist
- pre-render 3D models to isometric 2D sprites
- useful for generating character sprites at multiple angles automatically
- Pix2iso, isometric render scripts on itch.io

**Crocotile 3D** ($30)
- build 3D models using 2D tiles
- exports for game engines
- interesting for creating isometric assets from a 3D workflow

### browser-based tools

**Sprite Fusion** — tilemap editor in browser
**Piskel** — pixel art editor in browser  
**Pixelorama** — open source pixel art tool (Godot-based, has web version)
**Tiamat** — web 2.0 tile mapper
**Hextml** — hexagonal map editor in browser

---

## 9. How Existing Engines Consume This Data

### Phaser 3 (JavaScript)

natively loads Tiled JSON maps:

```javascript
// load
this.load.tilemapTiledJSON('map', 'map.json');
this.load.image('tiles', 'tileset.png');

// create
const map = this.add.tilemap('map');
const tileset = map.addTilesetImage('tileset-name', 'tiles');
const layer = map.createLayer('Ground', tileset);

// isometric config
const mapData = new Phaser.Tilemaps.MapData({
  orientation: Phaser.Tilemaps.Orientation.ISOMETRIC,
  tileWidth: 64,
  tileHeight: 32
});
```

Phaser also has native Aseprite atlas support since 3.50:
```javascript
this.load.atlas('character', 'char.png', 'char.json');
this.anims.createFromAseprite('character');
```

### PixiJS

no built-in tilemap support but many community libraries. most common pattern is to parse TMX/JSON yourself and create Sprites positioned on an isometric grid.

Traviso.js is a dedicated isometric engine built on top of PixiJS.

### Unity

native isometric tilemap support:
- Isometric Tilemap and Isometric Z as Y Tilemap types
- imports Tiled maps via plugins or built-in TMX support
- PPU (Pixels Per Unit) setting controls tile scaling
- transparency sort axis setting for depth sorting
- TilemapCollider2D for collision from tile shapes

### Godot

native TileMap node supports isometric:
- tiled plugin available for importing TMX
- TileSet resources with physics layers, navigation, custom data
- y-sort for depth ordering

---

## 10. Architecture for Your Browser-Based Tool

based on all this research, here's how i'd think about the component architecture for a tool that could eat Tiled's lunch:

### core data model

```
Project
├── TilesetLibrary
│   ├── Tileset[] (each tileset = image + grid config + per-tile metadata)
│   │   ├── source: image URL or embedded data
│   │   ├── tileWidth, tileHeight
│   │   ├── columns, rows (or collection of individual images)
│   │   ├── tiles[]
│   │   │   ├── id
│   │   │   ├── properties: {walkable, type, ...}
│   │   │   ├── collisionShapes: Polygon[]
│   │   │   ├── animation: {frames: [{tileId, duration}]}
│   │   │   └── anchor: {x, y} (normalized 0-1)
│   │   └── wangSets[] (for auto-tiling)
│   └── SpritesheetAtlas[] (character/object animation atlases)
│       ├── source: image URL
│       ├── frames: {name → {x, y, w, h, anchor, trimRect}}
│       └── animations: {name → {frames[], direction, loop}}
│
├── Map
│   ├── orientation: 'isometric' | 'staggered' | 'orthogonal' | 'hex'
│   ├── gridSize: {width, height} (in tiles)
│   ├── tileSize: {width, height} (in pixels)
│   ├── layers[]
│   │   ├── TileLayer: {data: Uint32Array, width, height}
│   │   ├── ObjectLayer: {objects: MapObject[]}
│   │   │   └── MapObject: {id, type, gid?, x, y, width, height, rotation, properties}
│   │   ├── ImageLayer: {source, offset, opacity}
│   │   └── GroupLayer: {layers[]}  (nesting)
│   └── properties: Map<string, any>
│
└── SpriteDefinitions  (for game runtime)
    ├── CharacterDef: {atlas, animations, footprint, collisionShape}
    └── ObjectDef: {atlas?, tileId?, footprint: {w, h}, anchor, properties}
```

### rendering engine layer

build on PixiJS or raw WebGL/Canvas2D. the rendering pipeline:

1. **camera system** — pan, zoom, screen-to-world conversion
2. **tile renderer** — iterates visible tiles, draws from atlas textures
3. **depth sorter** — assigns z-order to all visible entities
4. **object renderer** — draws objects, characters at sorted depth
5. **overlay renderer** — grid lines, selection highlights, editor UI
6. **animation ticker** — advances all animated tiles and sprites

### import pipeline (the killer feature)

for importing "any asset from anywhere":

```
Import Wizard
├── detect format:
│   ├── .tmx/.tmj → Tiled map parser
│   ├── .tsx/.tsj → Tiled tileset parser
│   ├── .ase/.aseprite → Aseprite parser (binary format is documented)
│   ├── .json with "frames" → TexturePacker/Aseprite atlas
│   ├── .json with "layers" → LDtk/custom map format
│   └── .png/.webp → image analysis
│
├── if raw image with no metadata:
│   ├── auto-detect grid: analyze image for repeating tile boundaries
│   ├── let user specify: tile width, tile height, columns, margin, spacing
│   ├── preview: show detected tiles overlaid on image
│   └── assign: user can tag tiles (ground, wall, object, etc.)
│
├── normalize to internal format:
│   ├── generate atlas texture(s)
│   ├── build tile/frame metadata
│   └── compute anchor points (default: bottom-center for iso)
│
└── size reconciliation:
    ├── assets at different tile sizes need scaling
    ├── option: resample to match project tile size
    ├── option: keep original and scale at render time
    └── always preserve original for quality
```

### export pipeline

output formats to support:

1. **native format** (your own JSON) — for save/load in the editor and game runtime
2. **TMX/JSON** (Tiled compatible) — for interop with everything
3. **PNG + JSON atlas** — for any custom engine
4. **embedded game runtime** — JS module that includes map data + renderer
5. **Godot .tscn** — direct scene export
6. **Unity-ready package** — tilemap + assets

### the "embeddable" architecture

the secret to making this work as both an editor AND a game runtime is to separate concerns:

```
@isometric/core          — data model, coordinate math, format parsers
@isometric/renderer      — PixiJS/Canvas rendering, camera, depth sort
@isometric/editor        — tool panels, selection, brush modes, undo/redo
@isometric/runtime       — game loop, input, pathfinding, sprite controller
@isometric/formats       — TMX parser, Aseprite parser, atlas importers

editor app = core + renderer + editor + formats
game embed = core + renderer + runtime
map viewer = core + renderer
```

the renderer component is shared. the editor adds tool UI on top. the runtime adds game logic on top. same underlying engine both ways.

### electron app strategy

use the web version as the core, wrap in electron for:
- file system access (watch folders for asset changes, like LDtk does)
- native menu bar
- window management
- auto-save / crash recovery
- could also call Aseprite CLI for batch operations

---

## 11. Key Technical Challenges & Solutions

### challenge: assets at different tile sizes

when importing a 32x16 tileset into a 64x32 project:
- scale factor = target / source = 2x
- use nearest-neighbor scaling for pixel art (no blurring)
- for non-pixel-art, use bilinear
- store original resolution and scale factor, render at target size
- allow per-tileset scale override

### challenge: objects taller than one tile

the image extends above the tile diamond. the anchor point determines where the "base" of the object sits on the grid. everything above the anchor is the visual height that participates in depth sorting but not in grid placement.

for a tree: anchor at bottom-center means the trunk base aligns to the tile. the canopy extends above and may visually overlap tiles behind it. depth sort handles this if the sort value is based on the base position.

### challenge: auto-tiling

wang tiles / terrain sets automatically pick the right tile based on neighbors. for isometric, you need corner-type wang sets (each tile connects at corners, not edges). tiled's wang set format supports this.

implementing auto-tiling:
1. when a tile is placed, check all 8 neighbors
2. build a bitmask from which neighbors match the same terrain type
3. look up the correct tile variant from the wang set using the bitmask
4. update the tile and all affected neighbors

### challenge: pathfinding on isometric grids

A* works the same on isometric grids as orthogonal — the grid is still a grid internally. just use the grid coordinates, not screen coordinates. diagonal movement cost should be √2 (or 1.4) compared to cardinal cost of 1.

### challenge: multi-floor / elevation

each floor is essentially a separate tile layer with a Y offset for rendering. the data model is just layer stacking. depth sort needs to account for floor level as described in section 7.

### challenge: browser-based sprite creation

for a built-in pixel art editor:
- canvas-based drawing tools
- isometric grid overlay (2:1 guide lines)
- layer system
- color palette management
- onion skinning for animation
- export to the internal atlas format
- this is essentially building a simpler Aseprite in the browser
- Piskel and Pixelorama are open source references to study

---

## 12. Asset Sources & What You'll Encounter

common places people get isometric assets:

| source | typical format | sizes | notes |
|--------|---------------|-------|-------|
| itch.io | PNG spritesheets, sometimes with JSON | 32x16, 64x32, 128x64 | huge variety, inconsistent conventions |
| OpenGameArt | PNG, SVG | varies wildly | CC-licensed, quality varies |
| GraphicRiver | PNG, PSD | usually high-res | commercial, consistent quality |
| Unity Asset Store | .unitypackage | various | unity-specific packaging |
| Kenney.nl | PNG | standardized per pack | high quality, public domain |
| GameDev Market | PNG, Aseprite | various | commercial |
| CraftPix | PNG, PSD | various | commercial |

the biggest pain point in the wild: every asset pack uses different tile sizes, different anchor conventions, different spritesheet layouts. an import system that can handle all of them with minimal manual configuration would be genuinely novel.

---

## 13. Summary of What Makes a Tiled-Killer

tiled's weaknesses that you could exploit:

1. **no web version** — it's a Qt desktop app only
2. **dated UI** — looks like 2010
3. **no built-in game preview** — you can't playtest in the editor
4. **no asset store/browser** — can't discover and import assets
5. **no collaboration** — single-user only
6. **limited animation preview** — can see animated tiles but not character animations in context
7. **no built-in sprite editor** — need separate tools
8. **isometric depth sorting is left to the user** — the editor doesn't preview proper depth
9. **no embeddable runtime** — you export and pray your engine handles it
10. **plugin system requires C++ or scripting** — not accessible

a browser-based tool that handles proper isometric depth preview, has smart asset import from any source, includes a basic sprite editor, can embed maps directly in games as components, AND exports to standard formats would genuinely have no competition.
