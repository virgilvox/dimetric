[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / DmRenderer

# Class: DmRenderer

Defined in: [renderer/src/engine/renderer.ts:37](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L37)

Main renderer that owns the PixiJS Application, viewport, grid overlay,
tile/object/image layer renderers, selection overlays, and animation ticker.

## Example

```ts
const renderer = new DmRenderer();
await renderer.init({ container: document.getElementById('canvas')! });
renderer.setMap(myMap);
```

## Constructors

### Constructor

> **new DmRenderer**(): `DmRenderer`

Defined in: [renderer/src/engine/renderer.ts:54](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L54)

#### Returns

`DmRenderer`

## Properties

### animationTicker

> `readonly` **animationTicker**: [`AnimationTicker`](AnimationTicker.md)

Defined in: [renderer/src/engine/renderer.ts:44](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L44)

***

### camera

> `readonly` **camera**: [`DmCamera`](DmCamera.md)

Defined in: [renderer/src/engine/renderer.ts:40](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L40)

***

### cursor

> `readonly` **cursor**: [`CursorRenderer`](CursorRenderer.md)

Defined in: [renderer/src/engine/renderer.ts:43](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L43)

***

### gridOverlay

> `readonly` **gridOverlay**: [`GridOverlayRenderer`](GridOverlayRenderer.md)

Defined in: [renderer/src/engine/renderer.ts:41](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L41)

***

### highlight

> `readonly` **highlight**: [`HighlightRenderer`](HighlightRenderer.md)

Defined in: [renderer/src/engine/renderer.ts:42](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L42)

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [renderer/src/engine/renderer.ts:284](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L284)

Destroy the renderer and clean up all resources.
Disconnects the resize observer, removes the ticker callback, destroys all
layer renderers, overlays, viewport, and the PixiJS application, then
removes the canvas from the DOM.

#### Returns

`void`

***

### getApp()

> **getApp**(): `Application`

Defined in: [renderer/src/engine/renderer.ts:126](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L126)

Get the underlying PixiJS Application instance for advanced usage.

#### Returns

`Application`

The PixiJS Application.

***

### getTileLayerRenderer()

> **getTileLayerRenderer**(`layerId`): [`TileLayerRenderer`](TileLayerRenderer.md) \| `undefined`

Defined in: [renderer/src/engine/renderer.ts:244](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L244)

Get the tile layer renderer for a specific layer by ID.

#### Parameters

##### layerId

`string`

The unique layer identifier.

#### Returns

[`TileLayerRenderer`](TileLayerRenderer.md) \| `undefined`

The [TileLayerRenderer](TileLayerRenderer.md) if the layer exists and is a tile layer, otherwise `undefined`.

***

### getViewport()

> **getViewport**(): [`DmViewport`](DmViewport.md)

Defined in: [renderer/src/engine/renderer.ts:135](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L135)

Get the viewport adapter that wraps pixi-viewport.

#### Returns

[`DmViewport`](DmViewport.md)

The [DmViewport](DmViewport.md) instance used for pan/zoom.

***

### init()

> **init**(`options`): `Promise`\<`void`\>

Defined in: [renderer/src/engine/renderer.ts:68](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L68)

Initialize the PixiJS application, create the viewport, and mount the canvas to the DOM.
Sets up resize observation, grid overlay, selection overlays, and the animation ticker.

#### Parameters

##### options

[`DmRendererOptions`](../interfaces/DmRendererOptions.md)

Renderer initialization options including the target container element.

#### Returns

`Promise`\<`void`\>

***

### rebuildLayers()

> **rebuildLayers**(`map`): `void`

Defined in: [renderer/src/engine/renderer.ts:188](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L188)

Rebuild all layer renderers from the map data.
Destroys existing renderers and recursively creates new ones for group layers.

#### Parameters

##### map

`DmMap`

The map whose layers should be rebuilt.

#### Returns

`void`

***

### setGridVisible()

> **setGridVisible**(`visible`): `void`

Defined in: [renderer/src/engine/renderer.ts:274](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L274)

Toggle grid overlay visibility.

#### Parameters

##### visible

`boolean`

Whether the isometric grid overlay should be shown.

#### Returns

`void`

***

### setLayerOpacity()

> **setLayerOpacity**(`layerId`, `opacity`): `void`

Defined in: [renderer/src/engine/renderer.ts:265](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L265)

Update a single layer's opacity.

#### Parameters

##### layerId

`string`

The unique layer identifier.

##### opacity

`number`

Opacity value from 0 (fully transparent) to 1 (fully opaque).

#### Returns

`void`

***

### setLayerVisible()

> **setLayerVisible**(`layerId`, `visible`): `void`

Defined in: [renderer/src/engine/renderer.ts:255](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L255)

Update a single layer's visibility.

#### Parameters

##### layerId

`string`

The unique layer identifier.

##### visible

`boolean`

Whether the layer should be visible.

#### Returns

`void`

***

### setMap()

> **setMap**(`map`): `void`

Defined in: [renderer/src/engine/renderer.ts:145](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L145)

Set the current map, redraw the grid overlay, rebuild all layer renderers,
and center the camera on the map.

#### Parameters

##### map

`DmMap`

The map data to render.

#### Returns

`void`

***

### setTileTextures()

> **setTileTextures**(`textures`): `void`

Defined in: [renderer/src/engine/renderer.ts:175](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/renderer.ts#L175)

Set the combined tile texture map and rebuild layers if a map is loaded.

#### Parameters

##### textures

`Map`\<`number`, `Texture`\<`TextureSource`\<`any`\>\>\>

Map from global tile ID (GID) to PixiJS Texture.

#### Returns

`void`
