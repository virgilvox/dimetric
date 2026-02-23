[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / System

# Interface: System

Defined in: runtime/src/systems/system.ts:21

Interface for ECS-style systems that operate on entities each tick.

Systems are registered on a [GameWorld](../classes/GameWorld.md) and executed in order during
every fixed-update step.

## Example

```ts
class GravitySystem implements System {
  readonly name = 'gravity';
  update(dt: number, world: GameWorld): void {
    for (const e of world.entities) {
      e.pixelY += 9.8 * dt;
    }
  }
}
```

## Properties

### name

> `readonly` **name**: `string`

Defined in: runtime/src/systems/system.ts:23

Human-readable system name, primarily for debugging.

## Methods

### update()

> **update**(`dt`, `world`): `void`

Defined in: runtime/src/systems/system.ts:31

Called once per fixed-update tick.

#### Parameters

##### dt

`number`

Elapsed time in seconds (the fixed timestep).

##### world

[`GameWorld`](../classes/GameWorld.md)

The game world providing access to entities and map data.

#### Returns

`void`
