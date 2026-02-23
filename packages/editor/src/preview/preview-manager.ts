import type { DmRenderer } from '@dimetric/renderer';
import { GameWorld, Character, MovementSystem, CameraFollowSystem, Pointer, GridGraph } from '@dimetric/runtime';
import { gridToScreen } from '@dimetric/core';
import type { DmMap, DmTileLayer } from '@dimetric/core';
import { ClickToMoveSystem } from './click-to-move-system';
import { EntitySpriteManager } from './entity-sprite-manager';

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Orchestrates the preview mode lifecycle.
 * Creates a GameWorld reusing the existing DmRenderer,
 * spawns a character, adds systems, and manages start/stop.
 */
export class PreviewManager {
  private world: GameWorld | null = null;
  private pointer: Pointer | null = null;
  private entitySprites: EntitySpriteManager | null = null;
  private savedCameraState: CameraState | null = null;

  start(
    renderer: DmRenderer,
    map: DmMap,
    options: { startCol: number; startRow: number; collisionLayerName: string },
  ): void {
    if (this.world) this.stop(renderer);

    // Save camera state
    this.savedCameraState = renderer.camera.getState();

    // Hide editor overlays
    renderer.setGridVisible(false);

    // Create game world
    const world = new GameWorld();
    world.loadMap(map);
    world.attachRenderer(renderer);

    // Find collision layer
    const collisionLayer = this.findTileLayer(map, options.collisionLayerName);
    const collisionLayerId = collisionLayer?.id ?? '';

    // Build walkability graph
    let graph: GridGraph;
    if (collisionLayerId) {
      graph = GridGraph.fromMap(map, collisionLayerId);
    } else {
      // No collision layer: all tiles walkable
      graph = new GridGraph(map.mapSize.width, map.mapSize.height);
      for (let r = 0; r < map.mapSize.height; r++) {
        for (let c = 0; c < map.mapSize.width; c++) {
          graph.setWalkable(c, r, true);
        }
      }
    }

    // Create character
    const character = new Character({
      id: 'preview-player',
      gridX: options.startCol,
      gridY: options.startRow,
      speed: 4,
    });

    // Set initial pixel position
    const startPos = gridToScreen(options.startCol, options.startRow, map.tileSize.width, map.tileSize.height);
    character.pixelX = startPos.sx;
    character.pixelY = startPos.sy + map.tileSize.height / 2;

    world.addEntity(character);

    // Setup pointer input
    const pointer = new Pointer();
    const canvas = renderer.getApp().canvas;
    pointer.attach(canvas as HTMLCanvasElement);

    // Create entity sprites
    const viewport = renderer.getViewport();
    const app = renderer.getApp();
    const entitySprites = new EntitySpriteManager(viewport.viewport, app.renderer);

    // Add systems
    const cameraFollow = new CameraFollowSystem({ target: character, lerpSpeed: 5 });

    world.addSystem(new ClickToMoveSystem(pointer, graph, character));
    world.addSystem(new MovementSystem());
    world.addSystem(cameraFollow);
    world.addSystem({
      name: 'entity-sprite-sync',
      update(_dt, w) { entitySprites.update(w.entities); },
    });
    world.addSystem({
      name: 'input-flush',
      update() { pointer.flush(); },
    });

    // Start!
    world.start();
    renderer.camera.panTo(character.pixelX, character.pixelY);

    this.world = world;
    this.pointer = pointer;
    this.entitySprites = entitySprites;
  }

  stop(renderer: DmRenderer): void {
    if (this.world) {
      this.world.stop();
      this.world = null;
    }

    if (this.pointer) {
      this.pointer.detach();
      this.pointer = null;
    }

    if (this.entitySprites) {
      this.entitySprites.destroy();
      this.entitySprites = null;
    }

    // Restore camera state
    if (this.savedCameraState) {
      renderer.camera.panTo(this.savedCameraState.x, this.savedCameraState.y);
      renderer.camera.setZoom(this.savedCameraState.zoom);
      this.savedCameraState = null;
    }

    // Restore editor overlays
    renderer.setGridVisible(true);
  }

  get isActive(): boolean {
    return this.world !== null;
  }

  private findTileLayer(map: DmMap, name: string): DmTileLayer | null {
    for (const layer of map.layers) {
      if (layer.type === 'tile' && layer.name.toLowerCase() === name.toLowerCase()) {
        return layer;
      }
    }
    return null;
  }
}
