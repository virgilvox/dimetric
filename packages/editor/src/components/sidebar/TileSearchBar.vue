<template>
  <div class="tile-search-bar">
    <SvgIcon name="search" :size="14" class="search-icon" />
    <input
      type="text"
      placeholder="Filter tiles..."
      :value="query"
      @input="$emit('update:query', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { SvgIcon } from '../icons';

defineProps<{
  query: string;
}>();

defineEmits<{
  'update:query': [value: string];
}>();
</script>

<style scoped>
.tile-search-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px var(--panel-padding);
  border-bottom: 1px solid var(--border-color);
}

.search-icon {
  flex-shrink: 0;
  color: var(--text-muted);
}

.tile-search-bar input {
  flex: 1;
  min-width: 0;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 3px 6px;
  font-size: 11px;
  outline: none;
}

.tile-search-bar input::placeholder {
  color: var(--text-muted);
}

.tile-search-bar input:focus {
  border-color: var(--accent);
}
</style>
