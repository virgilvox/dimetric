<template>
  <button
    class="tool-button"
    :class="{ active, disabled }"
    :title="`${label} (${shortcut})`"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <SvgIcon v-if="icon" :name="icon" :size="18" />
    <span v-else>{{ label.charAt(0) }}</span>
  </button>
</template>

<script setup lang="ts">
import { SvgIcon } from '../icons';

defineProps<{
  label: string;
  shortcut: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
}>();

defineEmits<{ click: [] }>();
</script>

<style scoped>
.tool-button {
  width: 36px;
  height: 36px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-secondary);
  transition: background 0.1s, color 0.1s;
}

.tool-button:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tool-button.active {
  background: var(--accent);
  color: white;
}

.tool-button:disabled {
  opacity: 0.3;
  cursor: default;
}
</style>
