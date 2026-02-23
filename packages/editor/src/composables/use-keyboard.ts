import { onMounted, onUnmounted } from 'vue';
import { useEditorStore } from '../stores/editor';
import { useHistoryStore } from '../stores/history';
import { editorBus } from '../events/bus';
import type { DmRenderer } from '@dimetric/renderer';

export function useKeyboard(getRenderer: () => DmRenderer | null) {
  function onKeyDown(e: KeyboardEvent) {
    // Don't intercept when typing in inputs
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

    const editor = useEditorStore();
    const history = useHistoryStore();
    const mod = e.metaKey || e.ctrlKey;

    // Undo: Ctrl+Z (without Shift)
    if (mod && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      history.undo();
      editorBus.emit('map:changed');
      return;
    }

    // Redo: Ctrl+Shift+Z or Ctrl+Y
    if (mod && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
      e.preventDefault();
      history.redo();
      editorBus.emit('map:changed');
      return;
    }

    // Don't process tool shortcuts when modifier keys are held
    if (mod) return;

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
      case 't':
        editor.setTool('terrain');
        break;
      case 'f5':
        e.preventDefault();
        if (editor.mode === 'edit') {
          editorBus.emit('preview:start');
        }
        break;
      case 'escape':
        if (editor.mode === 'preview') {
          editorBus.emit('preview:stop');
        }
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
      case 'x':
        if (editor.selectedGid > 0) editor.flipSelectedH();
        break;
      case 'y':
        if (editor.selectedGid > 0) editor.flipSelectedV();
        break;
      case 'r':
        if (editor.selectedGid > 0) editor.rotateSelected();
        break;
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeyDown));
  onUnmounted(() => window.removeEventListener('keydown', onKeyDown));
}
