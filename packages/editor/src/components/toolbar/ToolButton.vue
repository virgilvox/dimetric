<template>
  <button
    class="tool-button"
    :class="{ active }"
    :title="`${label} (${shortcut})`"
    @click="$emit('click')"
  >
    {{ label.charAt(0) }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  shortcut: string;
  active?: boolean;
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

.tool-button:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tool-button.active {
  background: var(--accent);
  color: white;
}
</style>
