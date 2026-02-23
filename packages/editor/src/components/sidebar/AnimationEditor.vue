<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useTilesetEditorStore } from '../../stores/tileset-editor';
import { useAnimationPreview } from '../../composables/use-animation-preview';
import { editorBus } from '../../events/bus';
import type { DmTileAnimationFrame } from '@dimetric/core';

const tilesetEditor = useTilesetEditorStore();
const preview = useAnimationPreview();

const frames = ref<DmTileAnimationFrame[]>([]);

// Sync frames when tile selection changes
watch(() => tilesetEditor.activeTileData, (data) => {
  frames.value = data?.animation ? data.animation.map(f => ({ ...f })) : [];
  preview.stop();
}, { immediate: true });

const currentPreviewTileId = computed(() => {
  if (!preview.isPlaying.value || frames.value.length === 0) return null;
  return frames.value[preview.currentFrameIndex.value]?.tileId ?? null;
});

function addFrame() {
  if (tilesetEditor.selectedLocalId === null) return;
  frames.value.push({
    tileId: tilesetEditor.selectedLocalId,
    duration: 100,
  });
  save();
}

function removeFrame(index: number) {
  frames.value.splice(index, 1);
  save();
}

function updateFrameTileId(index: number, value: string) {
  frames.value[index].tileId = parseInt(value, 10) || 0;
  save();
}

function updateFrameDuration(index: number, value: string) {
  frames.value[index].duration = Math.max(1, parseInt(value, 10) || 100);
  save();
}

function save() {
  if (tilesetEditor.selectedLocalId === null) return;
  tilesetEditor.setAnimationFrames(tilesetEditor.selectedLocalId, [...frames.value]);
  editorBus.emit('map:changed');
}

function togglePreview() {
  preview.toggle(frames.value);
}
</script>

<template>
  <div class="animation-editor">
    <div v-if="tilesetEditor.selectedLocalId === null" class="empty-state">
      Select a tile to edit animation
    </div>
    <template v-else>
      <div class="header">
        <span>Frames ({{ frames.length }})</span>
        <div class="header-actions">
          <button
            :disabled="frames.length < 2"
            :class="{ playing: preview.isPlaying.value }"
            @click="togglePreview"
          >
            {{ preview.isPlaying.value ? 'Stop' : 'Play' }}
          </button>
          <button @click="addFrame">+ Frame</button>
        </div>
      </div>

      <div v-if="currentPreviewTileId !== null" class="preview-info">
        Frame {{ preview.currentFrameIndex.value + 1 }} / {{ frames.length }}
        (tile {{ currentPreviewTileId }})
      </div>

      <div class="frame-list">
        <div v-for="(frame, i) in frames" :key="i" class="frame-row">
          <span class="frame-index">#{{ i + 1 }}</span>
          <label class="frame-field">
            <span>Tile</span>
            <input
              type="number"
              :value="frame.tileId"
              min="0"
              class="frame-input"
              @input="updateFrameTileId(i, ($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="frame-field">
            <span>ms</span>
            <input
              type="number"
              :value="frame.duration"
              min="1"
              step="10"
              class="frame-input"
              @input="updateFrameDuration(i, ($event.target as HTMLInputElement).value)"
            />
          </label>
          <button class="remove-btn" @click="removeFrame(i)">×</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.animation-editor {
  padding: 8px;
  font-size: 12px;
}

.empty-state {
  color: #888;
  text-align: center;
  padding: 16px 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: #e0e0e0;
  font-weight: bold;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.header-actions button {
  padding: 2px 8px;
  background: #2a2a3e;
  border: 1px solid #444;
  color: #e0e0e0;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
}

.header-actions button.playing {
  background: #e74c3c;
  border-color: #e74c3c;
}

.preview-info {
  color: #3498db;
  margin-bottom: 8px;
  font-style: italic;
}

.frame-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.frame-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: #2a2a3e;
  border-radius: 3px;
}

.frame-index {
  color: #888;
  width: 24px;
}

.frame-field {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #aaa;
}

.frame-input {
  width: 50px;
  padding: 2px 4px;
  background: #1a1a2e;
  border: 1px solid #444;
  color: #e0e0e0;
  border-radius: 3px;
  font-size: 12px;
}

.remove-btn {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 14px;
}

.remove-btn:hover {
  color: #e74c3c;
}
</style>
