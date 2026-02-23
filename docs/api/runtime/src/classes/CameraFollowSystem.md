[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / CameraFollowSystem

# Class: CameraFollowSystem

Defined in: runtime/src/systems/camera-follow.ts:19

System that smoothly lerps the camera toward a designated target entity.

Uses exponential smoothing so the camera eases toward the target rather than
snapping. If no target is set or no renderer is attached, the system is a
no-op.

## Example

```ts
const follow = new CameraFollowSystem({ target: hero, lerpSpeed: 8 });
world.addSystem(follow);
```

## Implements

- [`System`](../interfaces/System.md)

## Constructors

### Constructor

> **new CameraFollowSystem**(`options?`): `CameraFollowSystem`

Defined in: runtime/src/systems/camera-follow.ts:39

Create a new camera-follow system.

#### Parameters

##### options?

Optional configuration.

###### lerpSpeed?

`number`

Exponential lerp speed. Defaults to `5`.

###### target?

[`Entity`](Entity.md)

Entity to follow. Defaults to `null`.

#### Returns

`CameraFollowSystem`

## Properties

### lerpSpeed

> **lerpSpeed**: `number`

Defined in: runtime/src/systems/camera-follow.ts:30

Smoothing factor. Higher values make the camera snap faster.
Typical range is 2 -- 15.

***

### name

> `readonly` **name**: `"camera-follow"` = `'camera-follow'`

Defined in: runtime/src/systems/camera-follow.ts:21

Human-readable system name, primarily for debugging.

#### Implementation of

[`System`](../interfaces/System.md).[`name`](../interfaces/System.md#name)

***

### target

> **target**: [`Entity`](Entity.md) \| `null` = `null`

Defined in: runtime/src/systems/camera-follow.ts:24

The entity the camera should track, or `null` for no tracking.

## Methods

### update()

> **update**(`dt`, `world`): `void`

Defined in: runtime/src/systems/camera-follow.ts:50

Lerp the camera toward the target entity's position.

#### Parameters

##### dt

`number`

Elapsed time in seconds (the fixed timestep).

##### world

[`GameWorld`](GameWorld.md)

The game world providing renderer and map access.

#### Returns

`void`

#### Implementation of

[`System`](../interfaces/System.md).[`update`](../interfaces/System.md#update)
