import type { GridCoord } from '@dimetric/core';

/** Interface that all editor tools must implement. */
export interface Tool {
  readonly name: string;

  /** Called when the pointer presses on a grid cell. */
  onPointerDown(coord: GridCoord, button: number): void;

  /** Called when the pointer moves to a new grid cell while pressed. */
  onPointerDrag(coord: GridCoord): void;

  /** Called when the pointer is released. */
  onPointerUp(coord: GridCoord, button: number): void;

  /** Called when the pointer hovers over a grid cell (no press). */
  onHover(coord: GridCoord): void;

  /** Called when the tool is activated (becomes current tool). */
  onActivate?(): void;

  /** Called when the tool is deactivated (another tool becomes current). */
  onDeactivate?(): void;
}
