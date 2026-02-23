import type { System } from './system';
import type { GameWorld } from '../engine/game-world';
import { Character } from '../entities/character';

/**
 * System that synchronises each {@link Character}'s animation state with its
 * movement status.
 *
 * Moving characters are set to `'walk'`; characters that were walking but have
 * stopped are transitioned back to `'idle'`. In a full implementation this
 * system would also advance sprite frame indices based on direction and
 * elapsed time.
 *
 * @example
 * ```ts
 * const world = new GameWorld();
 * world.addSystem(new AnimationSystem());
 * ```
 */
export class AnimationSystem implements System {
  /** @inheritDoc */
  readonly name = 'animation';

  /**
   * Update animation states for all {@link Character} entities.
   *
   * @param _dt - Elapsed time in seconds (unused in the current implementation).
   * @param world - The game world containing entities.
   */
  update(_dt: number, world: GameWorld): void {
    for (const entity of world.entities) {
      if (!(entity instanceof Character)) continue;

      // Determine animation state from movement
      if (entity.isMoving) {
        entity.animationState = 'walk';
      } else if (entity.animationState === 'walk') {
        entity.animationState = 'idle';
      }
    }
  }
}
