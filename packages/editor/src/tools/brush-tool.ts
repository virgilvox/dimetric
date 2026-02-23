import type { GridCoord } from '@dimetric/core';
import type { Tool } from './tool';
import { useProjectStore } from '../stores/project';
import { useEditorStore } from '../stores/editor';
import { editorBus } from '../events/bus';

export class BrushTool implements Tool {
  readonly name = 'brush';
  private painting = false;

  onPointerDown(coord: GridCoord, button: number): void {
    if (button !== 0) return;
    this.painting = true;
    this.paint(coord);
  }

  onPointerDrag(coord: GridCoord): void {
    if (!this.painting) return;
    this.paint(coord);
  }

  onPointerUp(_coord: GridCoord, _button: number): void {
    this.painting = false;
  }

  onHover(_coord: GridCoord): void {
    // Cursor ghost is handled by the renderer
  }

  private paint(coord: GridCoord): void {
    const project = useProjectStore();
    const editor = useEditorStore();
    const map = project.activeMap;
    if (!map || !editor.activeLayerId || editor.selectedGid === 0) return;
    project.setTile(map.id, editor.activeLayerId, coord.col, coord.row, editor.selectedGid);
    editorBus.emit('map:changed');
  }
}
