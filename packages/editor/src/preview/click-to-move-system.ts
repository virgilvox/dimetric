import type { System, GameWorld, Character } from '@dimetric/runtime';
import { GridGraph, astar, Pointer } from '@dimetric/runtime';
import { snapToGrid } from '@dimetric/core';

/**
 * System: pointer click → A* → character.setPath()
 * Used in editor preview mode.
 */
export class ClickToMoveSystem implements System {
  readonly name = 'click-to-move';

  private pointer: Pointer;
  private graph: GridGraph;
  private character: Character;

  constructor(pointer: Pointer, graph: GridGraph, character: Character) {
    this.pointer = pointer;
    this.graph = graph;
    this.character = character;
  }

  update(_dt: number, world: GameWorld): void {
    if (!this.pointer.justClicked || !world.map || !world.renderer) return;

    const viewport = world.renderer.getViewport();
    const worldPos = viewport.screenToWorld(this.pointer.screenX, this.pointer.screenY);

    const { tileSize } = world.map;
    const target = snapToGrid(worldPos.wx, worldPos.wy, tileSize.width, tileSize.height);

    if (!this.graph.isWalkable(target.col, target.row)) return;

    const start = { col: this.character.gridX, row: this.character.gridY };
    const result = astar(this.graph, start, target);

    if (result.found && result.path.length > 1) {
      this.character.setPath(result.path.slice(1));
    }
  }
}
