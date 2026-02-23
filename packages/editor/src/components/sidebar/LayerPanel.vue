<template>
  <div class="layer-panel">
    <div class="panel-header">
      <span>Layers</span>
      <div class="add-layer-wrapper">
        <button class="panel-action" title="Add layer" @click="showAddDropdown = !showAddDropdown"><SvgIcon name="plus" :size="14" /></button>
        <AddLayerDropdown :open="showAddDropdown" @add="onAddLayerType" @close="showAddDropdown = false" />
      </div>
    </div>
    <div v-if="!map" class="panel-empty">No map</div>
    <div v-else class="layer-list">
      <div
        v-for="(layer, idx) in reversedLayers"
        :key="layer.id"
        class="layer-item"
        :class="{
          active: editor.activeLayerId === layer.id,
          'drop-above': dropIndex === idx && dropIndex !== dragIndex && dropIndex !== (dragIndex != null ? dragIndex + 1 : -1),
          'drop-below': dropIndex === idx + 1 && dropIndex !== dragIndex && dropIndex !== (dragIndex != null ? dragIndex + 1 : -1) && idx === reversedLayers.length - 1,
        }"
        draggable="true"
        @click="editor.setActiveLayer(layer.id)"
        @contextmenu.prevent
        @dragstart="onDragStart(idx, $event)"
        @dragover.prevent="onDragOver(idx, $event)"
        @dragleave="onDragLeave"
        @drop="onDrop(idx)"
        @dragend="onDragEnd"
      >
        <button
          class="layer-vis"
          :class="{ hidden: !layer.visible }"
          :title="layer.visible ? 'Hide' : 'Show'"
          @click.stop="toggleVisible(layer.id, layer.visible)"
        >
          <SvgIcon :name="layer.visible ? 'eye' : 'eye-off'" :size="14" />
        </button>
        <button
          class="layer-lock"
          :class="{ locked: layer.locked }"
          :title="layer.locked ? 'Unlock' : 'Lock'"
          @click.stop="toggleLocked(layer.id, layer.locked)"
        >
          <SvgIcon :name="layer.locked ? 'lock' : 'unlock'" :size="14" />
        </button>
        <SvgIcon :name="layerTypeIcon(layer.type)" :size="14" class="layer-type-icon" />
        <input
          v-if="renamingLayerId === layer.id"
          class="layer-name-input"
          :value="layer.name"
          @blur="finishRename($event, layer.id)"
          @keydown.enter="($event.target as HTMLInputElement).blur()"
          @keydown.escape="cancelRename"
          @click.stop
          ref="renameInputRef"
        />
        <span
          v-else
          class="layer-name"
          @dblclick.stop="startRename(layer.id)"
        >{{ layer.name }}</span>
        <button
          class="layer-delete"
          title="Delete layer"
          @click.stop="removeLayer(layer.id)"
        >
          <SvgIcon name="trash" :size="14" />
        </button>
      </div>
      <!-- Opacity slider for selected layer -->
      <div v-if="activeLayer" class="layer-opacity">
        <label>Opacity</label>
        <input
          type="range"
          min="0"
          max="100"
          :value="Math.round(activeLayer.opacity * 100)"
          @input="onOpacityChange"
        />
        <span class="opacity-value">{{ Math.round(activeLayer.opacity * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import type { DmLayerType } from '@dimetric/core';
import { useProjectStore } from '../../stores/project';
import { useEditorStore } from '../../stores/editor';
import { useHistoryStore } from '../../stores/history';
import { editorBus } from '../../events/bus';
import { SvgIcon } from '../icons';
import AddLayerDropdown from './AddLayerDropdown.vue';

const project = useProjectStore();
const editor = useEditorStore();
const history = useHistoryStore();

const map = computed(() => project.activeMap);
const reversedLayers = computed(() => {
  if (!map.value) return [];
  return [...map.value.layers].reverse();
});

const activeLayer = computed(() => {
  if (!map.value || !editor.activeLayerId) return null;
  return map.value.layers.find((l) => l.id === editor.activeLayerId) ?? null;
});

// --- Add layer dropdown ---
const showAddDropdown = ref(false);

function layerTypeIcon(type: string): string {
  switch (type) {
    case 'tile': return 'grid-tile';
    case 'object': return 'shapes';
    case 'image': return 'image';
    case 'group': return 'folder';
    default: return 'layers';
  }
}

function onAddLayerType(type: DmLayerType) {
  showAddDropdown.value = false;
  if (!map.value) return;

  let layer = null;
  switch (type) {
    case 'tile':
      layer = project.addLayer(map.value.id);
      break;
    case 'object':
      layer = project.addObjectLayer(map.value.id);
      break;
    case 'image':
      layer = project.addImageLayer(map.value.id, '');
      break;
    case 'group':
      layer = project.addGroupLayer(map.value.id);
      break;
  }

  if (layer) {
    const idx = map.value.layers.indexOf(layer);
    history.push({ type: 'layer-add', mapId: map.value.id, layer, index: idx });
    editor.setActiveLayer(layer.id);
    editorBus.emit('map:changed');
  }
}

// --- Drag and drop reorder ---
const dragIndex = ref<number | null>(null);
const dropIndex = ref<number | null>(null);

function onDragStart(idx: number, event: DragEvent) {
  dragIndex.value = idx;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(idx));
  }
}

function onDragOver(idx: number, event: DragEvent) {
  if (dragIndex.value === null) return;
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  // Determine if we're in the top or bottom half of the item
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const midY = rect.top + rect.height / 2;
  if (event.clientY < midY) {
    dropIndex.value = idx;
  } else {
    dropIndex.value = idx + 1;
  }
}

function onDragLeave() {
  // Don't clear immediately -- let dragover on next element set it
}

function onDrop(idx: number) {
  if (dragIndex.value === null || dropIndex.value === null || !map.value) {
    onDragEnd();
    return;
  }

  // Convert reversed indices to actual layer array indices
  const totalLayers = map.value.layers.length;
  const fromActual = totalLayers - 1 - dragIndex.value;
  let toActual = totalLayers - dropIndex.value;

  // Clamp
  toActual = Math.max(0, Math.min(totalLayers - 1, toActual));

  // Adjust: if moving down in original array, account for splice shift
  if (fromActual !== toActual) {
    if (fromActual < toActual) {
      toActual = Math.min(totalLayers - 1, toActual);
    }
    history.push({ type: 'layer-reorder', mapId: map.value.id, fromIndex: fromActual, toIndex: toActual });
    project.reorderLayer(map.value.id, fromActual, toActual);
    editorBus.emit('map:changed');
  }

  onDragEnd();
}

function onDragEnd() {
  dragIndex.value = null;
  dropIndex.value = null;
}

// --- Rename ---
const renamingLayerId = ref<string | null>(null);
const renameInputRef = ref<HTMLInputElement[]>([]);

function startRename(layerId: string) {
  renamingLayerId.value = layerId;
  nextTick(() => {
    const inputs = renameInputRef.value;
    if (inputs && inputs.length > 0) {
      inputs[0].focus();
      inputs[0].select();
    }
  });
}

function finishRename(event: Event, layerId: string) {
  const input = event.target as HTMLInputElement;
  const newName = input.value.trim();
  if (newName && map.value) {
    const layer = map.value.layers.find((l) => l.id === layerId);
    const oldName = layer?.name ?? '';
    if (newName !== oldName) {
      history.push({ type: 'layer-property', mapId: map.value.id, layerId, property: 'name', oldValue: oldName, newValue: newName });
      project.renameLayer(map.value.id, layerId, newName);
      editorBus.emit('map:changed');
    }
  }
  renamingLayerId.value = null;
}

function cancelRename() {
  renamingLayerId.value = null;
}

// --- Lock ---
function toggleLocked(layerId: string, current: boolean) {
  if (!map.value) return;
  project.setLayerLocked(map.value.id, layerId, !current);
  editorBus.emit('map:changed');
}

// --- Opacity ---
let opacityBeforeSlide: number | null = null;

function onOpacityChange(event: Event) {
  if (!map.value || !editor.activeLayerId) return;
  const value = parseInt((event.target as HTMLInputElement).value, 10);
  const layer = map.value.layers.find((l) => l.id === editor.activeLayerId);
  if (!layer) return;

  if (opacityBeforeSlide === null) opacityBeforeSlide = layer.opacity;
  const newOpacity = value / 100;
  layer.opacity = newOpacity;

  // Debounce history push: record final value on next tick idle
  clearTimeout(opacityTimer);
  opacityTimer = setTimeout(() => {
    if (opacityBeforeSlide !== null && map.value && editor.activeLayerId) {
      history.push({ type: 'layer-property', mapId: map.value.id, layerId: editor.activeLayerId, property: 'opacity', oldValue: opacityBeforeSlide, newValue: newOpacity });
      opacityBeforeSlide = null;
    }
  }, 300);

  editorBus.emit('map:changed');
}
let opacityTimer: ReturnType<typeof setTimeout>;

function removeLayer(layerId: string) {
  if (!map.value) return;
  if (map.value.layers.length <= 1) return; // keep at least one
  const idx = map.value.layers.findIndex((l) => l.id === layerId);
  const layer = map.value.layers[idx];
  if (idx === -1 || !layer) return;
  history.push({ type: 'layer-remove', mapId: map.value.id, layer, index: idx });
  project.removeLayer(map.value.id, layerId);
  if (editor.activeLayerId === layerId && map.value.layers.length > 0) {
    editor.setActiveLayer(map.value.layers[0].id);
  }
  editorBus.emit('map:changed');
}

function toggleVisible(layerId: string, current: boolean) {
  if (!map.value) return;
  project.setLayerVisible(map.value.id, layerId, !current);
  editorBus.emit('map:changed');
}
</script>

<style scoped>
.layer-panel {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px var(--panel-padding);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.add-layer-wrapper {
  position: relative;
}

.panel-action {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text-secondary);
}

.panel-action:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.panel-empty {
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
}

.layer-list {
  overflow-y: auto;
  flex: 1;
}

.layer-item {
  display: flex;
  align-items: center;
  padding: 4px var(--panel-padding);
  gap: 6px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  border-top: 2px solid transparent;
}

.layer-item:hover {
  background: var(--bg-hover);
}

.layer-item.active {
  background: var(--bg-active);
}

.layer-item.drop-above {
  border-top: 2px solid var(--accent);
}

.layer-item.drop-below {
  border-bottom: 2px solid var(--accent);
}

.layer-vis,
.layer-lock {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.layer-vis:hover,
.layer-lock:hover {
  background: var(--bg-hover);
}

.layer-vis.hidden,
.layer-lock:not(.locked) {
  color: var(--text-muted);
}

.layer-lock.locked {
  color: var(--accent);
}

.layer-type-icon {
  flex-shrink: 0;
  color: var(--text-muted);
}

.layer-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.layer-name-input {
  flex: 1;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--accent);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 12px;
  outline: none;
  min-width: 0;
}

.layer-delete {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--text-muted);
  flex-shrink: 0;
  opacity: 0;
}

.layer-item:hover .layer-delete {
  opacity: 1;
}

.layer-delete:hover {
  background: var(--danger);
  color: white;
}

.layer-opacity {
  display: flex;
  align-items: center;
  padding: 6px var(--panel-padding);
  gap: 6px;
  border-top: 1px solid var(--border-color);
  font-size: 11px;
  color: var(--text-secondary);
}

.layer-opacity label {
  flex-shrink: 0;
}

.layer-opacity input[type="range"] {
  flex: 1;
  min-width: 0;
  height: 4px;
  accent-color: var(--accent);
}

.opacity-value {
  flex-shrink: 0;
  width: 32px;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 10px;
}
</style>
