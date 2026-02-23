import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  createMap,
  createTileset,
  createTileLayer,
  type DmMap,
  type DmTileset,
  type DmTilesetRef,
  type DmTileLayer,
  type DmLayer,
  type Size,
  type CreateMapOptions,
  type CreateTilesetOptions,
  PROJECT_VERSION,
} from '@dimetric/core';

export const useProjectStore = defineStore('project', () => {
  const maps = ref<DmMap[]>([]);
  const tilesets = ref<DmTileset[]>([]);
  const activeMapId = ref<string | null>(null);
  const projectName = ref('Untitled Project');
  const projectVersion = ref(PROJECT_VERSION);

  const activeMap = computed(() =>
    maps.value.find((m) => m.id === activeMapId.value) ?? null,
  );

  function newMap(options?: CreateMapOptions): DmMap {
    const map = createMap(options);
    maps.value.push(map);
    activeMapId.value = map.id;
    return map;
  }

  function addTileset(options: CreateTilesetOptions): DmTileset {
    const ts = createTileset(options);
    tilesets.value.push(ts);

    // Add to all maps as a tileset ref
    for (const map of maps.value) {
      const firstGid = getNextFirstGid(map);
      map.tilesets.push({ firstGid, tileset: ts });
    }

    return ts;
  }

  function getNextFirstGid(map: DmMap): number {
    if (map.tilesets.length === 0) return 1;
    const last = map.tilesets[map.tilesets.length - 1];
    return last.firstGid + last.tileset.tileCount;
  }

  function setTile(
    mapId: string,
    layerId: string,
    col: number,
    row: number,
    gid: number,
  ): void {
    const map = maps.value.find((m) => m.id === mapId);
    if (!map) return;
    const layer = map.layers.find((l) => l.id === layerId);
    if (!layer || layer.type !== 'tile') return;
    const tileLayer = layer as DmTileLayer;
    if (col < 0 || col >= tileLayer.width || row < 0 || row >= tileLayer.height) return;
    const idx = row * tileLayer.width + col;
    tileLayer.data[idx] = gid;
  }

  function getTile(mapId: string, layerId: string, col: number, row: number): number {
    const map = maps.value.find((m) => m.id === mapId);
    if (!map) return 0;
    const layer = map.layers.find((l) => l.id === layerId);
    if (!layer || layer.type !== 'tile') return 0;
    const tileLayer = layer as DmTileLayer;
    if (col < 0 || col >= tileLayer.width || row < 0 || row >= tileLayer.height) return 0;
    return tileLayer.data[row * tileLayer.width + col];
  }

  function addLayer(mapId: string, name?: string): DmTileLayer | null {
    const map = maps.value.find((m) => m.id === mapId);
    if (!map) return null;
    const layer = createTileLayer({
      name: name ?? `Layer ${map.layers.length + 1}`,
      width: map.mapSize.width,
      height: map.mapSize.height,
    });
    map.layers.push(layer);
    return layer;
  }

  function removeLayer(mapId: string, layerId: string): void {
    const map = maps.value.find((m) => m.id === mapId);
    if (!map) return;
    const idx = map.layers.findIndex((l) => l.id === layerId);
    if (idx !== -1) map.layers.splice(idx, 1);
  }

  function setLayerVisible(mapId: string, layerId: string, visible: boolean): void {
    const map = maps.value.find((m) => m.id === mapId);
    if (!map) return;
    const layer = map.layers.find((l) => l.id === layerId);
    if (layer) layer.visible = visible;
  }

  function setLayerLocked(mapId: string, layerId: string, locked: boolean): void {
    const map = maps.value.find((m) => m.id === mapId);
    if (!map) return;
    const layer = map.layers.find((l) => l.id === layerId);
    if (layer) layer.locked = locked;
  }

  function renameLayer(mapId: string, layerId: string, name: string): void {
    const map = maps.value.find((m) => m.id === mapId);
    if (!map) return;
    const layer = map.layers.find((l) => l.id === layerId);
    if (layer) layer.name = name;
  }

  function $reset(): void {
    maps.value = [];
    tilesets.value = [];
    activeMapId.value = null;
    projectName.value = 'Untitled Project';
  }

  return {
    maps,
    tilesets,
    activeMapId,
    activeMap,
    projectName,
    projectVersion,
    newMap,
    addTileset,
    setTile,
    getTile,
    addLayer,
    removeLayer,
    setLayerVisible,
    setLayerLocked,
    renameLayer,
    $reset,
  };
});
