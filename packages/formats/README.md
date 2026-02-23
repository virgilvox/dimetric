# @dimetric/formats

Format parsers and writers for the Dimetric tile map engine. Supports native Dimetric JSON, Tiled (TMJ/TSJ/TMX/TSX), Aseprite JSON, and TexturePacker JSON.

## Installation

```bash
npm install @dimetric/formats @dimetric/core
```

`@dimetric/core` is a required peer dependency.

## Supported Formats

| Format | Parse | Write | Description |
|--------|-------|-------|-------------|
| Native JSON | Yes | Yes | Dimetric's own project format |
| Tiled TMJ | Yes | Yes | Tiled JSON map format |
| Tiled TSJ | Yes | -- | Tiled JSON tileset format |
| Tiled TMX | Yes | Yes | Tiled XML map format |
| Tiled TSX | Yes | -- | Tiled XML tileset format |
| Aseprite JSON | Yes | -- | Aseprite sprite atlas export |
| TexturePacker JSON | Yes | -- | TexturePacker atlas export |

## Native Format

Serialize and deserialize Dimetric projects. The native format uses a `_format: "dimetric-project"` marker and `_version` field.

```typescript
import { serializeProject, serializeProjectToJson, deserializeProject, deserializeProjectFromJson } from '@dimetric/formats';

// Serialize a project to a JSON-compatible object
const data = serializeProject(project);

// Serialize directly to a JSON string
const json = serializeProjectToJson(project);

// Deserialize from a parsed object
const project = deserializeProject(data);

// Deserialize from a JSON string
const project = deserializeProjectFromJson(json);
```

## Tiled JSON (TMJ/TSJ)

Parse Tiled JSON maps and tilesets into the Dimetric data model.

### Parsing

```typescript
import { parseTmj, parseTsjTileset } from '@dimetric/formats';
import type { DmMap } from '@dimetric/core';

// Parse a TMJ map (embedded tilesets)
const tmjData = JSON.parse(tmjString);
const map: DmMap = await parseTmj(tmjData);

// Parse with external tileset resolution
const map = await parseTmj(tmjData, {
  resolveTileset: async (source: string) => {
    const response = await fetch(source);
    return response.json();
  },
});

// Parse a standalone TSJ tileset
const tsjData = JSON.parse(tsjString);
const tileset = parseTsjTileset(tsjData);
```

### Writing

```typescript
import { writeTmj, writeTmjString } from '@dimetric/formats';

// Convert a DmMap to a Tiled JSON object
const tmjObject = writeTmj(map);

// Convert directly to a JSON string
const tmjString = writeTmjString(map);
```

## Tiled XML (TMX/TSX)

Parse and write Tiled XML maps. XML parsing uses `fast-xml-parser` internally.

### Parsing

```typescript
import { parseTmx, parseTsxTileset } from '@dimetric/formats';

// Parse a TMX map from XML string
const map = await parseTmx(xmlString);

// Parse with external resource resolution (tilesets, images)
const map = await parseTmx(xmlString, {
  resolveExternal: async (source: string) => {
    const response = await fetch(source);
    return response.text();
  },
});

// Parse a standalone TSX tileset
const tileset = parseTsxTileset(tsxXmlString);
```

### Writing

```typescript
import { writeTmx } from '@dimetric/formats';

// Convert a DmMap to a TMX XML string
const xmlString = writeTmx(map);
```

## Tile Data Utilities

Low-level utilities for working with Tiled's tile data encoding and GID resolution.

```typescript
import { decodeTileData, encodeTileData, resolveGid, remapTileData } from '@dimetric/formats';

// Decode base64/compressed tile data from Tiled files
const tileData: Uint32Array = decodeTileData(base64String, 'base64', 'zlib', expectedLength);

// Encode tile data back to base64/compressed format
const encoded: string = encodeTileData(tileData, 'base64', 'zlib');

// Resolve a GID to its tileset and local tile ID
const { tileset, localId } = resolveGid(gid, tilesetRefs);

// Remap tile data when changing first GIDs
const remapped = remapTileData(tileData, oldRefs, newRefs);
```

## Aseprite JSON

Parse Aseprite's JSON export format (both array and hash frame layouts).

```typescript
import { parseAseJson } from '@dimetric/formats';
import type { AseJsonResult, AseFrame, AseFrameTag, AseSlice } from '@dimetric/formats';

const aseData = JSON.parse(aseJsonString);
const result: AseJsonResult = parseAseJson(aseData);

result.image;       // atlas image filename
result.size;        // { w, h } atlas dimensions
result.frames;      // AseFrame[] - source rects, durations, trim info
result.frameTags;   // AseFrameTag[] - named animation ranges (e.g., "walk", "idle")
result.slices;      // AseSlice[] - hitboxes, anchors, per-frame bounds
```

## TexturePacker JSON

Parse TexturePacker's JSON atlas format (both array and hash layouts).

```typescript
import { parseTexturePackerJson } from '@dimetric/formats';
import type { TpAtlasResult, TpFrame } from '@dimetric/formats';

const tpData = JSON.parse(tpJsonString);
const atlas: TpAtlasResult = parseTexturePackerJson(tpData);

atlas.image;    // atlas image filename
atlas.size;     // { w, h } atlas dimensions
atlas.scale;    // scale factor
atlas.frames;   // TpFrame[] - source rects, trim info, pivot points
```

## License

MIT
