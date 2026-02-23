import { Sprite, Graphics, Texture, Container, type Renderer } from 'pixi.js';
import type { Entity } from '@dimetric/runtime';

/**
 * Manages entity sprites within the renderer's viewport container.
 */
export class EntitySpriteManager {
  private sprites = new Map<string, Sprite>();
  private container: Container;
  private defaultTexture: Texture;

  constructor(parentContainer: Container, pixiRenderer: Renderer) {
    this.container = new Container();
    parentContainer.addChild(this.container);

    // Create a simple circle texture for entities
    const g = new Graphics();
    g.circle(12, 12, 10);
    g.fill(0x3498db);
    g.stroke({ color: 0xffffff, width: 2 });
    this.defaultTexture = pixiRenderer.generateTexture(g);
    g.destroy();
  }

  update(entities: readonly Entity[]): void {
    const seen = new Set<string>();

    for (const entity of entities) {
      seen.add(entity.id);
      let sprite = this.sprites.get(entity.id);

      if (!sprite) {
        sprite = new Sprite(this.defaultTexture);
        sprite.anchor.set(0.5, 0.8);
        this.container.addChild(sprite);
        this.sprites.set(entity.id, sprite);
      }

      sprite.position.set(entity.pixelX, entity.pixelY);
    }

    // Remove sprites for removed entities
    for (const [id, sprite] of this.sprites) {
      if (!seen.has(id)) {
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
    this.container.destroy();
    this.defaultTexture.destroy();
  }
}
