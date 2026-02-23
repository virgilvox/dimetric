import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useProjectStore } from './project';
import type { DmTileLayer, DmLayer, DmProperty, DmCollisionShape, DmTileAnimationFrame } from '@dimetric/core';

// --- Entry types ---

export interface TileChange {
  col: number;
  row: number;
  oldGid: number;
  newGid: number;
}

export interface TileMutationEntry {
  type: 'tile-mutation';
  mapId: string;
  layerId: string;
  changes: TileChange[];
}

export interface LayerAddEntry {
  type: 'layer-add';
  mapId: string;
  layer: DmLayer;
  index: number;
}

export interface LayerRemoveEntry {
  type: 'layer-remove';
  mapId: string;
  layer: DmLayer;
  index: number;
}

export interface LayerPropertyEntry {
  type: 'layer-property';
  mapId: string;
  layerId: string;
  property: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface TilePropertyEntry {
  type: 'tile-property';
  mapId: string;
  tilesetId: string;
  localId: number;
  property: string;
  oldValue: DmProperty | undefined;
  newValue: DmProperty | undefined;
}

export interface CollisionShapeEntry {
  type: 'collision-shape';
  mapId: string;
  tilesetId: string;
  localId: number;
  oldShapes: DmCollisionShape[];
  newShapes: DmCollisionShape[];
}

export interface AnimationFrameEntry {
  type: 'animation-frame';
  mapId: string;
  tilesetId: string;
  localId: number;
  oldFrames: DmTileAnimationFrame[];
  newFrames: DmTileAnimationFrame[];
}

export interface LayerReorderEntry {
  type: 'layer-reorder';
  mapId: string;
  fromIndex: number;
  toIndex: number;
}

export type HistoryEntry =
  | TileMutationEntry
  | LayerAddEntry
  | LayerRemoveEntry
  | LayerPropertyEntry
  | TilePropertyEntry
  | CollisionShapeEntry
  | AnimationFrameEntry
  | LayerReorderEntry;

const MAX_HISTORY = 100;

export const useHistoryStore = defineStore('history', () => {
  const undoStack = ref<HistoryEntry[]>([]);
  const redoStack = ref<HistoryEntry[]>([]);

  const canUndo = computed(() => undoStack.value.length > 0);
  const canRedo = computed(() => redoStack.value.length > 0);

  // Batch accumulator for tile mutations (brush/eraser strokes)
  let batchMapId: string | null = null;
  let batchLayerId: string | null = null;
  let batchChanges: TileChange[] = [];

  function push(entry: HistoryEntry): void {
    undoStack.value.push(entry);
    if (undoStack.value.length > MAX_HISTORY) {
      undoStack.value.shift();
    }
    // New action clears redo
    redoStack.value = [];
  }

  function beginBatch(mapId: string, layerId: string): void {
    batchMapId = mapId;
    batchLayerId = layerId;
    batchChanges = [];
  }

  function addToBatch(col: number, row: number, oldGid: number, newGid: number): void {
    if (oldGid === newGid) return;
    batchChanges.push({ col, row, oldGid, newGid });
  }

  function endBatch(): void {
    if (batchChanges.length > 0 && batchMapId && batchLayerId) {
      push({
        type: 'tile-mutation',
        mapId: batchMapId,
        layerId: batchLayerId,
        changes: [...batchChanges],
      });
    }
    batchMapId = null;
    batchLayerId = null;
    batchChanges = [];
  }

  function undo(): void {
    const entry = undoStack.value.pop();
    if (!entry) return;
    applyReverse(entry);
    redoStack.value.push(entry);
  }

  function redo(): void {
    const entry = redoStack.value.pop();
    if (!entry) return;
    applyForward(entry);
    undoStack.value.push(entry);
  }

  function clear(): void {
    undoStack.value = [];
    redoStack.value = [];
    batchMapId = null;
    batchLayerId = null;
    batchChanges = [];
  }

  function applyForward(entry: HistoryEntry): void {
    const project = useProjectStore();
    switch (entry.type) {
      case 'tile-mutation': {
        const map = project.maps.find((m) => m.id === entry.mapId);
        if (!map) return;
        const layer = map.layers.find((l) => l.id === entry.layerId) as DmTileLayer | undefined;
        if (!layer || layer.type !== 'tile') return;
        for (const c of entry.changes) {
          const idx = c.row * layer.width + c.col;
          layer.data[idx] = c.newGid;
        }
        break;
      }
      case 'layer-add': {
        const map = project.maps.find((m) => m.id === entry.mapId);
        if (!map) return;
        map.layers.splice(entry.index, 0, entry.layer);
        break;
      }
      case 'layer-remove': {
        const map = project.maps.find((m) => m.id === entry.mapId);
        if (!map) return;
        const idx = map.layers.findIndex((l) => l.id === entry.layer.id);
        if (idx !== -1) map.layers.splice(idx, 1);
        break;
      }
      case 'layer-property': {
        const map = project.maps.find((m) => m.id === entry.mapId);
        if (!map) return;
        const layer = map.layers.find((l) => l.id === entry.layerId);
        if (layer) (layer as any)[entry.property] = entry.newValue;
        break;
      }
      case 'tile-property': {
        const map = project.maps.find((m) => m.id === entry.mapId);
        const tsRef = map?.tilesets.find((r) => r.tileset.id === entry.tilesetId) ??
          project.maps.flatMap(m => m.tilesets).find(r => r.tileset.id === entry.tilesetId);
        if (!tsRef) return;
        const tile = tsRef.tileset.tiles[entry.localId] ?? (tsRef.tileset.tiles[entry.localId] = { localId: entry.localId });
        if (!tile.properties) tile.properties = {};
        if (entry.newValue) {
          tile.properties[entry.property] = entry.newValue;
        } else {
          delete tile.properties[entry.property];
        }
        break;
      }
      case 'collision-shape': {
        const tsRef = project.maps.flatMap(m => m.tilesets).find(r => r.tileset.id === entry.tilesetId);
        if (!tsRef) return;
        const tile = tsRef.tileset.tiles[entry.localId] ?? (tsRef.tileset.tiles[entry.localId] = { localId: entry.localId });
        tile.collision = entry.newShapes.length > 0 ? [...entry.newShapes] : undefined;
        break;
      }
      case 'animation-frame': {
        const tsRef = project.maps.flatMap(m => m.tilesets).find(r => r.tileset.id === entry.tilesetId);
        if (!tsRef) return;
        const tile = tsRef.tileset.tiles[entry.localId] ?? (tsRef.tileset.tiles[entry.localId] = { localId: entry.localId });
        tile.animation = entry.newFrames.length > 0 ? [...entry.newFrames] : undefined;
        break;
      }
      case 'layer-reorder': {
        const map = project.maps.find((m) => m.id === entry.mapId);
        if (!map) return;
        const [layer] = map.layers.splice(entry.fromIndex, 1);
        map.layers.splice(entry.toIndex, 0, layer);
        break;
      }
    }
  }

  function applyReverse(entry: HistoryEntry): void {
    const project = useProjectStore();
    switch (entry.type) {
      case 'tile-mutation': {
        const map = project.maps.find((m) => m.id === entry.mapId);
        if (!map) return;
        const layer = map.layers.find((l) => l.id === entry.layerId) as DmTileLayer | undefined;
        if (!layer || layer.type !== 'tile') return;
        // Apply in reverse order
        for (let i = entry.changes.length - 1; i >= 0; i--) {
          const c = entry.changes[i];
          const idx = c.row * layer.width + c.col;
          layer.data[idx] = c.oldGid;
        }
        break;
      }
      case 'layer-add': {
        // Reverse of add = remove
        const map = project.maps.find((m) => m.id === entry.mapId);
        if (!map) return;
        const idx = map.layers.findIndex((l) => l.id === entry.layer.id);
        if (idx !== -1) map.layers.splice(idx, 1);
        break;
      }
      case 'layer-remove': {
        // Reverse of remove = add back at original index
        const map = project.maps.find((m) => m.id === entry.mapId);
        if (!map) return;
        map.layers.splice(entry.index, 0, entry.layer);
        break;
      }
      case 'layer-property': {
        const map = project.maps.find((m) => m.id === entry.mapId);
        if (!map) return;
        const layer = map.layers.find((l) => l.id === entry.layerId);
        if (layer) (layer as any)[entry.property] = entry.oldValue;
        break;
      }
      case 'tile-property': {
        const map = project.maps.find((m) => m.id === entry.mapId);
        const tsRef = map?.tilesets.find((r) => r.tileset.id === entry.tilesetId) ??
          project.maps.flatMap(m => m.tilesets).find(r => r.tileset.id === entry.tilesetId);
        if (!tsRef) return;
        const tile = tsRef.tileset.tiles[entry.localId] ?? (tsRef.tileset.tiles[entry.localId] = { localId: entry.localId });
        if (!tile.properties) tile.properties = {};
        if (entry.oldValue) {
          tile.properties[entry.property] = entry.oldValue;
        } else {
          delete tile.properties[entry.property];
        }
        break;
      }
      case 'collision-shape': {
        const tsRef = project.maps.flatMap(m => m.tilesets).find(r => r.tileset.id === entry.tilesetId);
        if (!tsRef) return;
        const tile = tsRef.tileset.tiles[entry.localId] ?? (tsRef.tileset.tiles[entry.localId] = { localId: entry.localId });
        tile.collision = entry.oldShapes.length > 0 ? [...entry.oldShapes] : undefined;
        break;
      }
      case 'animation-frame': {
        const tsRef = project.maps.flatMap(m => m.tilesets).find(r => r.tileset.id === entry.tilesetId);
        if (!tsRef) return;
        const tile = tsRef.tileset.tiles[entry.localId] ?? (tsRef.tileset.tiles[entry.localId] = { localId: entry.localId });
        tile.animation = entry.oldFrames.length > 0 ? [...entry.oldFrames] : undefined;
        break;
      }
      case 'layer-reorder': {
        const map = project.maps.find((m) => m.id === entry.mapId);
        if (!map) return;
        const [layer] = map.layers.splice(entry.toIndex, 1);
        map.layers.splice(entry.fromIndex, 0, layer);
        break;
      }
    }
  }

  return {
    undoStack,
    redoStack,
    canUndo,
    canRedo,
    push,
    beginBatch,
    addToBatch,
    endBatch,
    undo,
    redo,
    clear,
  };
});
