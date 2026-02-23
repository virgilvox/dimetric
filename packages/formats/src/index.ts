// @dimetric/formats - TMX/Aseprite/TexturePacker parsers and serializers

// Native format
export { serializeProject, serializeProjectToJson } from './native/serialize';
export { deserializeProject, deserializeProjectFromJson } from './native/deserialize';
export { SCHEMA_VERSION, FORMAT_MAGIC } from './native/schema';
export type { SerializedProject, SerializedMap, SerializedLayer, SerializedTileset } from './native/schema';

// Tiled GID utilities
export { resolveGid, remapTileData } from './tmx/gid-utils';

// Tiled tile data compression
export { decodeTileData, encodeTileData } from './tmx/compression';

// Tiled JSON parsers
export { parseTmj } from './tmx/tmj-parser';
export type { TmjParseOptions } from './tmx/tmj-parser';
export { parseTsjTileset } from './tmx/tsj-parser';

// Tiled XML parsers
export { parseTmx } from './tmx/tmx-parser';
export type { TmxParseOptions } from './tmx/tmx-parser';
export { parseTsxTileset } from './tmx/tsx-parser';

// Tiled JSON writer
export { writeTmj, writeTmjString } from './tmx/tmj-writer';

// Tiled XML writer
export { writeTmx } from './tmx/tmx-writer';

// Aseprite JSON parser
export { parseAseJson } from './aseprite/ase-json-parser';
export type { AseFrame, AseFrameTag, AseSlice, AseSliceKey, AseJsonResult } from './aseprite/ase-json-parser';

// TexturePacker JSON parser
export { parseTexturePackerJson } from './atlas/texturepacker-parser';
export type { TpFrame, TpAtlasResult } from './atlas/texturepacker-parser';
