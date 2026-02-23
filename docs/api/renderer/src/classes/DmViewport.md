[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / DmViewport

# Class: DmViewport

Defined in: [renderer/src/engine/viewport.ts:27](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/viewport.ts#L27)

Thin adapter around `pixi-viewport` that provides camera pan/zoom functionality.
Configures drag, pinch, wheel, decelerate, and zoom clamping out of the box.

## Example

```ts
const vp = new DmViewport({ app, worldWidth: 4000, worldHeight: 4000 });
app.stage.addChild(vp.viewport);
vp.centerOn(200, 300);
```

## Constructors

### Constructor

> **new DmViewport**(`options`): `DmViewport`

Defined in: [renderer/src/engine/viewport.ts:36](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/viewport.ts#L36)

Create a new viewport adapter.

#### Parameters

##### options

[`DmViewportOptions`](../interfaces/DmViewportOptions.md)

Viewport configuration options.

#### Returns

`DmViewport`

## Properties

### viewport

> `readonly` **viewport**: `Viewport`

Defined in: [renderer/src/engine/viewport.ts:29](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/viewport.ts#L29)

The underlying pixi-viewport instance.

## Accessors

### scale

#### Get Signature

> **get** **scale**(): `number`

Defined in: [renderer/src/engine/viewport.ts:69](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/viewport.ts#L69)

Get the current zoom scale factor.

##### Returns

`number`

The viewport's x-axis scale value.

## Methods

### centerOn()

> **centerOn**(`wx`, `wy`): `void`

Defined in: [renderer/src/engine/viewport.ts:88](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/viewport.ts#L88)

Pan the viewport to center on the given world coordinates.

#### Parameters

##### wx

`number`

World x-coordinate to center on.

##### wy

`number`

World y-coordinate to center on.

#### Returns

`void`

***

### destroy()

> **destroy**(): `void`

Defined in: [renderer/src/engine/viewport.ts:105](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/viewport.ts#L105)

Destroy the viewport and release all associated resources.

#### Returns

`void`

***

### resize()

> **resize**(`screenWidth`, `screenHeight`): `void`

Defined in: [renderer/src/engine/viewport.ts:60](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/viewport.ts#L60)

Resize the viewport to match new screen dimensions.

#### Parameters

##### screenWidth

`number`

New screen width in pixels.

##### screenHeight

`number`

New screen height in pixels.

#### Returns

`void`

***

### screenToWorld()

> **screenToWorld**(`sx`, `sy`): `object`

Defined in: [renderer/src/engine/viewport.ts:99](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/viewport.ts#L99)

Convert screen pixel coordinates to world coordinates.

#### Parameters

##### sx

`number`

Screen x-coordinate in pixels.

##### sy

`number`

Screen y-coordinate in pixels.

#### Returns

`object`

An object with `wx` and `wy` world coordinates.

##### wx

> **wx**: `number`

##### wy

> **wy**: `number`

***

### setZoom()

> **setZoom**(`scale`): `void`

Defined in: [renderer/src/engine/viewport.ts:78](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/viewport.ts#L78)

Set the viewport zoom level.

#### Parameters

##### scale

`number`

The target zoom scale factor.

#### Returns

`void`
