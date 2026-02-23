import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useProjectStore } from './project';
import { useEditorStore } from './editor';
import type { DmTileData, DmPropertyType, DmCollisionShape, DmTileAnimationFrame } from '@dimetric/core';

export type TilesetEditMode = 'properties' | 'collision' | 'animation' | 'terrain';

export const useTilesetEditorStore = defineStore('tileset-editor', () => {
  const selectedLocalId = ref<number | null>(null);
  const editMode = ref<TilesetEditMode>('properties');

  const project = useProjectStore();
  const editor = useEditorStore();

  const activeTileset = computed(() => {
    const map = project.activeMap;
    if (!map || map.tilesets.length === 0) return null;
    // Find tileset that contains the selected GID
    const gid = editor.selectedGid;
    for (let i = map.tilesets.length - 1; i >= 0; i--) {
      const ref = map.tilesets[i];
      if (gid >= ref.firstGid) return ref;
    }
    return map.tilesets[0];
  });

  const activeTileData = computed<DmTileData | null>(() => {
    if (selectedLocalId.value === null || !activeTileset.value) return null;
    return activeTileset.value.tileset.tiles[selectedLocalId.value] ?? null;
  });

  function ensureTileData(localId: number): DmTileData {
    const ts = activeTileset.value;
    if (!ts) throw new Error('No active tileset');
    if (!ts.tileset.tiles[localId]) {
      ts.tileset.tiles[localId] = { localId };
    }
    return ts.tileset.tiles[localId];
  }

  function setTileProperty(localId: number, name: string, type: DmPropertyType, value: string | number | boolean): void {
    const tile = ensureTileData(localId);
    if (!tile.properties) tile.properties = {};
    tile.properties[name] = { name, type, value };
  }

  function removeTileProperty(localId: number, name: string): void {
    const tile = ensureTileData(localId);
    if (tile.properties) {
      delete tile.properties[name];
    }
  }

  function setCollisionShapes(localId: number, shapes: DmCollisionShape[]): void {
    const tile = ensureTileData(localId);
    tile.collision = shapes;
  }

  function setAnimationFrames(localId: number, frames: DmTileAnimationFrame[]): void {
    const tile = ensureTileData(localId);
    tile.animation = frames.length > 0 ? frames : undefined;
  }

  function selectTile(localId: number | null): void {
    selectedLocalId.value = localId;
  }

  function setEditMode(mode: TilesetEditMode): void {
    editMode.value = mode;
  }

  return {
    selectedLocalId,
    editMode,
    activeTileset,
    activeTileData,
    ensureTileData,
    setTileProperty,
    removeTileProperty,
    setCollisionShapes,
    setAnimationFrames,
    selectTile,
    setEditMode,
  };
});
