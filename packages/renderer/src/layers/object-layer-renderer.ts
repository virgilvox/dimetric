import { Container, Sprite, Graphics, type Texture } from 'pixi.js';
import { extractGid, type DmObjectLayer } from '@dimetric/core';

/**
 * Renders a {@link DmObjectLayer}. GID-based objects are drawn as sprites;
 * non-GID objects are drawn as wireframe bounding boxes in editor mode.
 *
 * @example
 * ```ts
 * const renderer = new ObjectLayerRenderer();
 * renderer.rebuild(objectLayer, tileTextures, true);
 * parentContainer.addChild(renderer.container);
 * ```
 */
export class ObjectLayerRenderer {
  /** The PixiJS container holding all rendered objects for this layer. */
  readonly container: Container;
  private sprites: (Sprite | Graphics)[] = [];

  constructor() {
    this.container = new Container();
  }

  /**
   * Rebuild the layer from object data.
   * @param layer - The object layer to render.
   * @param tileTextures - GID-to-texture map.
   * @param editorMode - If true, draw wireframe boxes for non-GID objects.
   */
  rebuild(
    layer: DmObjectLayer,
    tileTextures: Map<number, Texture>,
    editorMode: boolean = true,
  ): void {
    this.clear();

    for (const obj of layer.objects) {
      if (!obj.visible) continue;

      if (obj.gid !== undefined && obj.gid > 0) {
        // GID-based object → sprite
        const gid = extractGid(obj.gid);
        const texture = tileTextures.get(gid);
        if (!texture) continue;

        const sprite = new Sprite(texture);
        const ax = obj.anchor?.x ?? 0;
        const ay = obj.anchor?.y ?? 1;
        sprite.anchor.set(ax, ay);
        sprite.x = obj.x;
        sprite.y = obj.y;
        if (obj.rotation) {
          sprite.rotation = (obj.rotation * Math.PI) / 180;
        }
        this.container.addChild(sprite);
        this.sprites.push(sprite);
      } else if (editorMode) {
        // Non-GID object → wireframe bounding box
        const g = new Graphics();
        g.rect(obj.x, obj.y, obj.width || 16, obj.height || 16);
        g.stroke({ width: 1, color: 0x00ffaa, alpha: 0.7 });
        if (obj.rotation) {
          g.rotation = (obj.rotation * Math.PI) / 180;
        }
        this.container.addChild(g);
        this.sprites.push(g);
      }
    }

    this.container.visible = layer.visible;
    this.container.alpha = layer.opacity;
  }

  /**
   * Set the visibility of this object layer.
   *
   * @param visible - Whether the layer should be visible.
   */
  setVisible(visible: boolean): void {
    this.container.visible = visible;
  }

  /**
   * Set the opacity of this object layer.
   *
   * @param opacity - Opacity value from 0 (fully transparent) to 1 (fully opaque).
   */
  setOpacity(opacity: number): void {
    this.container.alpha = opacity;
  }

  private clear(): void {
    for (const child of this.sprites) {
      child.destroy();
    }
    this.sprites = [];
    this.container.removeChildren();
  }

  /** Destroy all rendered objects and the container, releasing GPU resources. */
  destroy(): void {
    this.clear();
    this.container.destroy();
  }
}
