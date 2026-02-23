import { describe, it, expect } from 'vitest';
import { Character } from '../src/entities/character';
import { Entity } from '../src/entities/entity';
import { MovementSystem } from '../src/systems/movement';
import { GameWorld } from '../src/engine/game-world';
import { createMap } from '@dimetric/core';

describe('MovementSystem', () => {
  function setup() {
    const world = new GameWorld();
    const map = createMap({ mapSize: { width: 10, height: 10 }, tileSize: { width: 64, height: 32 } });
    world.loadMap(map);
    const char = new Character({ gridX: 0, gridY: 0, speed: 10 });
    world.addEntity(char);
    const movement = new MovementSystem();
    world.addSystem(movement);
    return { world, char, movement };
  }

  it('moves character along a path', () => {
    const { char, movement, world } = setup();
    char.setPath([{ col: 1, row: 0 }]);
    expect(char.isMoving).toBe(true);

    // Run several updates
    for (let i = 0; i < 100; i++) {
      movement.update(1 / 60, world);
    }

    expect(char.gridX).toBe(1);
    expect(char.gridY).toBe(0);
    expect(char.isMoving).toBe(false);
  });

  it('stops at destination and sets idle', () => {
    const { char, movement, world } = setup();
    char.setPath([{ col: 1, row: 0 }]);

    for (let i = 0; i < 200; i++) {
      movement.update(1 / 60, world);
    }

    expect(char.animationState).toBe('idle');
  });

  it('ignores non-Character entities', () => {
    const { world } = setup();
    const plain = new Entity();
    world.addEntity(plain);
    const movement = new MovementSystem();
    // Should not throw
    movement.update(1 / 60, world);
  });
});
