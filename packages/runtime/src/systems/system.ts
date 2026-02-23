import type { GameWorld } from '../engine/game-world';

/**
 * Interface for ECS-style systems that operate on entities each tick.
 *
 * Systems are registered on a {@link GameWorld} and executed in order during
 * every fixed-update step.
 *
 * @example
 * ```ts
 * class GravitySystem implements System {
 *   readonly name = 'gravity';
 *   update(dt: number, world: GameWorld): void {
 *     for (const e of world.entities) {
 *       e.pixelY += 9.8 * dt;
 *     }
 *   }
 * }
 * ```
 */
export interface System {
  /** Human-readable system name, primarily for debugging. */
  readonly name: string;

  /**
   * Called once per fixed-update tick.
   *
   * @param dt - Elapsed time in seconds (the fixed timestep).
   * @param world - The game world providing access to entities and map data.
   */
  update(dt: number, world: GameWorld): void;
}
