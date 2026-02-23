[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / MovementSystem

# Class: MovementSystem

Defined in: runtime/src/systems/movement.ts:20

System that advances [Character](Character.md) entities along their grid paths.

Each tick, characters move toward the next waypoint in pixel space at a rate
derived from their `speed` property. When a waypoint is reached the character
snaps to the grid cell and the waypoint is removed. Facing direction is
updated automatically based on the movement vector.

## Example

```ts
const world = new GameWorld();
world.addSystem(new MovementSystem());
```

## Implements

- [`System`](../interfaces/System.md)

## Constructors

### Constructor

> **new MovementSystem**(): `MovementSystem`

#### Returns

`MovementSystem`

## Properties

### name

> `readonly` **name**: `"movement"` = `'movement'`

Defined in: runtime/src/systems/movement.ts:22

Human-readable system name, primarily for debugging.

#### Implementation of

[`System`](../interfaces/System.md).[`name`](../interfaces/System.md#name)

## Methods

### update()

> **update**(`dt`, `world`): `void`

Defined in: runtime/src/systems/movement.ts:30

Advance all [Character](Character.md) entities toward their next path waypoint.

#### Parameters

##### dt

`number`

Elapsed time in seconds (the fixed timestep).

##### world

[`GameWorld`](GameWorld.md)

The game world containing entities and the active map.

#### Returns

`void`

#### Implementation of

[`System`](../interfaces/System.md).[`update`](../interfaces/System.md#update)
