[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / InputManager

# Class: InputManager

Defined in: runtime/src/input/input-manager.ts:20

Keyboard input manager that tracks per-frame key state.

Maintains three sets -- currently held, just-pressed this frame, and
just-released this frame. Call [flush](#flush) at the end of each fixed-update
tick to clear the transient just-pressed / just-released sets.

## Example

```ts
const input = new InputManager();
input.attach();

// Inside a system update:
if (input.justPressed('Space')) jump();
if (input.isDown('ArrowRight')) moveRight(dt);

input.flush(); // call at end of tick
```

## Constructors

### Constructor

> **new InputManager**(): `InputManager`

Defined in: runtime/src/input/input-manager.ts:27

#### Returns

`InputManager`

## Methods

### attach()

> **attach**(): `void`

Defined in: runtime/src/input/input-manager.ts:35

Start listening for `keydown` and `keyup` events on `window`.

#### Returns

`void`

***

### detach()

> **detach**(): `void`

Defined in: runtime/src/input/input-manager.ts:43

Stop listening for keyboard events and clear all internal state.

#### Returns

`void`

***

### flush()

> **flush**(): `void`

Defined in: runtime/src/input/input-manager.ts:88

Clear per-frame transient state. Must be called at the end of each
fixed-update tick so that `justPressed` and `justReleased` only report
events for a single frame.

#### Returns

`void`

***

### isDown()

> **isDown**(`key`): `boolean`

Defined in: runtime/src/input/input-manager.ts:57

Check whether a key is currently held down.

#### Parameters

##### key

`string`

The `KeyboardEvent.key` value (e.g. `'ArrowUp'`, `'a'`).

#### Returns

`boolean`

`true` if the key is pressed.

***

### justPressed()

> **justPressed**(`key`): `boolean`

Defined in: runtime/src/input/input-manager.ts:68

Check whether a key was pressed during the current frame (before
[flush](#flush) is called).

#### Parameters

##### key

`string`

The `KeyboardEvent.key` value.

#### Returns

`boolean`

`true` if the key transitioned from up to down this frame.

***

### justReleased()

> **justReleased**(`key`): `boolean`

Defined in: runtime/src/input/input-manager.ts:79

Check whether a key was released during the current frame (before
[flush](#flush) is called).

#### Parameters

##### key

`string`

The `KeyboardEvent.key` value.

#### Returns

`boolean`

`true` if the key transitioned from down to up this frame.
