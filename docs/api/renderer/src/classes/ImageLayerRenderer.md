[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / ImageLayerRenderer

# Class: ImageLayerRenderer

Defined in: renderer/src/layers/image-layer-renderer.ts:15

Renders a DmImageLayer as a single positioned sprite.
The image texture must be pre-loaded and passed into [rebuild](#rebuild).

## Example

```ts
const renderer = new ImageLayerRenderer();
renderer.rebuild(imageLayer, loadedTexture);
parentContainer.addChild(renderer.container);
```

## Constructors

### Constructor

> **new ImageLayerRenderer**(): `ImageLayerRenderer`

Defined in: renderer/src/layers/image-layer-renderer.ts:20

#### Returns

`ImageLayerRenderer`

## Properties

### container

> `readonly` **container**: `Container`

Defined in: renderer/src/layers/image-layer-renderer.ts:17

The PixiJS container holding the image sprite.

## Methods

### destroy()

> **destroy**(): `void`

Defined in: renderer/src/layers/image-layer-renderer.ts:70

Destroy the image sprite and the container, releasing GPU resources.

#### Returns

`void`

***

### rebuild()

> **rebuild**(`layer`, `texture`): `void`

Defined in: renderer/src/layers/image-layer-renderer.ts:29

Rebuild the layer with the given image.

#### Parameters

##### layer

`DmImageLayer`

The image layer data.

##### texture

Pre-loaded texture for the image, or null to skip rendering.

`Texture`\<`TextureSource`\<`any`\>\> | `null`

#### Returns

`void`

***

### setOpacity()

> **setOpacity**(`opacity`): `void`

Defined in: renderer/src/layers/image-layer-renderer.ts:57

Set the opacity of this image layer.

#### Parameters

##### opacity

`number`

Opacity value from 0 (fully transparent) to 1 (fully opaque).

#### Returns

`void`

***

### setVisible()

> **setVisible**(`visible`): `void`

Defined in: renderer/src/layers/image-layer-renderer.ts:48

Set the visibility of this image layer.

#### Parameters

##### visible

`boolean`

Whether the layer should be visible.

#### Returns

`void`
