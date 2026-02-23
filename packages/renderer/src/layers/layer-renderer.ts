import type { Container } from 'pixi.js';
import type { DmLayer } from '@dimetric/core';

/**
 * Common interface for all layer renderers.
 * Each layer type (tile, object, image) provides its own implementation.
 */
export interface LayerRenderer {
  /** The PixiJS container that holds all visual elements for this layer. */
  readonly container: Container;

  /**
   * Update the rendered layer to reflect changes in the data model.
   *
   * @param layer - The layer data to render.
   */
  update(layer: DmLayer): void;

  /** Destroy the renderer and release all GPU resources. */
  destroy(): void;
}
