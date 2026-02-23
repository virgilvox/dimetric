import { gridToScreen } from '@dimetric/core';
import type { System } from './system';
import type { GameWorld } from '../engine/game-world';
import { Character, type Direction } from '../entities/character';

/**
 * System that advances {@link Character} entities along their grid paths.
 *
 * Each tick, characters move toward the next waypoint in pixel space at a rate
 * derived from their `speed` property. When a waypoint is reached the character
 * snaps to the grid cell and the waypoint is removed. Facing direction is
 * updated automatically based on the movement vector.
 *
 * @example
 * ```ts
 * const world = new GameWorld();
 * world.addSystem(new MovementSystem());
 * ```
 */
export class MovementSystem implements System {
  /** @inheritDoc */
  readonly name = 'movement';

  /**
   * Advance all {@link Character} entities toward their next path waypoint.
   *
   * @param dt - Elapsed time in seconds (the fixed timestep).
   * @param world - The game world containing entities and the active map.
   */
  update(dt: number, world: GameWorld): void {
    const map = world.map;
    if (!map) return;
    const tw = map.tileSize.width;
    const th = map.tileSize.height;

    for (const entity of world.entities) {
      if (!(entity instanceof Character)) continue;
      if (!entity.isMoving) continue;

      const target = entity.path[0];
      const targetScreen = gridToScreen(target.col, target.row, tw, th);

      const dx = targetScreen.sx - entity.pixelX;
      const dy = targetScreen.sy - entity.pixelY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Pixels per second: speed in tiles/sec * average tile pixel size
      const pxPerSec = entity.speed * ((tw + th) / 2);
      const step = pxPerSec * dt;

      if (dist <= step) {
        // Arrived at target cell
        entity.pixelX = targetScreen.sx;
        entity.pixelY = targetScreen.sy;
        entity.gridX = target.col;
        entity.gridY = target.row;
        entity.path.shift();

        if (entity.path.length === 0) {
          entity.stopMoving();
        }
      } else {
        // Move toward target
        entity.pixelX += (dx / dist) * step;
        entity.pixelY += (dy / dist) * step;
      }

      // Update facing direction
      entity.direction = directionFromDelta(dx, dy);
    }
  }
}

/**
 * Map a movement delta to one of eight compass directions.
 *
 * @param dx - Horizontal pixel delta.
 * @param dy - Vertical pixel delta.
 * @returns The closest {@link Direction}.
 */
function directionFromDelta(dx: number, dy: number): Direction {
  const angle = Math.atan2(dy, dx);
  const deg = ((angle * 180) / Math.PI + 360) % 360;
  if (deg < 22.5 || deg >= 337.5) return 'e';
  if (deg < 67.5) return 'se';
  if (deg < 112.5) return 's';
  if (deg < 157.5) return 'sw';
  if (deg < 202.5) return 'w';
  if (deg < 247.5) return 'nw';
  if (deg < 292.5) return 'n';
  return 'ne';
}
