<template>
  <div class="status-bar">
    <div class="status-left">
      <span class="status-tool">
        <SvgIcon :name="editor.toolIconName" :size="12" />
        {{ editor.toolDisplayName }}
      </span>
      <span class="status-sep" />
      <span v-if="editor.hoveredCol !== null" class="status-coords">
        {{ editor.hoveredCol }}, {{ editor.hoveredRow }}
      </span>
      <template v-if="editor.selectedGid > 0">
        <span class="status-sep" />
        <span class="status-gid">GID: {{ baseGid }}</span>
      </template>
    </div>
    <div class="status-right">
      <span v-if="map" class="status-dims">
        {{ map.mapSize.width }} x {{ map.mapSize.height }}
      </span>
      <span class="status-sep" />
      <button class="status-zoom" title="Reset zoom" @click="$emit('reset-zoom')">
        {{ Math.round(zoom * 100) }}%
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { extractGid } from '@dimetric/core';
import { useEditorStore } from '../../stores/editor';
import { useProjectStore } from '../../stores/project';
import { useCameraStore } from '../../stores/camera';
import { SvgIcon } from '../icons';

const editor = useEditorStore();
const project = useProjectStore();
const { zoom } = storeToRefs(useCameraStore());

defineEmits<{ 'reset-zoom': [] }>();

const map = computed(() => project.activeMap);
const baseGid = computed(() => extractGid(editor.selectedGid));
</script>

<style scoped>
.status-bar {
  height: var(--status-bar-height, 24px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-secondary);
  flex-shrink: 0;
  user-select: none;
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-tool {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-primary);
}

.status-sep {
  width: 1px;
  height: 12px;
  background: var(--border-color);
}

.status-coords {
  min-width: 48px;
}

.status-gid {
  color: var(--accent);
}

.status-dims {
  color: var(--text-muted);
}

.status-zoom {
  font: inherit;
  color: var(--text-secondary);
  padding: 1px 4px;
  border-radius: 2px;
}

.status-zoom:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}
</style>
