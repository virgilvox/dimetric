import { Application, Container } from 'pixi.js';
import { gridToScreen, type DmMap, type DmLayer } from '@dimetric/core';
import { DmViewport } from './viewport';
import { DmCamera } from './camera';
import { GridOverlayRenderer } from '../layers/grid-overlay-renderer';
import { TileLayerRenderer } from '../layers/tile-layer-renderer';
import { ObjectLayerRenderer } from '../layers/object-layer-renderer';
import { ImageLayerRenderer } from '../layers/image-layer-renderer';
import { HighlightRenderer } from '../selection/highlight-renderer';
import { CursorRenderer } from '../selection/cursor-renderer';
import { AnimationTicker } from '../sprites/animation-ticker';
import type { Texture } from 'pixi.js';

/**
 * Options for initializing the {@link DmRenderer}.
 */
export interface DmRendererOptions {
  /** The HTML element to mount the PixiJS canvas into. */
  container: HTMLElement;
  /** Background color as a hex number. Defaults to `0x1a1a2e`. */
  backgroundColor?: number;
}

type AnyLayerRenderer = TileLayerRenderer | ObjectLayerRenderer | ImageLayerRenderer;

/**
 * Main renderer that owns the PixiJS Application, viewport, grid overlay,
 * tile/object/image layer renderers, selection overlays, and animation ticker.
 *
 * @example
 * ```ts
 * const renderer = new DmRenderer();
 * await renderer.init({ container: document.getElementById('canvas')! });
 * renderer.setMap(myMap);
 * ```
 */
export class DmRenderer {
  private app!: Application;
  private dmViewport!: DmViewport;
  readonly camera: DmCamera;
  readonly gridOverlay: GridOverlayRenderer;
  readonly highlight: HighlightRenderer;
  readonly cursor: CursorRenderer;
  readonly animationTicker: AnimationTicker;

  private layerRenderers: Map<string, AnyLayerRenderer> = new Map();
  private layerContainer!: Container;
  private tileTextures: Map<number, Texture> = new Map();
  private currentMap: DmMap | null = null;
  private containerEl: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor() {
    this.camera = new DmCamera();
    this.gridOverlay = new GridOverlayRenderer();
    this.highlight = new HighlightRenderer();
    this.cursor = new CursorRenderer();
    this.animationTicker = new AnimationTicker();
  }

  /**
   * Initialize the PixiJS application, create the viewport, and mount the canvas to the DOM.
   * Sets up resize observation, grid overlay, selection overlays, and the animation ticker.
   *
   * @param options - Renderer initialization options including the target container element.
   */
  async init(options: DmRendererOptions): Promise<void> {
    this.containerEl = options.container;
    const { width, height } = options.container.getBoundingClientRect();

    this.app = new Application();
    await this.app.init({
      width,
      height,
      backgroundColor: options.backgroundColor ?? 0x1a1a2e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    options.container.appendChild(this.app.canvas as HTMLCanvasElement);

    // Viewport for pan/zoom
    this.dmViewport = new DmViewport({
      app: this.app,
      worldWidth: 4000,
      worldHeight: 4000,
    });
    this.app.stage.addChild(this.dmViewport.viewport);
    this.camera.attach(this.dmViewport);

    // Layer container for tile layers
    this.layerContainer = new Container();
    this.dmViewport.viewport.addChild(this.layerContainer);

    // Grid overlay
    this.dmViewport.viewport.addChild(this.gridOverlay.container);

    // Selection overlays (on top of everything)
    this.dmViewport.viewport.addChild(this.highlight.container);
    this.dmViewport.viewport.addChild(this.cursor.container);

    // Hook animation ticker into the PixiJS app ticker
    this.tickerCallback = (ticker) => {
      this.animationTicker.tick(ticker.deltaMS);
    };
    this.app.ticker.add(this.tickerCallback as any);

    // Watch for resize
    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        this.app.renderer.resize(w, h);
        this.dmViewport.resize(w, h);
      }
    });
    this.resizeObserver.observe(options.container);
  }

  /**
   * Get the underlying PixiJS Application instance for advanced usage.
   *
   * @returns The PixiJS {@link Application}.
   */
  getApp(): Application {
    return this.app;
  }

  /**
   * Get the viewport adapter that wraps pixi-viewport.
   *
   * @returns The {@link DmViewport} instance used for pan/zoom.
   */
  getViewport(): DmViewport {
    return this.dmViewport;
  }

  /**
   * Set the current map, redraw the grid overlay, rebuild all layer renderers,
   * and center the camera on the map.
   *
   * @param map - The map data to render.
   */
  setMap(map: DmMap): void {
    this.currentMap = map;

    // Draw grid overlay
    this.gridOverlay.draw({
      cols: map.mapSize.width,
      rows: map.mapSize.height,
      tileWidth: map.tileSize.width,
      tileHeight: map.tileSize.height,
    });

    // Update highlight/cursor tile sizes
    this.highlight.setTileSize(map.tileSize.width, map.tileSize.height);
    this.cursor.setTileSize(map.tileSize.width, map.tileSize.height);

    // Rebuild tile layers
    this.rebuildLayers(map);

    // Center the camera on the map
    const centerCol = map.mapSize.width / 2;
    const centerRow = map.mapSize.height / 2;
    const center = gridToScreen(centerCol, centerRow, map.tileSize.width, map.tileSize.height);
    this.camera.panTo(center.sx, center.sy);
  }

  /**
   * Set the combined tile texture map and rebuild layers if a map is loaded.
   *
   * @param textures - Map from global tile ID (GID) to PixiJS Texture.
   */
  setTileTextures(textures: Map<number, Texture>): void {
    this.tileTextures = textures;
    if (this.currentMap) {
      this.rebuildLayers(this.currentMap);
    }
  }

  /**
   * Rebuild all layer renderers from the map data.
   * Destroys existing renderers and recursively creates new ones for group layers.
   *
   * @param map - The map whose layers should be rebuilt.
   */
  rebuildLayers(map: DmMap): void {
    // Clear existing
    for (const renderer of this.layerRenderers.values()) {
      renderer.destroy();
    }
    this.layerRenderers.clear();
    this.layerContainer.removeChildren();
    this.animationTicker.clear();

    // Build layer tree
    this.buildLayerTree(map.layers, this.layerContainer, map);
  }

  private buildLayerTree(layers: DmLayer[], parent: Container, map: DmMap): void {
    for (const layer of layers) {
      switch (layer.type) {
        case 'tile': {
          const renderer = new TileLayerRenderer();
          renderer.rebuild(layer, map.tileSize.width, map.tileSize.height, this.tileTextures);
          parent.addChild(renderer.container);
          this.layerRenderers.set(layer.id, renderer);
          break;
        }
        case 'object': {
          const renderer = new ObjectLayerRenderer();
          renderer.rebuild(layer, this.tileTextures, true);
          parent.addChild(renderer.container);
          this.layerRenderers.set(layer.id, renderer);
          break;
        }
        case 'image': {
          const renderer = new ImageLayerRenderer();
          // Image layers need pre-loaded textures; pass null for now
          renderer.rebuild(layer, null);
          parent.addChild(renderer.container);
          this.layerRenderers.set(layer.id, renderer);
          break;
        }
        case 'group': {
          const groupContainer = new Container();
          groupContainer.visible = layer.visible;
          groupContainer.alpha = layer.opacity;
          parent.addChild(groupContainer);
          this.buildLayerTree(layer.layers, groupContainer, map);
          break;
        }
      }
    }
  }

  /**
   * Get the tile layer renderer for a specific layer by ID.
   *
   * @param layerId - The unique layer identifier.
   * @returns The {@link TileLayerRenderer} if the layer exists and is a tile layer, otherwise `undefined`.
   */
  getTileLayerRenderer(layerId: string): TileLayerRenderer | undefined {
    const r = this.layerRenderers.get(layerId);
    return r instanceof TileLayerRenderer ? r : undefined;
  }

  /**
   * Update a single layer's visibility.
   *
   * @param layerId - The unique layer identifier.
   * @param visible - Whether the layer should be visible.
   */
  setLayerVisible(layerId: string, visible: boolean): void {
    this.layerRenderers.get(layerId)?.setVisible(visible);
  }

  /**
   * Update a single layer's opacity.
   *
   * @param layerId - The unique layer identifier.
   * @param opacity - Opacity value from 0 (fully transparent) to 1 (fully opaque).
   */
  setLayerOpacity(layerId: string, opacity: number): void {
    this.layerRenderers.get(layerId)?.setOpacity(opacity);
  }

  /**
   * Toggle grid overlay visibility.
   *
   * @param visible - Whether the isometric grid overlay should be shown.
   */
  setGridVisible(visible: boolean): void {
    this.gridOverlay.container.visible = visible;
  }

  /**
   * Destroy the renderer and clean up all resources.
   * Disconnects the resize observer, removes the ticker callback, destroys all
   * layer renderers, overlays, viewport, and the PixiJS application, then
   * removes the canvas from the DOM.
   */
  destroy(): void {
    this.resizeObserver?.disconnect();
    if (this.tickerCallback) {
      this.app.ticker.remove(this.tickerCallback as any);
      this.tickerCallback = null;
    }
    this.animationTicker.clear();
    this.camera.detach();
    this.highlight.destroy();
    this.cursor.destroy();
    this.gridOverlay.destroy();
    for (const renderer of this.layerRenderers.values()) {
      renderer.destroy();
    }
    this.layerRenderers.clear();
    this.tileTextures.clear();
    this.currentMap = null;
    this.dmViewport.destroy();
    this.app.destroy(true);
    // Remove the canvas from the container
    if (this.containerEl) {
      while (this.containerEl.firstChild) {
        this.containerEl.removeChild(this.containerEl.firstChild);
      }
    }
  }
}
