<template>
  <div class="layer-panel">
    <div class="panel-header">
      <span>Layers</span>
      <button class="panel-action" title="Add layer" @click="addLayer">+</button>
    </div>
    <div v-if="!map" class="panel-empty">No map</div>
    <div v-else class="layer-list">
      <div
        v-for="layer in reversedLayers"
        :key="layer.id"
        class="layer-item"
        :class="{ active: editor.activeLayerId === layer.id }"
        @click="editor.setActiveLayer(layer.id)"
      >
        <button
          class="layer-vis"
          :class="{ hidden: !layer.visible }"
          :title="layer.visible ? 'Hide' : 'Show'"
          @click.stop="toggleVisible(layer.id, layer.visible)"
        >
          {{ layer.visible ? 'V' : '-' }}
        </button>
        <span class="layer-name">{{ layer.name }}</span>
        <button
          class="layer-delete"
          title="Delete layer"
          @click.stop="removeLayer(layer.id)"
        >
          x
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useProjectStore } from '../../stores/project';
import { useEditorStore } from '../../stores/editor';
import { editorBus } from '../../events/bus';

const project = useProjectStore();
const editor = useEditorStore();

const map = computed(() => project.activeMap);
const reversedLayers = computed(() => {
  if (!map.value) return [];
  return [...map.value.layers].reverse();
});

function addLayer() {
  if (!map.value) return;
  const layer = project.addLayer(map.value.id);
  if (layer) {
    editor.setActiveLayer(layer.id);
    editorBus.emit('map:changed');
  }
}

function removeLayer(layerId: string) {
  if (!map.value) return;
  if (map.value.layers.length <= 1) return; // keep at least one
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
  max-height: 250px;
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
}

.layer-item:hover {
  background: var(--bg-hover);
}

.layer-item.active {
  background: var(--bg-active);
}

.layer-vis {
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

.layer-vis:hover {
  background: var(--bg-hover);
}

.layer-vis.hidden {
  color: var(--text-muted);
}

.layer-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
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
</style>
