import { Sprite, type Texture } from 'pixi.js';

/** Simple sprite pool for reuse to reduce allocation pressure. */
export class SpritePool {
  private pool: Sprite[] = [];

  /** Get a sprite from the pool or create a new one. */
  acquire(texture?: Texture): Sprite {
    const sprite = this.pool.pop();
    if (sprite) {
      if (texture) sprite.texture = texture;
      sprite.visible = true;
      return sprite;
    }
    return new Sprite(texture);
  }

  /** Return a sprite to the pool. */
  release(sprite: Sprite): void {
    sprite.visible = false;
    sprite.removeFromParent();
    this.pool.push(sprite);
  }

  /** Destroy all pooled sprites. */
  destroy(): void {
    for (const sprite of this.pool) {
      sprite.destroy();
    }
    this.pool = [];
  }
}
