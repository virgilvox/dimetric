import { Container, Sprite, Texture } from 'pixi.js';
import type { DmImageLayer } from '@dimetric/core';

/**
 * Renders a {@link DmImageLayer} as a single positioned sprite.
 * The image texture must be pre-loaded and passed into {@link rebuild}.
 *
 * @example
 * ```ts
 * const renderer = new ImageLayerRenderer();
 * renderer.rebuild(imageLayer, loadedTexture);
 * parentContainer.addChild(renderer.container);
 * ```
 */
export class ImageLayerRenderer {
  /** The PixiJS container holding the image sprite. */
  readonly container: Container;
  private sprite: Sprite | null = null;

  constructor() {
    this.container = new Container();
  }

  /**
   * Rebuild the layer with the given image.
   * @param layer - The image layer data.
   * @param texture - Pre-loaded texture for the image, or null to skip rendering.
   */
  rebuild(layer: DmImageLayer, texture: Texture | null): void {
    this.clear();

    if (texture) {
      this.sprite = new Sprite(texture);
      this.sprite.x = layer.offset.x;
      this.sprite.y = layer.offset.y;
      this.container.addChild(this.sprite);
    }

    this.container.visible = layer.visible;
    this.container.alpha = layer.opacity;
  }

  /**
   * Set the visibility of this image layer.
   *
   * @param visible - Whether the layer should be visible.
   */
  setVisible(visible: boolean): void {
    this.container.visible = visible;
  }

  /**
   * Set the opacity of this image layer.
   *
   * @param opacity - Opacity value from 0 (fully transparent) to 1 (fully opaque).
   */
  setOpacity(opacity: number): void {
    this.container.alpha = opacity;
  }

  private clear(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
    this.container.removeChildren();
  }

  /** Destroy the image sprite and the container, releasing GPU resources. */
  destroy(): void {
    this.clear();
    this.container.destroy();
  }
}
