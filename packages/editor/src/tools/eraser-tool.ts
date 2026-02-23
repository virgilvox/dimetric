import type { GridCoord } from '@dimetric/core';
import type { Tool } from './tool';
import { useProjectStore } from '../stores/project';
import { useEditorStore } from '../stores/editor';
import { editorBus } from '../events/bus';

export class EraserTool implements Tool {
  readonly name = 'eraser';
  private erasing = false;

  onPointerDown(coord: GridCoord, button: number): void {
    if (button !== 0) return;
    this.erasing = true;
    this.erase(coord);
  }

  onPointerDrag(coord: GridCoord): void {
    if (!this.erasing) return;
    this.erase(coord);
  }

  onPointerUp(_coord: GridCoord, _button: number): void {
    this.erasing = false;
  }

  onHover(_coord: GridCoord): void {}

  private erase(coord: GridCoord): void {
    const project = useProjectStore();
    const editor = useEditorStore();
    const map = project.activeMap;
    if (!map || !editor.activeLayerId) return;
    project.setTile(map.id, editor.activeLayerId, coord.col, coord.row, 0);
    editorBus.emit('map:changed');
  }
}
