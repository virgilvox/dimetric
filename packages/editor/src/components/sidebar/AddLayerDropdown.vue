<template>
  <div v-if="open" class="add-layer-backdrop" @click="$emit('close')">
    <div class="add-layer-dropdown" @click.stop>
      <button class="dropdown-item" @click="$emit('add', 'tile')">
        <SvgIcon name="grid-tile" :size="14" /> Tile Layer
      </button>
      <button class="dropdown-item" @click="$emit('add', 'object')">
        <SvgIcon name="shapes" :size="14" /> Object Layer
      </button>
      <button class="dropdown-item" @click="$emit('add', 'image')">
        <SvgIcon name="image" :size="14" /> Image Layer
      </button>
      <button class="dropdown-item" @click="$emit('add', 'group')">
        <SvgIcon name="folder" :size="14" /> Group Layer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DmLayerType } from '@dimetric/core';
import { SvgIcon } from '../icons';

defineProps<{
  open: boolean;
}>();

defineEmits<{
  add: [type: DmLayerType];
  close: [];
}>();
</script>

<style scoped>
.add-layer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 49;
}

.add-layer-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 50;
  min-width: 150px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  padding: 4px 0;
  display: flex;
  flex-direction: column;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 12px;
  color: var(--text-primary);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
}

.dropdown-item:hover {
  background: var(--bg-hover);
}
</style>
