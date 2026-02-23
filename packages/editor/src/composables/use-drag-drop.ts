import { ref, onMounted, onUnmounted } from 'vue';
import { editorBus } from '../events/bus';

/**
 * Global drag-and-drop composable for the editor.
 *
 * Attaches document-level drag/drop listeners, tracks `isDragging` state,
 * and emits dropped files via the editor event bus.
 */
export function useDragDrop() {
  const isDragging = ref(false);
  let dragCounter = 0;

  function onDragEnter(e: DragEvent) {
    e.preventDefault();
    dragCounter++;
    if (e.dataTransfer?.types.includes('Files')) {
      isDragging.value = true;
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy';
    }
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      isDragging.value = false;
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragCounter = 0;
    isDragging.value = false;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      editorBus.emit('import:request', Array.from(files));
    }
  }

  onMounted(() => {
    document.addEventListener('dragenter', onDragEnter);
    document.addEventListener('dragover', onDragOver);
    document.addEventListener('dragleave', onDragLeave);
    document.addEventListener('drop', onDrop);
  });

  onUnmounted(() => {
    document.removeEventListener('dragenter', onDragEnter);
    document.removeEventListener('dragover', onDragOver);
    document.removeEventListener('dragleave', onDragLeave);
    document.removeEventListener('drop', onDrop);
  });

  return { isDragging };
}
