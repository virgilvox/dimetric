<template>
  <div class="tile-transform-bar">
    <button
      class="transform-btn"
      :class="{ active: flags.horizontal }"
      title="Flip Horizontal (X)"
      @click="editor.flipSelectedH()"
    >
      <SvgIcon name="flip-h" :size="16" />
    </button>
    <button
      class="transform-btn"
      :class="{ active: flags.vertical }"
      title="Flip Vertical (Y)"
      @click="editor.flipSelectedV()"
    >
      <SvgIcon name="flip-v" :size="16" />
    </button>
    <button
      class="transform-btn"
      title="Rotate 90 CW (R)"
      @click="editor.rotateSelected()"
    >
      <SvgIcon name="rotate-cw" :size="16" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useEditorStore } from '../../stores/editor';
import { SvgIcon } from '../icons';

const editor = useEditorStore();

const flags = computed(() => editor.selectedFlipFlags);
</script>

<style scoped>
.tile-transform-bar {
  display: flex;
  gap: 2px;
  padding: 4px var(--panel-padding);
  border-top: 1px solid var(--border-color);
}

.transform-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: background 0.1s, color 0.1s;
}

.transform-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.transform-btn.active {
  background: var(--accent);
  color: white;
}
</style>
