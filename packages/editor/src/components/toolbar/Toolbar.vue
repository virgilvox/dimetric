<template>
  <div class="toolbar">
    <ToolButton
      v-for="tool in tools"
      :key="tool.id"
      :label="tool.label"
      :shortcut="tool.shortcut"
      :active="editor.activeTool === tool.id"
      @click="editor.setTool(tool.id)"
    />
    <div class="toolbar-separator" />
    <ToolButton label="Grid" shortcut="#" :active="editor.showGrid" @click="onToggleGrid" />
  </div>
</template>

<script setup lang="ts">
import { useEditorStore, type ToolType } from '../../stores/editor';
import ToolButton from './ToolButton.vue';

const emit = defineEmits<{ toggleGrid: [] }>();
const editor = useEditorStore();

const tools: { id: ToolType; label: string; shortcut: string }[] = [
  { id: 'brush', label: 'Brush', shortcut: 'B' },
  { id: 'eraser', label: 'Eraser', shortcut: 'E' },
  { id: 'fill', label: 'Fill', shortcut: 'G' },
  { id: 'eyedropper', label: 'Pick', shortcut: 'I' },
  { id: 'pan', label: 'Pan', shortcut: 'H' },
];

function onToggleGrid() {
  editor.toggleGrid();
  emit('toggleGrid');
}
</script>

<style scoped>
.toolbar {
  width: var(--toolbar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  gap: 2px;
}

.toolbar-separator {
  width: 32px;
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
}
</style>
