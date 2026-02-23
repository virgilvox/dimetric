import type { GridCoord } from '@dimetric/core';
import type { Tool } from './tool';
import { useProjectStore } from '../stores/project';
import { useEditorStore } from '../stores/editor';
import { editorBus } from '../events/bus';

export class FillTool implements Tool {
  readonly name = 'fill';

  onPointerDown(coord: GridCoord, button: number): void {
    if (button !== 0) return;
    this.fill(coord);
  }

  onPointerDrag(_coord: GridCoord): void {}
  onPointerUp(_coord: GridCoord, _button: number): void {}
  onHover(_coord: GridCoord): void {}

  private fill(start: GridCoord): void {
    const project = useProjectStore();
    const editor = useEditorStore();
    const map = project.activeMap;
    if (!map || !editor.activeLayerId || editor.selectedGid === 0) return;

    const layer = map.layers.find((l) => l.id === editor.activeLayerId);
    if (!layer || layer.type !== 'tile') return;

    const width = layer.width;
    const height = layer.height;
    const data = layer.data;
    if (start.col < 0 || start.col >= width || start.row < 0 || start.row >= height) return;
    const targetGid = data[start.row * width + start.col];
    const fillGid = editor.selectedGid;
    if (targetGid === fillGid) return;

    // BFS flood fill
    const visited = new Set<number>();
    const queue: GridCoord[] = [start];

    while (queue.length > 0) {
      const { col, row } = queue.shift()!;
      if (col < 0 || col >= width || row < 0 || row >= height) continue;
      const idx = row * width + col;
      if (visited.has(idx)) continue;
      if (data[idx] !== targetGid) continue;

      visited.add(idx);
      data[idx] = fillGid;

      queue.push({ col: col - 1, row });
      queue.push({ col: col + 1, row });
      queue.push({ col, row: row - 1 });
      queue.push({ col, row: row + 1 });
    }

    editorBus.emit('map:changed');
  }
}
