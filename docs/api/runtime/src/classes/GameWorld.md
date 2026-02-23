[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / GameWorld

# Class: GameWorld

Defined in: runtime/src/engine/game-world.ts:22

Top-level game world that orchestrates the game loop, entities, and systems.

Systems run each fixed-update tick in the order they were added. An optional
renderer can be attached for visual output; omit it for headless / test usage.

## Example

```ts
const world = new GameWorld({ fixedDt: 1 / 60 });
world.loadMap(myMap);
world.addSystem(new MovementSystem());
world.addEntity(hero);
world.start();
```

## Constructors

### Constructor

> **new GameWorld**(`options?`): `GameWorld`

Defined in: runtime/src/engine/game-world.ts:36

Create a new game world.

#### Parameters

##### options?

Optional configuration forwarded to the [GameLoop](GameLoop.md).

###### fixedDt?

`number`

Fixed timestep in seconds. Defaults to `1/60`.

#### Returns

`GameWorld`

## Properties

### loop

> `readonly` **loop**: [`GameLoop`](GameLoop.md)

Defined in: runtime/src/engine/game-world.ts:24

The underlying fixed-timestep game loop.

## Accessors

### entities

#### Get Signature

> **get** **entities**(): readonly [`Entity`](Entity.md)[]

Defined in: runtime/src/engine/game-world.ts:91

A read-only view of all entities in the world.

##### Returns

readonly [`Entity`](Entity.md)[]

An immutable array of entities.

***

### map

#### Get Signature

> **get** **map**(): `DmMap` \| `null`

Defined in: runtime/src/engine/game-world.ts:73

The currently loaded map, or `null` if none has been loaded.

##### Returns

`DmMap` \| `null`

The active DmMap or `null`.

***

### renderer

#### Get Signature

> **get** **renderer**(): `DmRenderer` \| `null`

Defined in: runtime/src/engine/game-world.ts:82

The attached renderer, or `null` if running headless.

##### Returns

`DmRenderer` \| `null`

The active DmRenderer or `null`.

## Methods

### addEntity()

> **addEntity**(`entity`): `void`

Defined in: runtime/src/engine/game-world.ts:100

Add an entity to the world.

#### Parameters

##### entity

[`Entity`](Entity.md)

The entity to add.

#### Returns

`void`

***

### addSystem()

> **addSystem**(`system`): `void`

Defined in: runtime/src/engine/game-world.ts:130

Register a system. Systems are executed in the order they are added during
each fixed-update tick.

#### Parameters

##### system

[`System`](../interfaces/System.md)

The system to add.

#### Returns

`void`

***

### attachRenderer()

> **attachRenderer**(`renderer`): `void`

Defined in: runtime/src/engine/game-world.ts:61

Attach a PixiJS-based renderer. If a map has already been loaded, it is
sent to the renderer immediately. Pass `null` or omit for headless worlds.

#### Parameters

##### renderer

`DmRenderer`

The renderer instance to attach.

#### Returns

`void`

***

### getEntity()

> **getEntity**(`id`): [`Entity`](Entity.md) \| `undefined`

Defined in: runtime/src/engine/game-world.ts:120

Look up an entity by its unique identifier.

#### Parameters

##### id

`string`

The entity ID to search for.

#### Returns

[`Entity`](Entity.md) \| `undefined`

The matching entity, or `undefined` if not found.

***

### loadMap()

> **loadMap**(`map`): `void`

Defined in: runtime/src/engine/game-world.ts:48

Load a map into the world. If a renderer is already attached, the map is
forwarded to it automatically.

#### Parameters

##### map

`DmMap`

The map to load.

#### Returns

`void`

***

### removeEntity()

> **removeEntity**(`entity`): `void`

Defined in: runtime/src/engine/game-world.ts:109

Remove an entity from the world. No-op if the entity is not present.

#### Parameters

##### entity

[`Entity`](Entity.md)

The entity to remove.

#### Returns

`void`

***

### start()

> **start**(): `void`

Defined in: runtime/src/engine/game-world.ts:137

Start the game loop.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: runtime/src/engine/game-world.ts:144

Stop the game loop.

#### Returns

`void`
