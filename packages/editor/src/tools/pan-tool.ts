import type { GridCoord } from '@dimetric/core';
import type { Tool } from './tool';

/** Pan tool: does nothing special -- viewport drag handles panning. */
export class PanTool implements Tool {
  readonly name = 'pan';

  onPointerDown(_coord: GridCoord, _button: number): void {}
  onPointerDrag(_coord: GridCoord): void {}
  onPointerUp(_coord: GridCoord, _button: number): void {}
  onHover(_coord: GridCoord): void {}
}
