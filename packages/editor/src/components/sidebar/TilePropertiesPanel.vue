<script setup lang="ts">
import { ref } from 'vue';
import { useTilesetEditorStore } from '../../stores/tileset-editor';
import { useHistoryStore } from '../../stores/history';
import { editorBus } from '../../events/bus';
import PropertyValueInput from '../common/PropertyValueInput.vue';
import type { DmPropertyType, DmProperty } from '@dimetric/core';

const tilesetEditor = useTilesetEditorStore();
const history = useHistoryStore();

const newPropName = ref('');
const newPropType = ref<DmPropertyType>('string');

const PROPERTY_TYPES: DmPropertyType[] = ['string', 'int', 'float', 'bool', 'color', 'file'];

function getProperties(): DmProperty[] {
  const data = tilesetEditor.activeTileData;
  if (!data?.properties) return [];
  return Object.values(data.properties);
}

function getDefaultValue(type: DmPropertyType): string | number | boolean {
  switch (type) {
    case 'string': case 'file': case 'object': return '';
    case 'int': case 'float': return 0;
    case 'bool': return false;
    case 'color': return '#000000';
  }
}

function addProperty() {
  const name = newPropName.value.trim();
  if (!name || tilesetEditor.selectedLocalId === null) return;

  const localId = tilesetEditor.selectedLocalId;
  const value = getDefaultValue(newPropType.value);
  tilesetEditor.setTileProperty(localId, name, newPropType.value, value);

  history.push({
    type: 'tile-property',
    mapId: '',
    tilesetId: tilesetEditor.activeTileset?.tileset.id ?? '',
    localId,
    property: name,
    oldValue: undefined,
    newValue: { name, type: newPropType.value, value },
  });

  editorBus.emit('map:changed');
  newPropName.value = '';
}

function updateProperty(name: string, type: DmPropertyType, value: string | number | boolean) {
  if (tilesetEditor.selectedLocalId === null) return;
  const localId = tilesetEditor.selectedLocalId;
  const old = tilesetEditor.activeTileData?.properties?.[name];

  tilesetEditor.setTileProperty(localId, name, type, value);

  history.push({
    type: 'tile-property',
    mapId: '',
    tilesetId: tilesetEditor.activeTileset?.tileset.id ?? '',
    localId,
    property: name,
    oldValue: old ? { ...old } : undefined,
    newValue: { name, type, value },
  });

  editorBus.emit('map:changed');
}

function removeProperty(name: string) {
  if (tilesetEditor.selectedLocalId === null) return;
  const localId = tilesetEditor.selectedLocalId;
  const old = tilesetEditor.activeTileData?.properties?.[name];

  tilesetEditor.removeTileProperty(localId, name);

  history.push({
    type: 'tile-property',
    mapId: '',
    tilesetId: tilesetEditor.activeTileset?.tileset.id ?? '',
    localId,
    property: name,
    oldValue: old ? { ...old } : undefined,
    newValue: undefined,
  });

  editorBus.emit('map:changed');
}
</script>

<template>
  <div class="tile-properties-panel">
    <div v-if="tilesetEditor.selectedLocalId === null" class="empty-state">
      Select a tile to edit properties
    </div>
    <template v-else>
      <div class="prop-header">
        <span class="title">Tile #{{ tilesetEditor.selectedLocalId }}</span>
      </div>

      <div class="prop-list">
        <div v-for="prop in getProperties()" :key="prop.name" class="prop-row">
          <span class="prop-name" :title="prop.name">{{ prop.name }}</span>
          <PropertyValueInput
            :type="prop.type"
            :modelValue="prop.value"
            @update:modelValue="updateProperty(prop.name, prop.type, $event)"
          />
          <button class="remove-btn" title="Remove" @click="removeProperty(prop.name)">×</button>
        </div>
      </div>

      <div class="add-prop">
        <input
          v-model="newPropName"
          placeholder="Name"
          class="name-input"
          @keyup.enter="addProperty"
        />
        <select v-model="newPropType" class="type-select">
          <option v-for="t in PROPERTY_TYPES" :key="t" :value="t">{{ t }}</option>
        </select>
        <button class="add-btn" :disabled="!newPropName.trim()" @click="addProperty">+</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tile-properties-panel {
  padding: 8px;
  font-size: 12px;
}

.empty-state {
  color: #888;
  text-align: center;
  padding: 16px 0;
}

.prop-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.title {
  font-weight: bold;
  color: #e0e0e0;
}

.prop-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.prop-row {
  display: grid;
  grid-template-columns: 80px 1fr 20px;
  gap: 4px;
  align-items: center;
}

.prop-name {
  color: #aaa;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  line-height: 1;
}

.remove-btn:hover {
  color: #e74c3c;
}

.add-prop {
  display: grid;
  grid-template-columns: 1fr 70px 24px;
  gap: 4px;
}

.name-input,
.type-select {
  padding: 2px 4px;
  background: #2a2a3e;
  border: 1px solid #444;
  color: #e0e0e0;
  border-radius: 3px;
  font-size: 12px;
}

.add-btn {
  width: 24px;
  height: 24px;
  background: #3498db;
  border: none;
  color: white;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
