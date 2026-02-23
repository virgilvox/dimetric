[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / ObjectLayerRenderer

# Class: ObjectLayerRenderer

Defined in: renderer/src/layers/object-layer-renderer.ts:15

Renders a DmObjectLayer. GID-based objects are drawn as sprites;
non-GID objects are drawn as wireframe bounding boxes in editor mode.

## Example

```ts
const renderer = new ObjectLayerRenderer();
renderer.rebuild(objectLayer, tileTextures, true);
parentContainer.addChild(renderer.container);
```

## Constructors

### Constructor

> **new ObjectLayerRenderer**(): `ObjectLayerRenderer`

Defined in: renderer/src/layers/object-layer-renderer.ts:20

#### Returns

`ObjectLayerRenderer`

## Properties

### container

> `readonly` **container**: `Container`

Defined in: renderer/src/layers/object-layer-renderer.ts:17

The PixiJS container holding all rendered objects for this layer.

## Methods

### destroy()

> **destroy**(): `void`

Defined in: renderer/src/layers/object-layer-renderer.ts:101

Destroy all rendered objects and the container, releasing GPU resources.

#### Returns

`void`

***

### rebuild()

> **rebuild**(`layer`, `tileTextures`, `editorMode?`): `void`

Defined in: renderer/src/layers/object-layer-renderer.ts:30

Rebuild the layer from object data.

#### Parameters

##### layer

`DmObjectLayer`

The object layer to render.

##### tileTextures

`Map`\<`number`, `Texture`\<`TextureSource`\<`any`\>\>\>

GID-to-texture map.

##### editorMode?

`boolean` = `true`

If true, draw wireframe boxes for non-GID objects.

#### Returns

`void`

***

### setOpacity()

> **setOpacity**(`opacity`): `void`

Defined in: renderer/src/layers/object-layer-renderer.ts:88

Set the opacity of this object layer.

#### Parameters

##### opacity

`number`

Opacity value from 0 (fully transparent) to 1 (fully opaque).

#### Returns

`void`

***

### setVisible()

> **setVisible**(`visible`): `void`

Defined in: renderer/src/layers/object-layer-renderer.ts:79

Set the visibility of this object layer.

#### Parameters

##### visible

`boolean`

Whether the layer should be visible.

#### Returns

`void`
