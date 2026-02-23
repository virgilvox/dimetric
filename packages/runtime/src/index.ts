// @dimetric/runtime - Embeddable game runtime

// Engine
export { GameLoop } from './engine/game-loop';
export { GameWorld } from './engine/game-world';

// Entities
export { Entity } from './entities/entity';
export { Character, type Direction, type AnimationState } from './entities/character';

// Systems
export type { System } from './systems/system';
export { MovementSystem } from './systems/movement';
export { AnimationSystem } from './systems/animation';
export { CameraFollowSystem } from './systems/camera-follow';

// Input
export { InputManager } from './input/input-manager';
export { Pointer } from './input/pointer';

// Pathfinding
export { GridGraph } from './pathfinding/grid-graph';
export { astar, type AStarResult } from './pathfinding/astar';
