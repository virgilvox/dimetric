[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / LayerRenderer

# Interface: LayerRenderer

Defined in: [renderer/src/layers/layer-renderer.ts:8](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/layer-renderer.ts#L8)

Common interface for all layer renderers.
Each layer type (tile, object, image) provides its own implementation.

## Properties

### container

> `readonly` **container**: `Container`

Defined in: [renderer/src/layers/layer-renderer.ts:10](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/layer-renderer.ts#L10)

The PixiJS container that holds all visual elements for this layer.

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [renderer/src/layers/layer-renderer.ts:20](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/layer-renderer.ts#L20)

Destroy the renderer and release all GPU resources.

#### Returns

`void`

***

### update()

> **update**(`layer`): `void`

Defined in: [renderer/src/layers/layer-renderer.ts:17](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/layer-renderer.ts#L17)

Update the rendered layer to reflect changes in the data model.

#### Parameters

##### layer

`DmLayer`

The layer data to render.

#### Returns

`void`
