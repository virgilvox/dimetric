[**Dimetric API Reference**](../../../README.md)

***

[Dimetric API Reference](../../../README.md) / [renderer/src](../README.md) / AnimatedTileEntry

# Interface: AnimatedTileEntry

Defined in: renderer/src/sprites/animation-ticker.ts:6

Tracks an animated tile sprite and its playback state.

## Properties

### currentFrame

> **currentFrame**: `number`

Defined in: renderer/src/sprites/animation-ticker.ts:12

Index of the currently displayed frame.

***

### elapsed

> **elapsed**: `number`

Defined in: renderer/src/sprites/animation-ticker.ts:14

Milliseconds elapsed since the current frame started.

***

### frames

> **frames**: `object`[]

Defined in: renderer/src/sprites/animation-ticker.ts:10

Ordered list of animation frames with textures and durations in milliseconds.

#### duration

> **duration**: `number`

#### texture

> **texture**: `Texture`

***

### sprite

> **sprite**: `Sprite`

Defined in: renderer/src/sprites/animation-ticker.ts:8

The sprite whose texture is swapped each frame.
