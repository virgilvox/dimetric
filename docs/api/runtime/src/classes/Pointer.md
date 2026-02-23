[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / Pointer

# Class: Pointer

Defined in: runtime/src/input/pointer.ts:22

Pointer (mouse / touch) state tracker.

Attaches to an HTML element and records screen-space coordinates plus
primary-button press state. Like [InputManager](InputManager.md), call [flush](#flush) at
the end of each fixed-update tick to reset the `justClicked` flag.

## Example

```ts
const pointer = new Pointer();
pointer.attach(canvas);

// Inside a system update:
if (pointer.justClicked) {
  const cell = pointer.toGrid(worldX, worldY, tw, th);
}
pointer.flush();
```

## Constructors

### Constructor

> **new Pointer**(): `Pointer`

Defined in: runtime/src/input/pointer.ts:37

#### Returns

`Pointer`

## Properties

### isDown

> **isDown**: `boolean` = `false`

Defined in: runtime/src/input/pointer.ts:28

Whether the primary button is currently pressed.

***

### justClicked

> **justClicked**: `boolean` = `false`

Defined in: runtime/src/input/pointer.ts:30

Whether the primary button was clicked this frame (before flush).

***

### screenX

> **screenX**: `number` = `0`

Defined in: runtime/src/input/pointer.ts:24

Screen-space X coordinate.

***

### screenY

> **screenY**: `number` = `0`

Defined in: runtime/src/input/pointer.ts:26

Screen-space Y coordinate.

## Methods

### attach()

> **attach**(`el`): `void`

Defined in: runtime/src/input/pointer.ts:48

Begin listening for pointer events on the given element.

#### Parameters

##### el

`HTMLElement`

The HTML element to observe (typically a `<canvas>`).

#### Returns

`void`

***

### detach()

> **detach**(): `void`

Defined in: runtime/src/input/pointer.ts:58

Remove event listeners and release the reference to the target element.

#### Returns

`void`

***

### flush()

> **flush**(): `void`

Defined in: runtime/src/input/pointer.ts:90

Clear per-frame transient state. Must be called at the end of each
fixed-update tick so that `justClicked` only reports for a single frame.

#### Returns

`void`

***

### toGrid()

> **toGrid**(`worldX`, `worldY`, `tileWidth`, `tileHeight`): `GridCoord`

Defined in: runtime/src/input/pointer.ts:77

Convert a world-space position to the nearest grid coordinate using the
isometric snap-to-grid algorithm.

#### Parameters

##### worldX

`number`

World-space X (typically derived via a camera transform).

##### worldY

`number`

World-space Y.

##### tileWidth

`number`

Map tile width in pixels.

##### tileHeight

`number`

Map tile height in pixels.

#### Returns

`GridCoord`

The snapped GridCoord.
