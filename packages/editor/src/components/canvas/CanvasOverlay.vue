<template>
  <div class="canvas-overlay">
    <div class="overlay-left">
      <span v-if="hoveredCol !== null">
        {{ hoveredCol }}, {{ hoveredRow }}
      </span>
    </div>
    <div class="overlay-right">
      <span>{{ Math.round(zoom * 100) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useEditorStore } from '../../stores/editor';
import { useCameraStore } from '../../stores/camera';

const { hoveredCol, hoveredRow } = storeToRefs(useEditorStore());
const { zoom } = storeToRefs(useCameraStore());
</script>

<style scoped>
.canvas-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.5);
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-secondary);
  pointer-events: none;
  z-index: 10;
}
</style>
