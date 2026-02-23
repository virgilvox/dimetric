import { onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../stores/editor';
import type { DmRenderer } from '@dimetric/renderer';

export function useKeyboard(getRenderer: () => DmRenderer | null) {
  function onKeyDown(e: KeyboardEvent) {
    // Don't intercept when typing in inputs
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

    const editor = useEditorStore();

    switch (e.key.toLowerCase()) {
      case 'b':
        editor.setTool('brush');
        break;
      case 'e':
        editor.setTool('eraser');
        break;
      case 'g':
        editor.setTool('fill');
        break;
      case 'h':
        editor.setTool('pan');
        break;
      case 'i':
        editor.setTool('eyedropper');
        break;
      case '=':
      case '+':
        getRenderer()?.camera.zoomIn();
        break;
      case '-':
        getRenderer()?.camera.zoomOut();
        break;
      case '#':
        editor.toggleGrid();
        getRenderer()?.setGridVisible(editor.showGrid);
        break;
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown));
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown));
}
