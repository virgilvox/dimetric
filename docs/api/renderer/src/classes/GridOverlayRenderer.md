[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / GridOverlayRenderer

# Class: GridOverlayRenderer

Defined in: [renderer/src/layers/grid-overlay-renderer.ts:35](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/grid-overlay-renderer.ts#L35)

Renders a wireframe isometric diamond grid overlay.
Draws row lines (top-left to bottom-right) and column lines (top-right to bottom-left).

## Example

```ts
const grid = new GridOverlayRenderer();
grid.draw({ cols: 10, rows: 10, tileWidth: 64, tileHeight: 32 });
viewport.addChild(grid.container);
```

## Constructors

### Constructor

> **new GridOverlayRenderer**(): `GridOverlayRenderer`

Defined in: [renderer/src/layers/grid-overlay-renderer.ts:40](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/grid-overlay-renderer.ts#L40)

#### Returns

`GridOverlayRenderer`

## Properties

### container

> `readonly` **container**: `Container`

Defined in: [renderer/src/layers/grid-overlay-renderer.ts:37](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/grid-overlay-renderer.ts#L37)

The PixiJS container holding the grid graphics.

## Methods

### destroy()

> **destroy**(): `void`

Defined in: [renderer/src/layers/grid-overlay-renderer.ts:76](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/grid-overlay-renderer.ts#L76)

Destroy the graphics and container, releasing GPU resources.

#### Returns

`void`

***

### draw()

> **draw**(`options`): `void`

Defined in: [renderer/src/layers/grid-overlay-renderer.ts:51](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/layers/grid-overlay-renderer.ts#L51)

Draw or redraw the isometric grid with the given dimensions and style.

#### Parameters

##### options

[`GridOverlayOptions`](../interfaces/GridOverlayOptions.md)

Grid dimensions and optional line styling.

#### Returns

`void`
