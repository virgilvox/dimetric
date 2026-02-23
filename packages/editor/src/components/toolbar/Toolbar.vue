<template>
  <div class="toolbar">
    <ToolButton
      v-for="tool in tools"
      :key="tool.id"
      :label="tool.label"
      :shortcut="tool.shortcut"
      :icon="tool.icon"
      :active="editor.activeTool === tool.id"
      :disabled="editor.mode === 'preview'"
      @click="editor.setTool(tool.id)"
    />
    <div class="toolbar-separator" />
    <ToolButton label="Undo" shortcut="^Z" icon="undo" :disabled="!history.canUndo || editor.mode === 'preview'" @click="onUndo" />
    <ToolButton label="Redo" shortcut="^Y" icon="redo" :disabled="!history.canRedo || editor.mode === 'preview'" @click="onRedo" />
    <div class="toolbar-separator" />
    <ToolButton label="Grid" shortcut="#" icon="grid-3x3" :active="editor.showGrid" :disabled="editor.mode === 'preview'" @click="onToggleGrid" />
    <div class="toolbar-separator" />
    <ToolButton label="Export" shortcut="^E" icon="download" :disabled="editor.mode === 'preview'" @click="$emit('export')" />
    <div class="toolbar-separator" />
    <PreviewControls />
  </div>
</template>

<script setup lang="ts">
import { useEditorStore, type ToolType } from '../../stores/editor';
import { useHistoryStore } from '../../stores/history';
import { editorBus } from '../../events/bus';
import ToolButton from './ToolButton.vue';
import PreviewControls from './PreviewControls.vue';

const emit = defineEmits<{ toggleGrid: []; export: [] }>();
const editor = useEditorStore();
const history = useHistoryStore();

const tools: { id: ToolType; label: string; shortcut: string; icon: string }[] = [
  { id: 'brush', label: 'Brush', shortcut: 'B', icon: 'brush' },
  { id: 'eraser', label: 'Eraser', shortcut: 'E', icon: 'eraser' },
  { id: 'fill', label: 'Fill', shortcut: 'G', icon: 'fill' },
  { id: 'eyedropper', label: 'Pick', shortcut: 'I', icon: 'eyedropper' },
  { id: 'pan', label: 'Pan', shortcut: 'H', icon: 'hand' },
  { id: 'terrain', label: 'Terrain', shortcut: 'T', icon: 'terrain' },
];

function onUndo() {
  history.undo();
  editorBus.emit('map:changed');
}

function onRedo() {
  history.redo();
  editorBus.emit('map:changed');
}

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
