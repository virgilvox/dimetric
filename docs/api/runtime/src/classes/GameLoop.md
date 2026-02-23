[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / GameLoop

# Class: GameLoop

Defined in: runtime/src/engine/game-loop.ts:16

Fixed-timestep game loop driven by `requestAnimationFrame`.

Calls a fixed-update callback at a deterministic rate (default 60 Hz) and a
render callback every frame with an interpolation alpha. Includes
spiral-of-death protection via a configurable max frame time cap.

## Example

```ts
const loop = new GameLoop({ fixedDt: 1 / 60 });
loop.setFixedUpdate((dt) => simulate(dt));
loop.setRender((alpha) => draw(alpha));
loop.start();
```

## Constructors

### Constructor

> **new GameLoop**(`options?`): `GameLoop`

Defined in: runtime/src/engine/game-loop.ts:38

Create a new game loop.

#### Parameters

##### options?

Optional configuration.

###### fixedDt?

`number`

Fixed timestep in seconds. Defaults to `1/60`.

###### maxFrameTime?

`number`

Maximum frame duration in seconds before
  clamping (spiral-of-death guard). Defaults to `0.25`.

#### Returns

`GameLoop`

## Properties

### fixedDt

> `readonly` **fixedDt**: `number`

Defined in: runtime/src/engine/game-loop.ts:18

Fixed timestep in seconds (default 1/60).

***

### maxFrameTime

> `readonly` **maxFrameTime**: `number`

Defined in: runtime/src/engine/game-loop.ts:20

Max frame time in seconds to prevent spiral of death (default 0.25s).

## Accessors

### isRunning

#### Get Signature

> **get** **isRunning**(): `boolean`

Defined in: runtime/src/engine/game-loop.ts:90

Whether the loop is currently running.

##### Returns

`boolean`

`true` if the loop has been started and not yet stopped.

## Methods

### setFixedUpdate()

> **setFixedUpdate**(`fn`): `void`

Defined in: runtime/src/engine/game-loop.ts:48

Set the fixed-update callback, invoked once per accumulated timestep.

#### Parameters

##### fn

(`dt`) => `void`

Callback receiving `dt` (fixed timestep) in seconds.

#### Returns

`void`

***

### setRender()

> **setRender**(`fn`): `void`

Defined in: runtime/src/engine/game-loop.ts:59

Set the render callback, invoked once per animation frame.

#### Parameters

##### fn

(`alpha`) => `void`

Callback receiving an interpolation alpha between 0 and 1,
  representing how far between the last two fixed updates the current
  frame falls.

#### Returns

`void`

***

### start()

> **start**(): `void`

Defined in: runtime/src/engine/game-loop.ts:66

Start the game loop. If already running, this is a no-op.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: runtime/src/engine/game-loop.ts:77

Stop the game loop and cancel the pending animation frame.

#### Returns

`void`
