[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / AnimationSystem

# Class: AnimationSystem

Defined in: runtime/src/systems/animation.ts:20

System that synchronises each [Character](Character.md)'s animation state with its
movement status.

Moving characters are set to `'walk'`; characters that were walking but have
stopped are transitioned back to `'idle'`. In a full implementation this
system would also advance sprite frame indices based on direction and
elapsed time.

## Example

```ts
const world = new GameWorld();
world.addSystem(new AnimationSystem());
```

## Implements

- [`System`](../interfaces/System.md)

## Constructors

### Constructor

> **new AnimationSystem**(): `AnimationSystem`

#### Returns

`AnimationSystem`

## Properties

### name

> `readonly` **name**: `"animation"` = `'animation'`

Defined in: runtime/src/systems/animation.ts:22

Human-readable system name, primarily for debugging.

#### Implementation of

[`System`](../interfaces/System.md).[`name`](../interfaces/System.md#name)

## Methods

### update()

> **update**(`_dt`, `world`): `void`

Defined in: runtime/src/systems/animation.ts:30

Update animation states for all [Character](Character.md) entities.

#### Parameters

##### \_dt

`number`

Elapsed time in seconds (unused in the current implementation).

##### world

[`GameWorld`](GameWorld.md)

The game world containing entities.

#### Returns

`void`

#### Implementation of

[`System`](../interfaces/System.md).[`update`](../interfaces/System.md#update)
