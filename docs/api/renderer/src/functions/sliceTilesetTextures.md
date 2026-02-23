[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / sliceTilesetTextures

# Function: sliceTilesetTextures()

> **sliceTilesetTextures**(`baseTexture`, `tileset`, `firstGid`): `Map`\<`number`, `Texture`\<`TextureSource`\<`any`\>\>\>

Defined in: [renderer/src/sprites/atlas-loader.ts:19](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/sprites/atlas-loader.ts#L19)

Slice a tileset's base texture into individual tile textures.
Respects tileset spacing and margin when computing frame rectangles.

## Parameters

### baseTexture

`Texture`

The full tileset image as a PixiJS Texture.

### tileset

`DmTileset`

The tileset metadata containing tile size, columns, count, spacing, and margin.

### firstGid

`number`

The first global tile ID assigned to this tileset.

## Returns

`Map`\<`number`, `Texture`\<`TextureSource`\<`any`\>\>\>

A Map from global tile ID (GID) to individual tile Texture.

## Example

```ts
const textures = sliceTilesetTextures(baseTexture, tileset, 1);
const tile5 = textures.get(5);
```
