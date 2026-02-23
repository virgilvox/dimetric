import { defineStore } from 'pinia';
import { ref } from 'vue';

export const usePreviewStore = defineStore('preview', () => {
  const isPreviewActive = ref(false);
  const startCol = ref(3);
  const startRow = ref(3);
  const collisionLayerName = ref('Walls');

  function activate() {
    isPreviewActive.value = true;
  }

  function deactivate() {
    isPreviewActive.value = false;
  }

  return {
    isPreviewActive,
    startCol,
    startRow,
    collisionLayerName,
    activate,
    deactivate,
  };
});
