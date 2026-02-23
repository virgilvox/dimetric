import type { GridCoord } from '@dimetric/core';
import { extractGid } from '@dimetric/core';
import type { Tool } from './tool';
import { useProjectStore } from '../stores/project';
import { useEditorStore } from '../stores/editor';

export class EyedropperTool implements Tool {
  readonly name = 'eyedropper';

  onPointerDown(coord: GridCoord, button: number): void {
    if (button !== 0) return;
    this.pick(coord);
  }

  onPointerDrag(_coord: GridCoord): void {}
  onPointerUp(_coord: GridCoord, _button: number): void {}
  onHover(_coord: GridCoord): void {}

  private pick(coord: GridCoord): void {
    const project = useProjectStore();
    const editor = useEditorStore();
    const map = project.activeMap;
    if (!map || !editor.activeLayerId) return;
    const rawGid = project.getTile(map.id, editor.activeLayerId, coord.col, coord.row);
    if (rawGid > 0) {
      editor.setSelectedGid(extractGid(rawGid));
      editor.setTool('brush');
    }
  }
}
