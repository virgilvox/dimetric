# @dimetric/runtime

Game runtime for the Dimetric engine. Provides a fixed-timestep game loop, entity/character classes, ECS-style systems (movement, animation, camera follow), keyboard and pointer input, and A* pathfinding on isometric grids.

## Installation

```bash
npm install @dimetric/runtime @dimetric/core @dimetric/renderer pixi.js pixi-viewport
```

Peer dependencies: `@dimetric/core` and `@dimetric/renderer`.

## Quick Start

```typescript
import { GameWorld, Character, MovementSystem, AnimationSystem, CameraFollowSystem, InputManager, GridGraph, astar } from '@dimetric/runtime';
import { DmRenderer } from '@dimetric/renderer';
import { createMap } from '@dimetric/core';

// Set up renderer
const renderer = new DmRenderer();
await renderer.init({ container: document.getElementById('game')! });

// Create and configure the game world
const world = new GameWorld({ fixedDt: 1 / 60 });
world.attachRenderer(renderer);
world.loadMap(myMap);

// Add systems (run in order each tick)
const cameraFollow = new CameraFollowSystem({ lerpSpeed: 5 });
world.addSystem(new MovementSystem());
world.addSystem(new AnimationSystem());
world.addSystem(cameraFollow);

// Create a character
const player = new Character({
  gridX: 5,
  gridY: 5,
  speed: 3,       // tiles per second
  direction: 's',
});
world.addEntity(player);
cameraFollow.target = player;

// Set up pathfinding
const graph = GridGraph.fromMap(myMap, wallLayerId, { allowDiagonals: true });

// Handle click-to-move
const input = new InputManager();
input.attach();

// Start the game loop
world.start();
```

## GameWorld

Orchestrates the game loop, entities, and systems.

```typescript
class GameWorld {
  readonly loop: GameLoop;
  get map(): DmMap | null;
  get renderer(): DmRenderer | null;
  get entities(): readonly Entity[];

  loadMap(map: DmMap): void;
  attachRenderer(renderer: DmRenderer): void;
  addEntity(entity: Entity): void;
  removeEntity(entity: Entity): void;
  getEntity(id: string): Entity | undefined;
  addSystem(system: System): void;
  start(): void;
  stop(): void;
}
```

Systems run in the order they are added. The world can operate without a renderer for headless/server use.

## GameLoop

Fixed-timestep loop with spiral-of-death protection. Calls `onFixedUpdate(dt)` at a stable rate (default 60 Hz) and `onRender(alpha)` each frame for interpolation.

```typescript
import { GameLoop } from '@dimetric/runtime';

const loop = new GameLoop({ fixedDt: 1 / 60, maxFrameTime: 0.25 });
loop.setFixedUpdate((dt) => { /* physics/logic at fixed rate */ });
loop.setRender((alpha) => { /* interpolated rendering */ });
loop.start();
loop.stop();
loop.isRunning;  // boolean
```

You typically do not use `GameLoop` directly -- `GameWorld` creates and manages it internally.

## Entities

### Entity

Base entity with grid and pixel positions, plus a component map for ad-hoc data.

```typescript
import { Entity } from '@dimetric/runtime';

const entity = new Entity({ gridX: 10, gridY: 5 });
entity.pixelX;  // smooth rendering position
entity.pixelY;

// Arbitrary component storage
entity.setComponent('health', { current: 100, max: 100 });
const hp = entity.getComponent<{ current: number; max: number }>('health');
entity.hasComponent('health');  // true
```

### Character

Extends `Entity` with movement speed, 8-directional facing, path following, and animation state.

```typescript
import { Character } from '@dimetric/runtime';
import type { Direction, AnimationState } from '@dimetric/runtime';

const npc = new Character({
  gridX: 3,
  gridY: 7,
  speed: 2,          // tiles per second
  direction: 'se',   // 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
});

npc.setPath([{ col: 4, row: 7 }, { col: 5, row: 8 }]);
npc.isMoving;        // true
npc.animationState;  // 'walk'
npc.stopMoving();    // clears path, sets state to 'idle'
```

## Systems

Systems implement the `System` interface and are ticked each fixed update.

```typescript
interface System {
  readonly name: string;
  update(dt: number, world: GameWorld): void;
}
```

### MovementSystem

Advances `Character` entities along their paths. Interpolates pixel position toward each grid target, computes movement in pixels per second (`speed * avgTileSize`), and updates facing direction based on movement delta.

```typescript
world.addSystem(new MovementSystem());
```

### AnimationSystem

Updates `Character.animationState` based on movement. Sets `'walk'` while moving, transitions to `'idle'` when stopped. Extend or replace this system to drive sprite frame changes.

```typescript
world.addSystem(new AnimationSystem());
```

### CameraFollowSystem

Smoothly lerps the renderer camera toward a target entity each tick.

```typescript
const cam = new CameraFollowSystem({
  target: player,   // Entity to follow
  lerpSpeed: 5,     // higher = snappier (0-1 per second, exponential)
});
world.addSystem(cam);

// Change target at runtime
cam.target = otherEntity;
```

### Custom Systems

```typescript
import type { System } from '@dimetric/runtime';
import type { GameWorld } from '@dimetric/runtime';

class GravitySystem implements System {
  readonly name = 'gravity';

  update(dt: number, world: GameWorld): void {
    for (const entity of world.entities) {
      const vel = entity.getComponent<{ vy: number }>('velocity');
      if (vel) {
        vel.vy += 9.8 * dt;
      }
    }
  }
}

world.addSystem(new GravitySystem());
```

## Input

### InputManager

Tracks keyboard key state per frame: held, just pressed, and just released.

```typescript
import { InputManager } from '@dimetric/runtime';

const input = new InputManager();
input.attach();    // starts listening on window

input.isDown('ArrowUp');       // true while held
input.justPressed('Space');    // true for one frame on press
input.justReleased('Escape');  // true for one frame on release

// Call at end of each update to clear per-frame state
input.flush();

input.detach();  // stop listening, clear all state
```

### Pointer

Tracks mouse/touch position and click state on a target element.

```typescript
import { Pointer } from '@dimetric/runtime';

const pointer = new Pointer();
pointer.attach(canvasElement);

pointer.screenX;    // client X
pointer.screenY;    // client Y
pointer.isDown;     // primary button held
pointer.justClicked; // primary button pressed this frame

// Convert to grid coordinates (requires world-space position from camera)
const { wx, wy } = renderer.camera.screenToWorld(pointer.screenX, pointer.screenY);
const gridCoord = pointer.toGrid(wx, wy, tileWidth, tileHeight);

pointer.flush();   // clear per-frame state
pointer.detach();
```

## Pathfinding

### GridGraph

A walkability grid for A* pathfinding. Supports 4-directional and 8-directional (diagonal) movement.

```typescript
import { GridGraph } from '@dimetric/runtime';

// Create from a map's tile layer (tiles with GID 0 = walkable, others = blocked)
const graph = GridGraph.fromMap(map, collisionLayerId, { allowDiagonals: true });

// Or create manually
const graph = new GridGraph(20, 20, true);
graph.setWalkable(5, 5, false);  // block a cell
graph.isWalkable(5, 5);          // false
graph.inBounds(col, row);
graph.neighbors(col, row);       // walkable adjacent cells
```

### A* Search

```typescript
import { astar } from '@dimetric/runtime';
import type { AStarResult } from '@dimetric/runtime';

const result: AStarResult = astar(graph, { col: 0, row: 0 }, { col: 15, row: 12 });

if (result.found) {
  result.path;  // GridCoord[] from start to goal (inclusive)
  result.cost;  // total path cost (1.0 cardinal, sqrt(2) diagonal)

  // Send a character along the path
  character.setPath(result.path);
}
```

Uses Chebyshev distance as the heuristic for 8-directional grids, yielding optimal paths with diagonal costs of sqrt(2).

## Full Example

```typescript
import { GameWorld, Character, MovementSystem, AnimationSystem, CameraFollowSystem, InputManager, Pointer, GridGraph, astar } from '@dimetric/runtime';
import { DmRenderer } from '@dimetric/renderer';

const renderer = new DmRenderer();
await renderer.init({ container: document.getElementById('game')! });

const world = new GameWorld();
world.attachRenderer(renderer);
world.loadMap(myMap);

const player = new Character({ gridX: 2, gridY: 2, speed: 4 });
world.addEntity(player);

world.addSystem(new MovementSystem());
world.addSystem(new AnimationSystem());
world.addSystem(new CameraFollowSystem({ target: player, lerpSpeed: 8 }));

const graph = GridGraph.fromMap(myMap, wallLayerId);
const input = new InputManager();
const pointer = new Pointer();
input.attach();
pointer.attach(document.getElementById('game')!);

// Click-to-move handler (run inside a custom system or event listener)
function handleClick() {
  if (!pointer.justClicked) return;
  const { wx, wy } = renderer.camera.screenToWorld(pointer.screenX, pointer.screenY);
  const target = pointer.toGrid(wx, wy, myMap.tileSize.width, myMap.tileSize.height);
  const result = astar(graph, { col: player.gridX, row: player.gridY }, target);
  if (result.found) {
    player.setPath(result.path);
  }
}

world.start();
```

## License

MIT
