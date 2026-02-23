<script setup lang="ts">
import type { DmPropertyType } from '@dimetric/core';

const props = defineProps<{
  type: DmPropertyType;
  modelValue: string | number | boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean];
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  switch (props.type) {
    case 'string':
    case 'file':
    case 'color':
      emit('update:modelValue', target.value);
      break;
    case 'int':
      emit('update:modelValue', parseInt(target.value, 10) || 0);
      break;
    case 'float':
      emit('update:modelValue', parseFloat(target.value) || 0);
      break;
    case 'bool':
      emit('update:modelValue', target.checked);
      break;
    case 'object':
      emit('update:modelValue', target.value);
      break;
  }
}
</script>

<template>
  <input
    v-if="type === 'bool'"
    type="checkbox"
    :checked="modelValue as boolean"
    class="prop-checkbox"
    @change="onInput"
  />
  <input
    v-else-if="type === 'color'"
    type="color"
    :value="modelValue as string"
    class="prop-color"
    @input="onInput"
  />
  <input
    v-else-if="type === 'int'"
    type="number"
    step="1"
    :value="modelValue as number"
    class="prop-input"
    @input="onInput"
  />
  <input
    v-else-if="type === 'float'"
    type="number"
    step="0.1"
    :value="modelValue as number"
    class="prop-input"
    @input="onInput"
  />
  <input
    v-else
    type="text"
    :value="modelValue as string"
    class="prop-input"
    @input="onInput"
  />
</template>

<style scoped>
.prop-input {
  width: 100%;
  padding: 2px 4px;
  background: #2a2a3e;
  border: 1px solid #444;
  color: #e0e0e0;
  border-radius: 3px;
  font-size: 12px;
}

.prop-checkbox {
  width: 16px;
  height: 16px;
}

.prop-color {
  width: 100%;
  height: 24px;
  border: 1px solid #444;
  border-radius: 3px;
  cursor: pointer;
  background: transparent;
  padding: 0;
}
</style>
