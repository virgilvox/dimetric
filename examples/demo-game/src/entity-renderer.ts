import { Sprite, Texture, Container } from 'pixi.js';
import type { System, GameWorld } from '@dimetric/runtime';

/**
 * System: syncs entity pixel positions to Sprite positions each frame.
 */
export class EntityRendererSystem implements System {
  readonly name = 'entity-renderer';

  private sprites = new Map<string, Sprite>();
  private container: Container;
  private defaultTexture: Texture;

  constructor(container: Container, defaultTexture: Texture) {
    this.container = container;
    this.defaultTexture = defaultTexture;
  }

  update(_dt: number, world: GameWorld): void {
    for (const entity of world.entities) {
      let sprite = this.sprites.get(entity.id);

      if (!sprite) {
        sprite = new Sprite(this.defaultTexture);
        sprite.anchor.set(0.5, 0.8);
        this.container.addChild(sprite);
        this.sprites.set(entity.id, sprite);
      }

      sprite.position.set(entity.pixelX, entity.pixelY);
    }

    // Remove sprites for entities that no longer exist
    for (const [id, sprite] of this.sprites) {
      if (!world.getEntity(id)) {
        sprite.destroy();
        this.sprites.delete(id);
      }
    }
  }

  destroy(): void {
    for (const sprite of this.sprites.values()) {
      sprite.destroy();
    }
    this.sprites.clear();
  }
}
