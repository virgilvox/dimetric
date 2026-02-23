[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / SpritePool

# Class: SpritePool

Defined in: [renderer/src/sprites/sprite-pool.ts:16](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/sprites/sprite-pool.ts#L16)

Simple object pool for PixiJS sprites.
Reuses destroyed sprites to reduce garbage collection pressure during tile rebuilds.

## Example

```ts
const pool = new SpritePool();
const sprite = pool.acquire(texture);
container.addChild(sprite);
// Later, when done:
pool.release(sprite);
```

## Constructors

### Constructor

> **new SpritePool**(): `SpritePool`

#### Returns

`SpritePool`

## Methods

### acquire()

> **acquire**(`texture?`): `Sprite`

Defined in: [renderer/src/sprites/sprite-pool.ts:25](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/sprites/sprite-pool.ts#L25)

Get a sprite from the pool, or create a new one if the pool is empty.

#### Parameters

##### texture?

`Texture`\<`TextureSource`\<`any`\>\>

Optional texture to assign to the sprite.

#### Returns

`Sprite`

A sprite instance, either recycled or newly created.

***

### destroy()

> **destroy**(): `void`

Defined in: [renderer/src/sprites/sprite-pool.ts:48](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/sprites/sprite-pool.ts#L48)

Destroy all pooled sprites, releasing their GPU resources.

#### Returns

`void`

***

### release()

> **release**(`sprite`): `void`

Defined in: [renderer/src/sprites/sprite-pool.ts:41](https://github.com/virgilvox/dimetric/blob/2af3d8ca9bab783af3286996cc19aa8920994370/packages/renderer/src/sprites/sprite-pool.ts#L41)

Return a sprite to the pool for future reuse.
The sprite is hidden and removed from its parent container.

#### Parameters

##### sprite

`Sprite`

The sprite to return to the pool.

#### Returns

`void`
