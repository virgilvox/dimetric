[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / buildTileTextureMap

# Function: buildTileTextureMap()

> **buildTileTextureMap**(`tilesetTextures`): `Map`\<`number`, `Texture`\<`TextureSource`\<`any`\>\>\>

Defined in: [renderer/src/sprites/atlas-loader.ts:53](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/sprites/atlas-loader.ts#L53)

Build a combined GID-to-Texture map from all loaded tileset references.
Merges sliced textures from every tileset into a single lookup map.

## Parameters

### tilesetTextures

`Map`\<`string`, \{ `baseTexture`: `Texture`; `ref`: `DmTilesetRef`; \}\>

Map from tileset ID to its base texture and tileset reference.

## Returns

`Map`\<`number`, `Texture`\<`TextureSource`\<`any`\>\>\>

A unified Map from global tile ID (GID) to PixiJS Texture.

## Example

```ts
const combined = buildTileTextureMap(loadedTilesets);
renderer.setTileTextures(combined);
```
