import { gridToScreen } from '@dimetric/core';
import type { System } from './system';
import type { GameWorld } from '../engine/game-world';
import type { Entity } from '../entities/entity';

/**
 * System that smoothly lerps the camera toward a designated target entity.
 *
 * Uses exponential smoothing so the camera eases toward the target rather than
 * snapping. If no target is set or no renderer is attached, the system is a
 * no-op.
 *
 * @example
 * ```ts
 * const follow = new CameraFollowSystem({ target: hero, lerpSpeed: 8 });
 * world.addSystem(follow);
 * ```
 */
export class CameraFollowSystem implements System {
  /** @inheritDoc */
  readonly name = 'camera-follow';

  /** The entity the camera should track, or `null` for no tracking. */
  target: Entity | null = null;

  /**
   * Smoothing factor. Higher values make the camera snap faster.
   * Typical range is 2 -- 15.
   */
  lerpSpeed: number;

  /**
   * Create a new camera-follow system.
   *
   * @param options - Optional configuration.
   * @param options.target - Entity to follow. Defaults to `null`.
   * @param options.lerpSpeed - Exponential lerp speed. Defaults to `5`.
   */
  constructor(options?: { target?: Entity; lerpSpeed?: number }) {
    this.target = options?.target ?? null;
    this.lerpSpeed = options?.lerpSpeed ?? 5;
  }

  /**
   * Lerp the camera toward the target entity's position.
   *
   * @param dt - Elapsed time in seconds (the fixed timestep).
   * @param world - The game world providing renderer and map access.
   */
  update(dt: number, world: GameWorld): void {
    if (!this.target || !world.renderer || !world.map) return;

    const tw = world.map.tileSize.width;
    const th = world.map.tileSize.height;

    // Use the target's pixel position if available, else grid position
    let targetX = this.target.pixelX;
    let targetY = this.target.pixelY;
    if (targetX === 0 && targetY === 0) {
      const screen = gridToScreen(this.target.gridX, this.target.gridY, tw, th);
      targetX = screen.sx;
      targetY = screen.sy;
    }

    const cam = world.renderer.camera.getState();
    const t = 1 - Math.exp(-this.lerpSpeed * dt);
    const newX = cam.x + (targetX - cam.x) * t;
    const newY = cam.y + (targetY - cam.y) * t;
    world.renderer.camera.panTo(newX, newY);
  }
}
