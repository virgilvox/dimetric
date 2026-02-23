[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / HighlightRenderer

# Class: HighlightRenderer

Defined in: [renderer/src/selection/highlight-renderer.ts:15](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/highlight-renderer.ts#L15)

Renders a translucent diamond highlight overlay on a hovered tile cell.
Used in the editor to indicate which tile the cursor is over.

## Example

```ts
const highlight = new HighlightRenderer();
highlight.setTileSize(64, 32);
highlight.show(3, 5);
```

## Constructors

### Constructor

> **new HighlightRenderer**(): `HighlightRenderer`

Defined in: [renderer/src/selection/highlight-renderer.ts:22](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/highlight-renderer.ts#L22)

#### Returns

`HighlightRenderer`

## Properties

### container

> `readonly` **container**: `Container`

Defined in: [renderer/src/selection/highlight-renderer.ts:17](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/highlight-renderer.ts#L17)

The PixiJS container holding the highlight graphics.

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [renderer/src/selection/highlight-renderer.ts:68](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/highlight-renderer.ts#L68)

Destroy the graphics and container, releasing GPU resources.

#### Returns

`void`

***

### hide()

> **hide**(): `void`

Defined in: [renderer/src/selection/highlight-renderer.ts:62](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/highlight-renderer.ts#L62)

Hide the highlight overlay and clear the graphics.

#### Returns

`void`

***

### setTileSize()

> **setTileSize**(`tileWidth`, `tileHeight`): `void`

Defined in: [renderer/src/selection/highlight-renderer.ts:34](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/highlight-renderer.ts#L34)

Set the tile dimensions used for computing the diamond shape.

#### Parameters

##### tileWidth

`number`

Width of a single tile in pixels.

##### tileHeight

`number`

Height of a single tile in pixels.

#### Returns

`void`

***

### show()

> **show**(`col`, `row`): `void`

Defined in: [renderer/src/selection/highlight-renderer.ts:45](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/highlight-renderer.ts#L45)

Show a diamond highlight on the given grid cell.

#### Parameters

##### col

`number`

Grid column index.

##### row

`number`

Grid row index.

#### Returns

`void`
