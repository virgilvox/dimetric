<template>
  <Transition name="fade">
    <div v-if="isDragging" class="drop-zone-overlay">
      <div class="drop-zone-content">
        <SvgIcon name="upload" :size="48" />
        <span class="drop-zone-text">Drop files to import</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { SvgIcon } from '../icons';

defineProps<{
  isDragging: boolean;
}>();
</script>

<style scoped>
.drop-zone-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  pointer-events: none;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 64px;
  border: 3px dashed rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.drop-zone-text {
  font-size: 18px;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
