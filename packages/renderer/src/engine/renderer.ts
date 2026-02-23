import { Application, Container } from 'pixi.js';
import { gridToScreen, type DmMap } from '@dimetric/core';
import { DmViewport } from './viewport';
import { DmCamera } from './camera';
import { GridOverlayRenderer } from '../layers/grid-overlay-renderer';
import { TileLayerRenderer } from '../layers/tile-layer-renderer';
import { HighlightRenderer } from '../selection/highlight-renderer';
import { CursorRenderer } from '../selection/cursor-renderer';
import type { Texture } from 'pixi.js';

export interface DmRendererOptions {
  container: HTMLElement;
  backgroundColor?: number;
}

/** Main renderer: owns PixiJS Application, viewport, grid, tile layers, and overlays. */
export class DmRenderer {
  private app!: Application;
  private dmViewport!: DmViewport;
  readonly camera: DmCamera;
  readonly gridOverlay: GridOverlayRenderer;
  readonly highlight: HighlightRenderer;
  readonly cursor: CursorRenderer;

  private layerRenderers: Map<string, TileLayerRenderer> = new Map();
  private layerContainer!: Container;
  private tileTextures: Map<number, Texture> = new Map();
  private currentMap: DmMap | null = null;
  private containerEl: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    this.camera = new DmCamera();
    this.gridOverlay = new GridOverlayRenderer();
    this.highlight = new HighlightRenderer();
    this.cursor = new CursorRenderer();
  }

  /** Initialize the PixiJS application and mount it to the DOM. */
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

  /** Get the PixiJS Application (for advanced usage). */
  getApp(): Application {
    return this.app;
  }

  /** Get the pixi-viewport instance. */
  getViewport(): DmViewport {
    return this.dmViewport;
  }

  /** Set the current map and draw grid + layers. */
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

  /** Set the combined tile texture map (GID -> Texture). */
  setTileTextures(textures: Map<number, Texture>): void {
    this.tileTextures = textures;
    if (this.currentMap) {
      this.rebuildLayers(this.currentMap);
    }
  }

  /** Rebuild all tile layer renderers from the map data. */
  rebuildLayers(map: DmMap): void {
    // Clear existing
    for (const renderer of this.layerRenderers.values()) {
      renderer.destroy();
    }
    this.layerRenderers.clear();
    this.layerContainer.removeChildren();

    // Create renderers for tile layers
    for (const layer of map.layers) {
      if (layer.type === 'tile') {
        const renderer = new TileLayerRenderer();
        renderer.rebuild(layer, map.tileSize.width, map.tileSize.height, this.tileTextures);
        this.layerContainer.addChild(renderer.container);
        this.layerRenderers.set(layer.id, renderer);
      }
    }
  }

  /** Get the tile layer renderer for a specific layer. */
  getTileLayerRenderer(layerId: string): TileLayerRenderer | undefined {
    return this.layerRenderers.get(layerId);
  }

  /** Update a single layer's visibility. */
  setLayerVisible(layerId: string, visible: boolean): void {
    this.layerRenderers.get(layerId)?.setVisible(visible);
  }

  /** Update a single layer's opacity. */
  setLayerOpacity(layerId: string, opacity: number): void {
    this.layerRenderers.get(layerId)?.setOpacity(opacity);
  }

  /** Toggle grid overlay visibility. */
  setGridVisible(visible: boolean): void {
    this.gridOverlay.container.visible = visible;
  }

  /** Destroy the renderer and clean up all resources. */
  destroy(): void {
    this.resizeObserver?.disconnect();
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
