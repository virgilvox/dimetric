import type { GridCoord } from '@dimetric/core';
import type { Tool } from './tool';
import { useProjectStore } from '../stores/project';
import { useEditorStore } from '../stores/editor';
import { useTilesetEditorStore } from '../stores/tileset-editor';
import { useHistoryStore } from '../stores/history';
import { editorBus } from '../events/bus';
import { paintTerrain } from '../terrain/wang-resolver';

/**
 * Terrain tool: paints terrain colors using wang set rules.
 * Uses the active wang set and selected color from the tileset editor store.
 */
export class TerrainTool implements Tool {
  readonly name = 'terrain';

  private terrainMap: Uint8Array | null = null;
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
    // Could show terrain preview in future
  }

  onActivate(): void {
    this.buildTerrainMap();
  }

  onDeactivate(): void {
    this.terrainMap = null;
    this.painting = false;
  }

  private buildTerrainMap(): void {
    const project = useProjectStore();
    const editor = useEditorStore();
    const map = project.activeMap;
    if (!map) return;

    const layer = map.layers.find(l => l.id === editor.activeLayerId);
    if (!layer || layer.type !== 'tile') return;

    const w = map.mapSize.width;
    const h = map.mapSize.height;
    this.terrainMap = new Uint8Array(w * h);
    // Initialize terrain map to 0 (no terrain)
  }

  private paint(coord: GridCoord): void {
    const project = useProjectStore();
    const editor = useEditorStore();
    const tilesetEditor = useTilesetEditorStore();
    const history = useHistoryStore();

    const map = project.activeMap;
    if (!map) return;

    const layer = map.layers.find(l => l.id === editor.activeLayerId);
    if (!layer || layer.type !== 'tile') return;

    const ts = tilesetEditor.activeTileset;
    if (!ts?.tileset.wangSets?.length) return;

    const wangSet = ts.tileset.wangSets[0]; // Use first wang set
    const colorIndex = 1; // Default to first color

    const w = map.mapSize.width;
    const h = map.mapSize.height;

    if (!this.terrainMap) {
      this.terrainMap = new Uint8Array(w * h);
    }

    if (coord.col < 0 || coord.col >= w || coord.row < 0 || coord.row >= h) return;

    const changes = paintTerrain(coord.col, coord.row, colorIndex, wangSet, this.terrainMap, w, h);

    history.beginBatch(map.id, layer.id);

    for (const change of changes) {
      const oldGid = project.getTile(map.id, layer.id, change.col, change.row) ?? 0;
      const newGid = ts.firstGid + change.tileId;
      if (oldGid !== newGid) {
        project.setTile(map.id, layer.id, change.col, change.row, newGid);
        history.addToBatch(change.col, change.row, oldGid, newGid);
      }
    }

    history.endBatch();
    editorBus.emit('map:changed');
  }
}
