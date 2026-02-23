[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / Character

# Class: Character

Defined in: runtime/src/entities/character.ts:26

An [Entity](Entity.md) extended with movement, facing direction, and animation
state. Characters can follow grid-based paths driven by the
[MovementSystem](MovementSystem.md).

## Example

```ts
const hero = new Character({ gridX: 3, gridY: 4, speed: 5 });
hero.setPath([{ col: 5, row: 4 }, { col: 5, row: 6 }]);
```

## Extends

- [`Entity`](Entity.md)

## Constructors

### Constructor

> **new Character**(`options?`): `Character`

Defined in: runtime/src/entities/character.ts:46

Create a new character entity.

#### Parameters

##### options?

Optional initial values.

###### direction?

[`Direction`](../type-aliases/Direction.md)

Initial facing direction. Defaults to `'s'`.

###### gridX?

`number`

Initial grid column. Defaults to `0`.

###### gridY?

`number`

Initial grid row. Defaults to `0`.

###### id?

`string`

Unique ID. Auto-generated if omitted.

###### speed?

`number`

Movement speed in tiles/sec. Defaults to `3`.

#### Returns

`Character`

#### Overrides

[`Entity`](Entity.md).[`constructor`](Entity.md#constructor)

## Properties

### animationState

> **animationState**: `string`

Defined in: runtime/src/entities/character.ts:34

Current animation state.

***

### components

> **components**: `Map`\<`string`, `unknown`\>

Defined in: runtime/src/entities/entity.ts:27

Arbitrary components keyed by name.

#### Inherited from

[`Entity`](Entity.md).[`components`](Entity.md#components)

***

### direction

> **direction**: [`Direction`](../type-aliases/Direction.md)

Defined in: runtime/src/entities/character.ts:30

Current facing direction.

***

### gridX

> **gridX**: `number`

Defined in: runtime/src/entities/entity.ts:19

Grid column position.

#### Inherited from

[`Entity`](Entity.md).[`gridX`](Entity.md#gridx)

***

### gridY

> **gridY**: `number`

Defined in: runtime/src/entities/entity.ts:21

Grid row position.

#### Inherited from

[`Entity`](Entity.md).[`gridY`](Entity.md#gridy)

***

### id

> `readonly` **id**: `string`

Defined in: runtime/src/entities/entity.ts:17

Unique identifier for this entity.

#### Inherited from

[`Entity`](Entity.md).[`id`](Entity.md#id)

***

### path

> **path**: `GridCoord`[]

Defined in: runtime/src/entities/character.ts:32

Current path to follow (grid coords).

***

### pixelX

> **pixelX**: `number`

Defined in: runtime/src/entities/entity.ts:23

Pixel X position (for smooth rendering).

#### Inherited from

[`Entity`](Entity.md).[`pixelX`](Entity.md#pixelx)

***

### pixelY

> **pixelY**: `number`

Defined in: runtime/src/entities/entity.ts:25

Pixel Y position (for smooth rendering).

#### Inherited from

[`Entity`](Entity.md).[`pixelY`](Entity.md#pixely)

***

### speed

> **speed**: `number`

Defined in: runtime/src/entities/character.ts:28

Movement speed in tiles per second.

## Accessors

### isMoving

#### Get Signature

> **get** **isMoving**(): `boolean`

Defined in: runtime/src/entities/character.ts:65

Whether the character is currently following a path.

##### Returns

`boolean`

`true` if the path array is non-empty.

## Methods

### getComponent()

> **getComponent**\<`T`\>(`name`): `T` \| `undefined`

Defined in: runtime/src/entities/entity.ts:58

Retrieve a typed component by name.

#### Type Parameters

##### T

`T`

The expected component type.

#### Parameters

##### name

`string`

The component key.

#### Returns

`T` \| `undefined`

The component value cast to `T`, or `undefined` if not set.

#### Example

```ts
const hp = entity.getComponent<{ current: number }>('health');
```

#### Inherited from

[`Entity`](Entity.md).[`getComponent`](Entity.md#getcomponent)

***

### hasComponent()

> **hasComponent**(`name`): `boolean`

Defined in: runtime/src/entities/entity.ts:79

Check whether this entity has a component with the given name.

#### Parameters

##### name

`string`

The component key to check.

#### Returns

`boolean`

`true` if the component exists.

#### Inherited from

[`Entity`](Entity.md).[`hasComponent`](Entity.md#hascomponent)

***

### setComponent()

> **setComponent**\<`T`\>(`name`, `value`): `void`

Defined in: runtime/src/entities/entity.ts:69

Attach or overwrite a component on this entity.

#### Type Parameters

##### T

`T`

The component type.

#### Parameters

##### name

`string`

The component key.

##### value

`T`

The component value to store.

#### Returns

`void`

#### Inherited from

[`Entity`](Entity.md).[`setComponent`](Entity.md#setcomponent)

***

### setPath()

> **setPath**(`path`): `void`

Defined in: runtime/src/entities/character.ts:75

Assign a new path for the character to follow and set the animation
state to `'walk'` if the path is non-empty.

#### Parameters

##### path

`GridCoord`[]

Ordered array of grid coordinates to traverse.

#### Returns

`void`

***

### stopMoving()

> **stopMoving**(): `void`

Defined in: runtime/src/entities/character.ts:85

Clear the current path and reset the animation state to `'idle'`.

#### Returns

`void`
