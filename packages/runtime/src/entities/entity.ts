import { generateId } from '@dimetric/core';

/**
 * Base entity with grid and pixel positions plus an arbitrary component map.
 *
 * Grid coordinates represent the logical tile position on the map, while pixel
 * coordinates are used for smooth sub-tile rendering and interpolation.
 *
 * @example
 * ```ts
 * const npc = new Entity({ gridX: 5, gridY: 10 });
 * npc.setComponent('health', { current: 100, max: 100 });
 * ```
 */
export class Entity {
  /** Unique identifier for this entity. */
  readonly id: string;
  /** Grid column position. */
  gridX: number;
  /** Grid row position. */
  gridY: number;
  /** Pixel X position (for smooth rendering). */
  pixelX: number;
  /** Pixel Y position (for smooth rendering). */
  pixelY: number;
  /** Arbitrary components keyed by name. */
  components: Map<string, unknown>;

  /**
   * Create a new entity.
   *
   * @param options - Optional initial values.
   * @param options.id - Unique ID. Auto-generated if omitted.
   * @param options.gridX - Initial grid column. Defaults to `0`.
   * @param options.gridY - Initial grid row. Defaults to `0`.
   */
  constructor(options?: { id?: string; gridX?: number; gridY?: number }) {
    this.id = options?.id ?? generateId();
    this.gridX = options?.gridX ?? 0;
    this.gridY = options?.gridY ?? 0;
    this.pixelX = 0;
    this.pixelY = 0;
    this.components = new Map();
  }

  /**
   * Retrieve a typed component by name.
   *
   * @typeParam T - The expected component type.
   * @param name - The component key.
   * @returns The component value cast to `T`, or `undefined` if not set.
   *
   * @example
   * ```ts
   * const hp = entity.getComponent<{ current: number }>('health');
   * ```
   */
  getComponent<T>(name: string): T | undefined {
    return this.components.get(name) as T | undefined;
  }

  /**
   * Attach or overwrite a component on this entity.
   *
   * @typeParam T - The component type.
   * @param name - The component key.
   * @param value - The component value to store.
   */
  setComponent<T>(name: string, value: T): void {
    this.components.set(name, value);
  }

  /**
   * Check whether this entity has a component with the given name.
   *
   * @param name - The component key to check.
   * @returns `true` if the component exists.
   */
  hasComponent(name: string): boolean {
    return this.components.has(name);
  }
}
