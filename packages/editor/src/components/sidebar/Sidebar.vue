<template>
  <div class="sidebar">
    <TilesetPanel @textures-loaded="$emit('texturesLoaded', $event)" />
    <LayerPanel />
  </div>
</template>

<script setup lang="ts">
import TilesetPanel from './TilesetPanel.vue';
import LayerPanel from './LayerPanel.vue';

defineEmits<{
  texturesLoaded: [textures: Map<number, any>];
}>();
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
