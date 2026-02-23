<template>
  <div class="app-layout">
    <!-- Welcome screen when no map is open -->
    <div v-if="!project.activeMap" class="welcome">
      <h1>Dimetric</h1>
      <p>Isometric tile map editor</p>
      <div class="welcome-actions">
        <button class="btn btn-primary" @click="showNewMap = true">New Map</button>
        <button class="btn" @click="openFile">Open Project</button>
      </div>
    </div>

    <!-- Editor layout when a map is open -->
    <template v-else>
      <Toolbar @toggle-grid="onToggleGrid" />
      <div class="canvas-area">
        <EditorCanvas ref="canvasRef" @renderer-ready="onRendererReady" />
        <CanvasOverlay />
      </div>
      <Sidebar @textures-loaded="onTexturesLoaded" />
    </template>

    <!-- Dialogs -->
    <NewMapDialog
      v-if="showNewMap"
      @close="showNewMap = false"
      @create="onCreateMap"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { DmRenderer } from '@dimetric/renderer';
import type { DmProject } from '@dimetric/core';
import { PROJECT_VERSION } from '@dimetric/core';
import { serializeProjectToJson, deserializeProjectFromJson } from '@dimetric/formats';
import { useProjectStore } from './stores/project';
import { useEditorStore } from './stores/editor';
import { editorBus } from './events/bus';
import Toolbar from './components/toolbar/Toolbar.vue';
import Sidebar from './components/sidebar/Sidebar.vue';
import EditorCanvas from './components/canvas/EditorCanvas.vue';
import CanvasOverlay from './components/canvas/CanvasOverlay.vue';
import NewMapDialog from './components/dialogs/NewMapDialog.vue';

const AUTOSAVE_KEY = 'dimetric:autosave';

const project = useProjectStore();
const editor = useEditorStore();
const showNewMap = ref(false);
const canvasRef = ref<InstanceType<typeof EditorCanvas> | null>(null);
let renderer: DmRenderer | null = null;
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

function onCreateMap(data: { name: string; cols: number; rows: number; tileWidth: number; tileHeight: number }) {
  showNewMap.value = false;
  const map = project.newMap({
    name: data.name,
    mapSize: { width: data.cols, height: data.rows },
    tileSize: { width: data.tileWidth, height: data.tileHeight },
  });
  if (map.layers.length > 0) {
    editor.setActiveLayer(map.layers[0].id);
  }
}

function onRendererReady(r: DmRenderer) {
  renderer = r;
  if (project.activeMap) {
    renderer.setMap(project.activeMap);
  }
}

function onToggleGrid() {
  renderer?.setGridVisible(editor.showGrid);
}

function onTexturesLoaded(textures: Map<number, any>) {
  canvasRef.value?.setTileTextures(textures);
}

// --- Save/Load ---

function getProjectData(): DmProject {
  return {
    version: PROJECT_VERSION,
    name: project.projectName,
    maps: project.maps,
    tilesets: project.tilesets,
  };
}

function saveToFile() {
  const json = serializeProjectToJson(getProjectData());
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.projectName || 'untitled'}.dimetric.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function saveToLocalStorage() {
  try {
    const json = serializeProjectToJson(getProjectData());
    localStorage.setItem(AUTOSAVE_KEY, json);
  } catch {
    // Ignore quota errors
  }
}

function loadFromLocalStorage(): boolean {
  try {
    const json = localStorage.getItem(AUTOSAVE_KEY);
    if (!json) return false;
    loadProjectFromJson(json);
    return true;
  } catch {
    return false;
  }
}

function loadProjectFromJson(json: string) {
  const restored = deserializeProjectFromJson(json);
  project.$reset();
  project.projectName = restored.name;
  project.projectVersion = restored.version;
  for (const ts of restored.tilesets) {
    project.tilesets.push(ts);
  }
  for (const map of restored.maps) {
    project.maps.push(map);
  }
  if (project.maps.length > 0) {
    project.activeMapId = project.maps[0].id;
    if (project.activeMap && project.activeMap.layers.length > 0) {
      editor.setActiveLayer(project.activeMap.layers[0].id);
    }
  }
}

function openFile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.dimetric';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      loadProjectFromJson(text);
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };
  input.click();
}

// Ctrl+S to save
function onKeyDown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    if (project.activeMap) {
      saveToFile();
    }
  }
}

// Auto-save to localStorage on map changes (debounced)
function scheduleAutoSave() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    if (project.maps.length > 0) {
      saveToLocalStorage();
    }
  }, 2000);
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
  editorBus.on('map:changed', scheduleAutoSave);

  // Try to restore from auto-save
  loadFromLocalStorage();
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  editorBus.off('map:changed', scheduleAutoSave);
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
});
</script>

<style scoped>
.app-layout {
  width: 100%;
  height: 100%;
  display: flex;
}

.welcome {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.welcome h1 {
  font-size: 2rem;
}

.welcome p {
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.welcome-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 20px;
  border-radius: var(--border-radius);
  font-size: 14px;
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn:hover {
  background: var(--bg-active);
}

.btn-primary {
  background: var(--accent);
  color: white;
}

.btn-primary:hover {
  background: var(--accent-hover);
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>
