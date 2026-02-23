import type { GridCoord } from '@dimetric/core';
import { Entity } from './entity';

/**
 * One of eight compass directions for character facing.
 */
export type Direction = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

/**
 * Named animation state for a character. Built-in states are `'idle'` and
 * `'walk'`; custom string values are also accepted.
 */
export type AnimationState = 'idle' | 'walk' | 'run' | string;

/**
 * An {@link Entity} extended with movement, facing direction, and animation
 * state. Characters can follow grid-based paths driven by the
 * {@link MovementSystem}.
 *
 * @example
 * ```ts
 * const hero = new Character({ gridX: 3, gridY: 4, speed: 5 });
 * hero.setPath([{ col: 5, row: 4 }, { col: 5, row: 6 }]);
 * ```
 */
export class Character extends Entity {
  /** Movement speed in tiles per second. */
  speed: number;
  /** Current facing direction. */
  direction: Direction;
  /** Current path to follow (grid coords). */
  path: GridCoord[];
  /** Current animation state. */
  animationState: AnimationState;

  /**
   * Create a new character entity.
   *
   * @param options - Optional initial values.
   * @param options.id - Unique ID. Auto-generated if omitted.
   * @param options.gridX - Initial grid column. Defaults to `0`.
   * @param options.gridY - Initial grid row. Defaults to `0`.
   * @param options.speed - Movement speed in tiles/sec. Defaults to `3`.
   * @param options.direction - Initial facing direction. Defaults to `'s'`.
   */
  constructor(options?: {
    id?: string;
    gridX?: number;
    gridY?: number;
    speed?: number;
    direction?: Direction;
  }) {
    super(options);
    this.speed = options?.speed ?? 3;
    this.direction = options?.direction ?? 's';
    this.path = [];
    this.animationState = 'idle';
  }

  /**
   * Whether the character is currently following a path.
   *
   * @returns `true` if the path array is non-empty.
   */
  get isMoving(): boolean {
    return this.path.length > 0;
  }

  /**
   * Assign a new path for the character to follow and set the animation
   * state to `'walk'` if the path is non-empty.
   *
   * @param path - Ordered array of grid coordinates to traverse.
   */
  setPath(path: GridCoord[]): void {
    this.path = [...path];
    if (path.length > 0) {
      this.animationState = 'walk';
    }
  }

  /**
   * Clear the current path and reset the animation state to `'idle'`.
   */
  stopMoving(): void {
    this.path = [];
    this.animationState = 'idle';
  }
}
