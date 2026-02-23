import type { Sprite, Texture } from 'pixi.js';

/**
 * Tracks an animated tile sprite and its playback state.
 */
export interface AnimatedTileEntry {
  /** The sprite whose texture is swapped each frame. */
  sprite: Sprite;
  /** Ordered list of animation frames with textures and durations in milliseconds. */
  frames: { texture: Texture; duration: number }[];
  /** Index of the currently displayed frame. */
  currentFrame: number;
  /** Milliseconds elapsed since the current frame started. */
  elapsed: number;
}

/**
 * Animation ticker that advances tile animations each frame.
 * Register animated sprites with {@link add}, then call {@link tick} each frame
 * (typically hooked into the PixiJS app ticker).
 *
 * @example
 * ```ts
 * const ticker = new AnimationTicker();
 * ticker.add(sprite, [
 *   { texture: frame1, duration: 200 },
 *   { texture: frame2, duration: 200 },
 * ]);
 * app.ticker.add((t) => ticker.tick(t.deltaMS));
 * ```
 */
export class AnimationTicker {
  private entries: AnimatedTileEntry[] = [];

  /**
   * Register an animated tile sprite. Sprites with fewer than 2 frames are ignored.
   *
   * @param sprite - The sprite to animate by swapping its texture.
   * @param frames - The animation frames with textures and durations in milliseconds.
   */
  add(sprite: Sprite, frames: { texture: Texture; duration: number }[]): void {
    if (frames.length < 2) return; // No animation needed for single frame
    this.entries.push({
      sprite,
      frames,
      currentFrame: 0,
      elapsed: 0,
    });
  }

  /**
   * Advance all registered animations by the given time delta.
   * Automatically wraps around to the first frame when the last frame completes.
   *
   * @param deltaMs - Time elapsed since the last tick, in milliseconds.
   */
  tick(deltaMs: number): void {
    for (const entry of this.entries) {
      entry.elapsed += deltaMs;
      const frame = entry.frames[entry.currentFrame];
      while (entry.elapsed >= frame.duration) {
        entry.elapsed -= frame.duration;
        entry.currentFrame = (entry.currentFrame + 1) % entry.frames.length;
        entry.sprite.texture = entry.frames[entry.currentFrame].texture;
      }
    }
  }

  /** Remove all tracked animation entries without destroying the sprites. */
  clear(): void {
    this.entries = [];
  }

  /**
   * The number of currently tracked animated tile entries.
   *
   * @returns The count of registered animations.
   */
  get count(): number {
    return this.entries.length;
  }
}
