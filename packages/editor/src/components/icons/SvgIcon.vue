<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    v-html="pathData"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { iconPaths } from './icon-paths';

const props = withDefaults(defineProps<{
  name: string;
  size?: number;
}>(), {
  size: 18,
});

const pathData = computed(() => iconPaths[props.name] ?? '');
</script>
