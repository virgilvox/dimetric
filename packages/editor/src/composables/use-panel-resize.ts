import { ref } from 'vue';

export function usePanelResize(initialHeight: number, min = 80, max = 600) {
  const height = ref(initialHeight);
  let startY = 0;
  let startHeight = 0;

  function onResizeStart(e: PointerEvent) {
    e.preventDefault();
    startY = e.clientY;
    startHeight = height.value;
    document.addEventListener('pointermove', onResizeMove);
    document.addEventListener('pointerup', onResizeEnd);
  }

  function onResizeMove(e: PointerEvent) {
    const delta = e.clientY - startY;
    height.value = Math.min(max, Math.max(min, startHeight + delta));
  }

  function onResizeEnd() {
    document.removeEventListener('pointermove', onResizeMove);
    document.removeEventListener('pointerup', onResizeEnd);
  }

  return { height, onResizeStart };
}
