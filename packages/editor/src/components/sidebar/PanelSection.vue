<template>
  <div class="panel-section" :style="{ '--section-height': collapsed ? 'auto' : height + 'px' }">
    <div class="section-header" @click="collapsed = !collapsed">
      <SvgIcon :name="collapsed ? 'chevron-right' : 'chevron-down'" :size="12" />
      <SvgIcon v-if="icon" :name="icon" :size="14" />
      <span class="section-title">{{ title }}</span>
    </div>
    <div v-show="!collapsed" class="section-body" :style="{ maxHeight: height + 'px' }">
      <slot />
    </div>
    <div v-if="!collapsed && resizable" class="resize-handle" @pointerdown="onResizeStart" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SvgIcon } from '../icons';
import { usePanelResize } from '../../composables/use-panel-resize';

const props = withDefaults(defineProps<{
  title: string;
  icon?: string;
  initialHeight?: number;
  resizable?: boolean;
}>(), {
  initialHeight: 250,
  resizable: true,
});

const collapsed = ref(false);
const { height, onResizeStart } = usePanelResize(props.initialHeight);
</script>

<style scoped>
.panel-section {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--border-color);
  flex: 0 0 auto;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px var(--panel-padding, 8px);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
}

.section-header:hover {
  background: var(--bg-hover);
}

.section-title {
  flex: 1;
}

.section-body {
  overflow-y: auto;
  flex: 1;
}

.resize-handle {
  height: 4px;
  cursor: row-resize;
  flex-shrink: 0;
  background: transparent;
}

.resize-handle:hover {
  background: var(--border-color);
}
</style>
