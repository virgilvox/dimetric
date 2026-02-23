import type { GridCoord } from '@dimetric/core';
import type { Tool } from './tool';
import { useProjectStore } from '../stores/project';
import { useEditorStore } from '../stores/editor';
import { useHistoryStore } from '../stores/history';
import { editorBus } from '../events/bus';

export class EraserTool implements Tool {
  readonly name = 'eraser';
  private erasing = false;

  onPointerDown(coord: GridCoord, button: number): void {
    if (button !== 0) return;
    const project = useProjectStore();
    const editor = useEditorStore();
    const map = project.activeMap;
    if (!map || !editor.activeLayerId) return;

    const history = useHistoryStore();
    history.beginBatch(map.id, editor.activeLayerId);
    this.erasing = true;
    this.erase(coord);
  }

  onPointerDrag(coord: GridCoord): void {
    if (!this.erasing) return;
    this.erase(coord);
  }

  onPointerUp(_coord: GridCoord, _button: number): void {
    if (!this.erasing) return;
    this.erasing = false;
    const history = useHistoryStore();
    history.endBatch();
  }

  onHover(_coord: GridCoord): void {}

  private erase(coord: GridCoord): void {
    const project = useProjectStore();
    const editor = useEditorStore();
    const history = useHistoryStore();
    const map = project.activeMap;
    if (!map || !editor.activeLayerId) return;

    const oldGid = project.getTile(map.id, editor.activeLayerId, coord.col, coord.row);
    if (oldGid === 0) return;

    history.addToBatch(coord.col, coord.row, oldGid, 0);
    project.setTile(map.id, editor.activeLayerId, coord.col, coord.row, 0);
    editorBus.emit('map:changed');
  }
}
