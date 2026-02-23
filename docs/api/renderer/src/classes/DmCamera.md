[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / DmCamera

# Class: DmCamera

Defined in: [renderer/src/engine/camera.ts:29](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/camera.ts#L29)

High-level camera that delegates pan, zoom, and coordinate conversion
to the underlying [DmViewport](DmViewport.md) adapter.

## Example

```ts
const camera = new DmCamera();
camera.attach(viewport);
camera.panTo(100, 200);
camera.zoomIn();
const { wx, wy } = camera.screenToWorld(400, 300);
```

## Constructors

### Constructor

> **new DmCamera**(): `DmCamera`

#### Returns

`DmCamera`

## Methods

### attach()

> **attach**(`viewport`): `void`

Defined in: [renderer/src/engine/camera.ts:37](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/camera.ts#L37)

Attach this camera to a viewport adapter.

#### Parameters

##### viewport

[`DmViewport`](DmViewport.md)

The viewport to delegate camera operations to.

#### Returns

`void`

***

### detach()

> **detach**(): `void`

Defined in: [renderer/src/engine/camera.ts:42](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/camera.ts#L42)

Detach the camera from its current viewport.

#### Returns

`void`

***

### getState()

> **getState**(): [`CameraState`](../interfaces/CameraState.md)

Defined in: [renderer/src/engine/camera.ts:51](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/camera.ts#L51)

Get the current camera state (position and zoom).

#### Returns

[`CameraState`](../interfaces/CameraState.md)

A [CameraState](../interfaces/CameraState.md) snapshot. Returns origin with zoom 1 if no viewport is attached.

***

### panTo()

> **panTo**(`wx`, `wy`): `void`

Defined in: [renderer/src/engine/camera.ts:67](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/camera.ts#L67)

Pan the camera to center on the given world coordinates.

#### Parameters

##### wx

`number`

Target world x-coordinate.

##### wy

`number`

Target world y-coordinate.

#### Returns

`void`

***

### screenToWorld()

> **screenToWorld**(`sx`, `sy`): `object`

Defined in: [renderer/src/engine/camera.ts:107](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/camera.ts#L107)

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

An object with `wx` and `wy` world coordinates. Falls back to identity if no viewport is attached.

##### wx

> **wx**: `number`

##### wy

> **wy**: `number`

***

### setZoom()

> **setZoom**(`scale`): `void`

Defined in: [renderer/src/engine/camera.ts:76](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/camera.ts#L76)

Set the camera zoom to an absolute scale value.

#### Parameters

##### scale

`number`

The zoom scale factor (e.g., 1.0 = 100%, 2.0 = 200%).

#### Returns

`void`

***

### zoomIn()

> **zoomIn**(`factor?`): `void`

Defined in: [renderer/src/engine/camera.ts:85](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/camera.ts#L85)

Zoom in by multiplying the current scale by the given factor.

#### Parameters

##### factor?

`number` = `1.25`

The multiplier to apply. Defaults to `1.25`.

#### Returns

`void`

***

### zoomOut()

> **zoomOut**(`factor?`): `void`

Defined in: [renderer/src/engine/camera.ts:95](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/engine/camera.ts#L95)

Zoom out by dividing the current scale by the given factor.

#### Parameters

##### factor?

`number` = `1.25`

The divisor to apply. Defaults to `1.25`.

#### Returns

`void`
