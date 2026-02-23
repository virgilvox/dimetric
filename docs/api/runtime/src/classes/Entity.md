[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [runtime/src](../README.md) / Entity

# Class: Entity

Defined in: runtime/src/entities/entity.ts:15

Base entity with grid and pixel positions plus an arbitrary component map.

Grid coordinates represent the logical tile position on the map, while pixel
coordinates are used for smooth sub-tile rendering and interpolation.

## Example

```ts
const npc = new Entity({ gridX: 5, gridY: 10 });
npc.setComponent('health', { current: 100, max: 100 });
```

## Extended by

- [`Character`](Character.md)

## Constructors

### Constructor

> **new Entity**(`options?`): `Entity`

Defined in: runtime/src/entities/entity.ts:37

Create a new entity.

#### Parameters

##### options?

Optional initial values.

###### gridX?

`number`

Initial grid column. Defaults to `0`.

###### gridY?

`number`

Initial grid row. Defaults to `0`.

###### id?

`string`

Unique ID. Auto-generated if omitted.

#### Returns

`Entity`

## Properties

### components

> **components**: `Map`\<`string`, `unknown`\>

Defined in: runtime/src/entities/entity.ts:27

Arbitrary components keyed by name.

***

### gridX

> **gridX**: `number`

Defined in: runtime/src/entities/entity.ts:19

Grid column position.

***

### gridY

> **gridY**: `number`

Defined in: runtime/src/entities/entity.ts:21

Grid row position.

***

### id

> `readonly` **id**: `string`

Defined in: runtime/src/entities/entity.ts:17

Unique identifier for this entity.

***

### pixelX

> **pixelX**: `number`

Defined in: runtime/src/entities/entity.ts:23

Pixel X position (for smooth rendering).

***

### pixelY

> **pixelY**: `number`

Defined in: runtime/src/entities/entity.ts:25

Pixel Y position (for smooth rendering).

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
