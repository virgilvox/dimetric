import { Sprite, type Texture } from 'pixi.js';

/**
 * Simple object pool for PixiJS sprites.
 * Reuses destroyed sprites to reduce garbage collection pressure during tile rebuilds.
 *
 * @example
 * ```ts
 * const pool = new SpritePool();
 * const sprite = pool.acquire(texture);
 * container.addChild(sprite);
 * // Later, when done:
 * pool.release(sprite);
 * ```
 */
export class SpritePool {
  private pool: Sprite[] = [];

  /**
   * Get a sprite from the pool, or create a new one if the pool is empty.
   *
   * @param texture - Optional texture to assign to the sprite.
   * @returns A sprite instance, either recycled or newly created.
   */
  acquire(texture?: Texture): Sprite {
    const sprite = this.pool.pop();
    if (sprite) {
      if (texture) sprite.texture = texture;
      sprite.visible = true;
      return sprite;
    }
    return new Sprite(texture);
  }

  /**
   * Return a sprite to the pool for future reuse.
   * The sprite is hidden and removed from its parent container.
   *
   * @param sprite - The sprite to return to the pool.
   */
  release(sprite: Sprite): void {
    sprite.visible = false;
    sprite.removeFromParent();
    this.pool.push(sprite);
  }

  /** Destroy all pooled sprites, releasing their GPU resources. */
  destroy(): void {
    for (const sprite of this.pool) {
      sprite.destroy();
    }
    this.pool = [];
  }
}
