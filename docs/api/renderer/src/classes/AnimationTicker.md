[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / AnimationTicker

# Class: AnimationTicker

Defined in: renderer/src/sprites/animation-ticker.ts:32

Animation ticker that advances tile animations each frame.
Register animated sprites with [add](#add), then call [tick](#tick) each frame
(typically hooked into the PixiJS app ticker).

## Example

```ts
const ticker = new AnimationTicker();
ticker.add(sprite, [
  { texture: frame1, duration: 200 },
  { texture: frame2, duration: 200 },
]);
app.ticker.add((t) => ticker.tick(t.deltaMS));
```

## Constructors

### Constructor

> **new AnimationTicker**(): `AnimationTicker`

#### Returns

`AnimationTicker`

## Accessors

### count

#### Get Signature

> **get** **count**(): `number`

Defined in: renderer/src/sprites/animation-ticker.ts:79

The number of currently tracked animated tile entries.

##### Returns

`number`

The count of registered animations.

## Methods

### add()

> **add**(`sprite`, `frames`): `void`

Defined in: renderer/src/sprites/animation-ticker.ts:41

Register an animated tile sprite. Sprites with fewer than 2 frames are ignored.

#### Parameters

##### sprite

`Sprite`

The sprite to animate by swapping its texture.

##### frames

`object`[]

The animation frames with textures and durations in milliseconds.

#### Returns

`void`

***

### clear()

> **clear**(): `void`

Defined in: renderer/src/sprites/animation-ticker.ts:70

Remove all tracked animation entries without destroying the sprites.

#### Returns

`void`

***

### tick()

> **tick**(`deltaMs`): `void`

Defined in: renderer/src/sprites/animation-ticker.ts:57

Advance all registered animations by the given time delta.
Automatically wraps around to the first frame when the last frame completes.

#### Parameters

##### deltaMs

`number`

Time elapsed since the last tick, in milliseconds.

#### Returns

`void`
