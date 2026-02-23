import type { Container } from 'pixi.js';
import type { DmLayer } from '@dimetric/core';

/** Interface for a layer renderer. Each layer type has its own implementation. */
export interface LayerRenderer {
  /** The PixiJS container for this layer. */
  readonly container: Container;

  /** Update the rendered layer from the data model. */
  update(layer: DmLayer): void;

  /** Clean up GPU resources. */
  destroy(): void;
}
