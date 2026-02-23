[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / TileLayerRenderer

# Class: TileLayerRenderer

Defined in: [renderer/src/layers/tile-layer-renderer.ts:15](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/tile-layer-renderer.ts#L15)

Renders a single DmTileLayer as PixiJS sprites.
Creates one sprite per non-empty tile and applies Tiled-compatible flip flags.

## Example

```ts
const renderer = new TileLayerRenderer();
renderer.rebuild(layer, 64, 32, tileTextures);
parentContainer.addChild(renderer.container);
```

## Constructors

### Constructor

> **new TileLayerRenderer**(): `TileLayerRenderer`

Defined in: [renderer/src/layers/tile-layer-renderer.ts:22](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/tile-layer-renderer.ts#L22)

#### Returns

`TileLayerRenderer`

## Properties

### container

> `readonly` **container**: `Container`

Defined in: [renderer/src/layers/tile-layer-renderer.ts:17](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/tile-layer-renderer.ts#L17)

The PixiJS container holding all tile sprites for this layer.

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [renderer/src/layers/tile-layer-renderer.ts:131](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/tile-layer-renderer.ts#L131)

Destroy all sprites and the container, releasing GPU resources.

#### Returns

`void`

***

### rebuild()

> **rebuild**(`layer`, `tileWidth`, `tileHeight`, `tileTextures`): `void`

Defined in: [renderer/src/layers/tile-layer-renderer.ts:35](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/tile-layer-renderer.ts#L35)

Full rebuild: clear and recreate all tile sprites.
Called on initial load and when the entire layer changes.

#### Parameters

##### layer

`DmTileLayer`

The tile layer data model containing the GID grid.

##### tileWidth

`number`

Width of a single tile in pixels.

##### tileHeight

`number`

Height of a single tile in pixels.

##### tileTextures

`Map`\<`number`, `Texture`\<`TextureSource`\<`any`\>\>\>

Map from global tile ID (GID) to PixiJS Texture.

#### Returns

`void`

***

### setOpacity()

> **setOpacity**(`opacity`): `void`

Defined in: [renderer/src/layers/tile-layer-renderer.ts:118](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/tile-layer-renderer.ts#L118)

Set the opacity of this tile layer.

#### Parameters

##### opacity

`number`

Opacity value from 0 (fully transparent) to 1 (fully opaque).

#### Returns

`void`

***

### setVisible()

> **setVisible**(`visible`): `void`

Defined in: [renderer/src/layers/tile-layer-renderer.ts:109](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/tile-layer-renderer.ts#L109)

Set the visibility of this tile layer.

#### Parameters

##### visible

`boolean`

Whether the layer should be visible.

#### Returns

`void`

***

### updateTile()

> **updateTile**(`_col`, `_row`, `_gid`, `layer`, `tileTextures`): `void`

Defined in: [renderer/src/layers/tile-layer-renderer.ts:93](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/tile-layer-renderer.ts#L93)

Update a single tile at the given grid position.
Currently performs a full rebuild; will be optimized with sprite pooling later.

#### Parameters

##### \_col

`number`

Column index of the tile to update.

##### \_row

`number`

Row index of the tile to update.

##### \_gid

`number`

The new global tile ID for the cell.

##### layer

`DmTileLayer`

The full tile layer data (used for rebuild).

##### tileTextures

`Map`\<`number`, `Texture`\<`TextureSource`\<`any`\>\>\>

Map from global tile ID (GID) to PixiJS Texture.

#### Returns

`void`
