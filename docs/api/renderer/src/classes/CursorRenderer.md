[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / CursorRenderer

# Class: CursorRenderer

Defined in: [renderer/src/selection/cursor-renderer.ts:16](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/cursor-renderer.ts#L16)

Renders a semi-transparent ghost tile sprite at the cursor position.
Shows a preview of the tile that will be placed when the user clicks.

## Example

```ts
const cursor = new CursorRenderer();
cursor.setTileSize(64, 32);
cursor.setTexture(tileTexture);
cursor.moveTo(3, 5);
```

## Constructors

### Constructor

> **new CursorRenderer**(): `CursorRenderer`

Defined in: [renderer/src/selection/cursor-renderer.ts:23](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/cursor-renderer.ts#L23)

#### Returns

`CursorRenderer`

## Properties

### container

> `readonly` **container**: `Container`

Defined in: [renderer/src/selection/cursor-renderer.ts:18](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/cursor-renderer.ts#L18)

The PixiJS container holding the cursor sprite.

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [renderer/src/selection/cursor-renderer.ts:81](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/cursor-renderer.ts#L81)

Destroy the cursor sprite and container, releasing GPU resources.

#### Returns

`void`

***

### hide()

> **hide**(): `void`

Defined in: [renderer/src/selection/cursor-renderer.ts:76](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/cursor-renderer.ts#L76)

Hide the cursor ghost sprite.

#### Returns

`void`

***

### moveTo()

> **moveTo**(`col`, `row`): `void`

Defined in: [renderer/src/selection/cursor-renderer.ts:67](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/cursor-renderer.ts#L67)

Move the cursor ghost sprite to the given grid cell.

#### Parameters

##### col

`number`

Grid column index.

##### row

`number`

Grid row index.

#### Returns

`void`

***

### setTexture()

> **setTexture**(`texture`): `void`

Defined in: [renderer/src/selection/cursor-renderer.ts:44](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/cursor-renderer.ts#L44)

Set the texture shown at the cursor position. Pass `null` to hide the cursor sprite.

#### Parameters

##### texture

The tile texture to display, or `null` to hide.

`Texture`\<`TextureSource`\<`any`\>\> | `null`

#### Returns

`void`

***

### setTileSize()

> **setTileSize**(`tileWidth`, `tileHeight`): `void`

Defined in: [renderer/src/selection/cursor-renderer.ts:34](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/selection/cursor-renderer.ts#L34)

Set the tile dimensions used for positioning the cursor sprite.

#### Parameters

##### tileWidth

`number`

Width of a single tile in pixels.

##### tileHeight

`number`

Height of a single tile in pixels.

#### Returns

`void`
