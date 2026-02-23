import type { GridCoord } from '@dimetric/core';
import type { Tool } from './tool';
import { useProjectStore } from '../stores/project';
import { useEditorStore } from '../stores/editor';
import { useHistoryStore } from '../stores/history';
import { editorBus } from '../events/bus';

export class BrushTool implements Tool {
  readonly name = 'brush';
  private painting = false;

  onPointerDown(coord: GridCoord, button: number): void {
    if (button !== 0) return;
    const project = useProjectStore();
    const editor = useEditorStore();
    const map = project.activeMap;
    if (!map || !editor.activeLayerId || editor.selectedGid === 0) return;

    const history = useHistoryStore();
    history.beginBatch(map.id, editor.activeLayerId);
    this.painting = true;
    this.paint(coord);
  }

  onPointerDrag(coord: GridCoord): void {
    if (!this.painting) return;
    this.paint(coord);
  }

  onPointerUp(_coord: GridCoord, _button: number): void {
    if (!this.painting) return;
    this.painting = false;
    const history = useHistoryStore();
    history.endBatch();
  }

  onHover(_coord: GridCoord): void {
    // Cursor ghost is handled by the renderer
  }

  private paint(coord: GridCoord): void {
    const project = useProjectStore();
    const editor = useEditorStore();
    const history = useHistoryStore();
    const map = project.activeMap;
    if (!map || !editor.activeLayerId || editor.selectedGid === 0) return;

    const oldGid = project.getTile(map.id, editor.activeLayerId, coord.col, coord.row);
    const newGid = editor.selectedGid;
    if (oldGid === newGid) return;

    history.addToBatch(coord.col, coord.row, oldGid, newGid);
    project.setTile(map.id, editor.activeLayerId, coord.col, coord.row, newGid);
    editorBus.emit('map:changed');
  }
}
