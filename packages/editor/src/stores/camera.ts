import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCameraStore = defineStore('camera', () => {
  const x = ref(0);
  const y = ref(0);
  const zoom = ref(1);

  function update(cx: number, cy: number, z: number): void {
    x.value = cx;
    y.value = cy;
    zoom.value = z;
  }

  return { x, y, zoom, update };
});
