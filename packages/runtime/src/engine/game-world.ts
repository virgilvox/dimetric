import type { DmMap } from '@dimetric/core';
import type { DmRenderer } from '@dimetric/renderer';
import { GameLoop } from './game-loop';
import type { Entity } from '../entities/entity';
import type { System } from '../systems/system';

/**
 * Top-level game world that orchestrates the game loop, entities, and systems.
 *
 * Systems run each fixed-update tick in the order they were added. An optional
 * renderer can be attached for visual output; omit it for headless / test usage.
 *
 * @example
 * ```ts
 * const world = new GameWorld({ fixedDt: 1 / 60 });
 * world.loadMap(myMap);
 * world.addSystem(new MovementSystem());
 * world.addEntity(hero);
 * world.start();
 * ```
 */
export class GameWorld {
  /** The underlying fixed-timestep game loop. */
  readonly loop: GameLoop;
  private _map: DmMap | null = null;
  private _renderer: DmRenderer | null = null;
  private _entities: Entity[] = [];
  private _systems: System[] = [];

  /**
   * Create a new game world.
   *
   * @param options - Optional configuration forwarded to the {@link GameLoop}.
   * @param options.fixedDt - Fixed timestep in seconds. Defaults to `1/60`.
   */
  constructor(options?: { fixedDt?: number }) {
    this.loop = new GameLoop({ fixedDt: options?.fixedDt });
    this.loop.setFixedUpdate((dt) => this.fixedUpdate(dt));
    this.loop.setRender((alpha) => this.render(alpha));
  }

  /**
   * Load a map into the world. If a renderer is already attached, the map is
   * forwarded to it automatically.
   *
   * @param map - The map to load.
   */
  loadMap(map: DmMap): void {
    this._map = map;
    if (this._renderer) {
      this._renderer.setMap(map);
    }
  }

  /**
   * Attach a PixiJS-based renderer. If a map has already been loaded, it is
   * sent to the renderer immediately. Pass `null` or omit for headless worlds.
   *
   * @param renderer - The renderer instance to attach.
   */
  attachRenderer(renderer: DmRenderer): void {
    this._renderer = renderer;
    if (this._map) {
      renderer.setMap(this._map);
    }
  }

  /**
   * The currently loaded map, or `null` if none has been loaded.
   *
   * @returns The active {@link DmMap} or `null`.
   */
  get map(): DmMap | null {
    return this._map;
  }

  /**
   * The attached renderer, or `null` if running headless.
   *
   * @returns The active {@link DmRenderer} or `null`.
   */
  get renderer(): DmRenderer | null {
    return this._renderer;
  }

  /**
   * A read-only view of all entities in the world.
   *
   * @returns An immutable array of entities.
   */
  get entities(): readonly Entity[] {
    return this._entities;
  }

  /**
   * Add an entity to the world.
   *
   * @param entity - The entity to add.
   */
  addEntity(entity: Entity): void {
    this._entities.push(entity);
  }

  /**
   * Remove an entity from the world. No-op if the entity is not present.
   *
   * @param entity - The entity to remove.
   */
  removeEntity(entity: Entity): void {
    const idx = this._entities.indexOf(entity);
    if (idx !== -1) this._entities.splice(idx, 1);
  }

  /**
   * Look up an entity by its unique identifier.
   *
   * @param id - The entity ID to search for.
   * @returns The matching entity, or `undefined` if not found.
   */
  getEntity(id: string): Entity | undefined {
    return this._entities.find((e) => e.id === id);
  }

  /**
   * Register a system. Systems are executed in the order they are added during
   * each fixed-update tick.
   *
   * @param system - The system to add.
   */
  addSystem(system: System): void {
    this._systems.push(system);
  }

  /**
   * Start the game loop.
   */
  start(): void {
    this.loop.start();
  }

  /**
   * Stop the game loop.
   */
  stop(): void {
    this.loop.stop();
  }

  private fixedUpdate(dt: number): void {
    for (const system of this._systems) {
      system.update(dt, this);
    }
  }

  private render(_alpha: number): void {
    // Rendering is handled by PixiJS's own render loop.
    // This callback is available for interpolation if needed.
  }
}
