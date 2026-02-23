<template>
  <div ref="containerRef" class="editor-canvas" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { DmRenderer } from '@dimetric/renderer';
import { snapToGrid, extractFlipFlags } from '@dimetric/core';
import { useProjectStore } from '../../stores/project';
import { useEditorStore } from '../../stores/editor';
import { useCameraStore } from '../../stores/camera';
import { usePreviewStore } from '../../stores/preview';
import { editorBus } from '../../events/bus';
import { useTool } from '../../composables/use-tool';
import { useKeyboard } from '../../composables/use-keyboard';
import { PreviewManager } from '../../preview/preview-manager';

const containerRef = ref<HTMLElement | null>(null);
let renderer: DmRenderer | null = null;
let canvasEl: HTMLCanvasElement | null = null;
let onViewportMoved: (() => void) | null = null;

const project = useProjectStore();
const editor = useEditorStore();
const camera = useCameraStore();
const preview = usePreviewStore();
const previewManager = new PreviewManager();
const activeToolRef = computed(() => editor.activeTool);
const { current: currentTool } = useTool(activeToolRef);

// Tile textures: GID -> Texture
const tileTextures = new Map<number, any>();

const emit = defineEmits<{
  rendererReady: [renderer: DmRenderer];
}>();

useKeyboard(() => renderer);

// Watch for map changes and rebuild renderer
watch(() => project.activeMap, (map) => {
  if (!renderer || !map) return;
  renderer.setMap(map);
  // Auto-select first layer if none selected
  if (!editor.activeLayerId && map.layers.length > 0) {
    editor.setActiveLayer(map.layers[0].id);
  }
});

// Watch grid toggle
watch(() => editor.showGrid, (show) => {
  renderer?.setGridVisible(show);
});

// Watch layer visibility changes
watch(
  () => project.activeMap?.layers.map((l) => ({ id: l.id, visible: l.visible, opacity: l.opacity })),
  (layers) => {
    if (!renderer || !layers) return;
    for (const l of layers) {
      renderer.setLayerVisible(l.id, l.visible);
      renderer.setLayerOpacity(l.id, l.opacity);
    }
  },
  { deep: true },
);

/** Returns true if the active layer is locked (tool mutations should be skipped). */
function isActiveLayerLocked(): boolean {
  const map = project.activeMap;
  if (!map || !editor.activeLayerId) return false;
  const layer = map.layers.find((l) => l.id === editor.activeLayerId);
  return layer?.locked ?? false;
}

// Listen to canvas events from the event bus and dispatch to active tool
function onCanvasPointerDown(data: { col: number; row: number; button: number }) {
  if (editor.mode === 'preview') return;
  if (editor.activeTool === 'pan') return;
  if (isActiveLayerLocked()) return;
  currentTool.onPointerDown(data, data.button);
}

function onCanvasPointerDrag(data: { col: number; row: number }) {
  if (editor.mode === 'preview') return;
  if (editor.activeTool === 'pan') return;
  if (isActiveLayerLocked()) return;
  currentTool.onPointerDrag(data);
}

function onCanvasPointerUp(data: { col: number; row: number; button: number }) {
  if (editor.mode === 'preview') return;
  if (editor.activeTool === 'pan') return;
  if (isActiveLayerLocked()) return;
  currentTool.onPointerUp(data, data.button);
}

function onCanvasHover(data: { col: number; row: number }) {
  if (editor.mode === 'preview') return;
  editor.setHoveredCell(data.col, data.row);
  if (renderer) {
    renderer.highlight.show(data.col, data.row);
    if (editor.selectedGid > 0) {
      const tex = tileTextures.get(editor.selectedGid);
      if (tex) {
        renderer.cursor.setTexture(tex);
        const flags = extractFlipFlags(editor.selectedGid);
        renderer.cursor.setFlipFlags(flags);
        renderer.cursor.moveTo(data.col, data.row);
      }
    }
  }
  currentTool.onHover(data);
}

function onCanvasLeave() {
  editor.setHoveredCell(null, null);
  renderer?.highlight.hide();
  renderer?.cursor.hide();
}

// Preview mode handlers
function onPreviewStart() {
  if (!renderer || !project.activeMap) return;
  editor.mode = 'preview';
  preview.activate();
  renderer.highlight.hide();
  renderer.cursor.hide();
  previewManager.start(renderer, project.activeMap, {
    startCol: preview.startCol,
    startRow: preview.startRow,
    collisionLayerName: preview.collisionLayerName,
  });
}

function onPreviewStop() {
  if (!renderer) return;
  previewManager.stop(renderer);
  editor.mode = 'edit';
  preview.deactivate();
  renderer.setGridVisible(editor.showGrid);
}

function onMapChanged() {
  if (!renderer || !project.activeMap) return;
  renderer.rebuildLayers(project.activeMap);
}

// Raw pointer events -> grid events
let pressed = false;
let lastCol = -Infinity;
let lastRow = -Infinity;

function handlePointerDown(e: PointerEvent) {
  if (!renderer) return;
  const coord = pointerToGrid(e);
  if (!coord) return;
  pressed = true;
  lastCol = coord.col;
  lastRow = coord.row;
  editorBus.emit('canvas:pointerdown', { ...coord, button: e.button });
}

function handlePointerMove(e: PointerEvent) {
  if (!renderer) return;
  const coord = pointerToGrid(e);
  if (!coord) return;
  if (coord.col !== lastCol || coord.row !== lastRow) {
    lastCol = coord.col;
    lastRow = coord.row;
    editorBus.emit('canvas:hover', coord);
    if (pressed) {
      editorBus.emit('canvas:pointerdrag', coord);
    }
  }
}

function handlePointerUp(e: PointerEvent) {
  if (!pressed) return;
  pressed = false;
  const coord = pointerToGrid(e);
  if (coord) {
    editorBus.emit('canvas:pointerup', { ...coord, button: e.button });
  }
}

function handlePointerLeave() {
  pressed = false;
  editorBus.emit('canvas:pointerleave');
}

function pointerToGrid(e: PointerEvent) {
  if (!renderer || !containerRef.value) return null;
  const rect = containerRef.value.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  const { wx, wy } = renderer.camera.screenToWorld(sx, sy);
  const map = project.activeMap;
  const tw = map?.tileSize.width ?? 64;
  const th = map?.tileSize.height ?? 32;
  return snapToGrid(wx, wy, tw, th);
}

onMounted(async () => {
  if (!containerRef.value) return;
  renderer = new DmRenderer();
  await renderer.init({ container: containerRef.value });

  // Add raw pointer listeners to the pixi canvas
  canvasEl = containerRef.value.querySelector('canvas');
  if (canvasEl) {
    canvasEl.addEventListener('pointerdown', handlePointerDown);
    canvasEl.addEventListener('pointermove', handlePointerMove);
    canvasEl.addEventListener('pointerup', handlePointerUp);
    canvasEl.addEventListener('pointerleave', handlePointerLeave);
  }

  // Subscribe to bus events
  editorBus.on('canvas:pointerdown', onCanvasPointerDown);
  editorBus.on('canvas:pointerdrag', onCanvasPointerDrag);
  editorBus.on('canvas:pointerup', onCanvasPointerUp);
  editorBus.on('canvas:hover', onCanvasHover);
  editorBus.on('canvas:pointerleave', onCanvasLeave);
  editorBus.on('map:changed', onMapChanged);
  editorBus.on('preview:start', onPreviewStart);
  editorBus.on('preview:stop', onPreviewStop);

  // Update camera store when viewport moves
  const vp = renderer.getViewport().viewport;
  onViewportMoved = () => {
    if (!renderer) return;
    const state = renderer.camera.getState();
    camera.update(state.x, state.y, state.zoom);
  };
  vp.on('moved', onViewportMoved);

  emit('rendererReady', renderer);
});

onUnmounted(() => {
  // Remove canvas pointer listeners before destroying renderer
  if (canvasEl) {
    canvasEl.removeEventListener('pointerdown', handlePointerDown);
    canvasEl.removeEventListener('pointermove', handlePointerMove);
    canvasEl.removeEventListener('pointerup', handlePointerUp);
    canvasEl.removeEventListener('pointerleave', handlePointerLeave);
    canvasEl = null;
  }

  // Remove viewport listener before destroying renderer
  if (renderer && onViewportMoved) {
    const vp = renderer.getViewport().viewport;
    vp.off('moved', onViewportMoved);
    onViewportMoved = null;
  }

  // Remove bus listeners
  editorBus.off('canvas:pointerdown', onCanvasPointerDown);
  editorBus.off('canvas:pointerdrag', onCanvasPointerDrag);
  editorBus.off('canvas:pointerup', onCanvasPointerUp);
  editorBus.off('canvas:hover', onCanvasHover);
  editorBus.off('canvas:pointerleave', onCanvasLeave);
  editorBus.off('map:changed', onMapChanged);
  editorBus.off('preview:start', onPreviewStart);
  editorBus.off('preview:stop', onPreviewStop);

  // Clean up preview if active
  if (previewManager.isActive && renderer) {
    previewManager.stop(renderer);
  }

  // Destroy renderer last
  renderer?.destroy();
  renderer = null;
});

/** Exposed for parent to set tile textures when tilesets are loaded. */
defineExpose({
  setTileTextures(textures: Map<number, any>) {
    for (const [gid, tex] of textures) {
      tileTextures.set(gid, tex);
    }
    if (renderer) {
      renderer.setTileTextures(tileTextures);
    }
  },
  getRenderer: () => renderer,
});
</script>

<style scoped>
.editor-canvas {
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.editor-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
