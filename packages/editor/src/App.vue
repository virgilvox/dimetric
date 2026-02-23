<template>
  <div class="app-layout">
    <!-- Welcome screen when no map is open -->
    <WelcomeScreen
      v-if="!project.activeMap"
      @new-map="showNewMap = true"
      @open-project="openFile"
      @import="showImportAsset = true"
      @quick-start="onCreateMap"
    />

    <!-- Editor layout when a map is open -->
    <template v-else>
      <Toolbar @toggle-grid="onToggleGrid" @export="showExport = true" />
      <div class="main-area">
        <div class="canvas-area">
          <EditorCanvas ref="canvasRef" @renderer-ready="onRendererReady" />
        </div>
        <StatusBar @reset-zoom="onResetZoom" />
      </div>
      <Sidebar @textures-loaded="onTexturesLoaded" />
    </template>

    <!-- Error banner -->
    <div v-if="errorMessage" class="error-banner">
      <span>{{ errorMessage }}</span>
      <button class="error-dismiss" @click="errorMessage = null"><SvgIcon name="x" :size="16" /></button>
    </div>

    <!-- Dialogs -->
    <EnhancedNewMapDialog
      v-if="showNewMap"
      @close="showNewMap = false"
      @create="onCreateMap"
    />
    <ExportDialog
      v-if="showExport"
      @close="showExport = false"
    />
    <ImportAssetDialog
      v-if="showImportAsset"
      :initial-files="importFiles"
      @close="showImportAsset = false"
      @import-map="onImportMap"
      @import-tileset="onImportTileset"
      @import-project="onImportProject"
    />

    <!-- Drag-and-drop overlay -->
    <DropZoneOverlay :is-dragging="isDragging" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { DmRenderer } from '@dimetric/renderer';
import type { DmProject, DmMap, DmTileset, DmOrientation } from '@dimetric/core';
import { PROJECT_VERSION } from '@dimetric/core';
import { serializeProjectToJson, deserializeProjectFromJson } from '@dimetric/formats';
import { useProjectStore } from './stores/project';
import { useEditorStore } from './stores/editor';
import { editorBus } from './events/bus';
import { useDragDrop } from './composables/use-drag-drop';
import { SvgIcon } from './components/icons';
import Toolbar from './components/toolbar/Toolbar.vue';
import Sidebar from './components/sidebar/Sidebar.vue';
import EditorCanvas from './components/canvas/EditorCanvas.vue';
import StatusBar from './components/canvas/StatusBar.vue';
import EnhancedNewMapDialog from './components/dialogs/EnhancedNewMapDialog.vue';
import ExportDialog from './components/dialogs/ExportDialog.vue';
import WelcomeScreen from './components/welcome/WelcomeScreen.vue';
import ImportAssetDialog from './components/dialogs/ImportAssetDialog.vue';
import DropZoneOverlay from './components/common/DropZoneOverlay.vue';

const AUTOSAVE_KEY = 'dimetric:autosave';

const project = useProjectStore();
const editor = useEditorStore();
const { isDragging } = useDragDrop();
const showNewMap = ref(false);
const showExport = ref(false);
const showImportAsset = ref(false);
const importFiles = ref<File[]>([]);
const errorMessage = ref<string | null>(null);
const canvasRef = ref<InstanceType<typeof EditorCanvas> | null>(null);
let renderer: DmRenderer | null = null;
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

function onCreateMap(data: { name: string; cols: number; rows: number; tileWidth: number; tileHeight: number; orientation?: DmOrientation }) {
  showNewMap.value = false;
  const map = project.newMap({
    name: data.name,
    mapSize: { width: data.cols, height: data.rows },
    tileSize: { width: data.tileWidth, height: data.tileHeight },
    orientation: data.orientation,
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

function onResetZoom() {
  renderer?.camera.setZoom(1);
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
  input.multiple = true;
  input.accept = '.json,.dimetric,.tmj,.tmx,.tsx,.tsj,.png,.jpg,.jpeg,.webp';
  input.onchange = async () => {
    const files = input.files;
    if (!files || files.length === 0) return;
    onImportRequest(Array.from(files));
  };
  input.click();
}

// --- Import handlers ---

function onImportRequest(files: File[]) {
  importFiles.value = files;
  showImportAsset.value = true;
}

function onImportMap(map: DmMap) {
  try {
    project.importMap(map);
    if (map.layers.length > 0) {
      editor.setActiveLayer(map.layers[0].id);
    }
  } catch (err) {
    console.error('Failed to import map:', err);
    errorMessage.value = `Failed to import map: ${err instanceof Error ? err.message : String(err)}`;
  }
}

function onImportTileset(data: { tileset: DmTileset; imageDataUrl?: string; imageSize?: { width: number; height: number } }) {
  try {
    // If the tileset has an image data URL, set it as the image source
    if (data.imageDataUrl) {
      data.tileset.imageSource = data.imageDataUrl;
      if (data.imageSize) {
        data.tileset.imageSize = { width: data.imageSize.width, height: data.imageSize.height };
      }
    }
    project.importTileset(data.tileset);
  } catch (err) {
    console.error('Failed to import tileset:', err);
    errorMessage.value = `Failed to import tileset: ${err instanceof Error ? err.message : String(err)}`;
  }
}

function onImportProject(json: string) {
  try {
    loadProjectFromJson(json);
  } catch (err) {
    console.error('Failed to import project:', err);
    errorMessage.value = `Failed to import project: ${err instanceof Error ? err.message : String(err)}`;
  }
}

// Ctrl+S to save, Ctrl+Shift+E to export
function onKeyDown(e: KeyboardEvent) {
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key === 's') {
    e.preventDefault();
    if (project.activeMap) {
      saveToFile();
    }
  }
  if (mod && e.shiftKey && e.key.toLowerCase() === 'e') {
    e.preventDefault();
    if (project.activeMap) {
      showExport.value = true;
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
  editorBus.on('import:request', onImportRequest);

  // Try to restore from auto-save
  loadFromLocalStorage();
});

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown);
  editorBus.off('map:changed', scheduleAutoSave);
  editorBus.off('import:request', onImportRequest);
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
});
</script>

<style scoped>
.app-layout {
  width: 100%;
  height: 100%;
  display: flex;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.error-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--danger, #e74c3c);
  color: white;
  font-size: 13px;
  z-index: 100;
}

.error-dismiss {
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0.8;
}

.error-dismiss:hover {
  opacity: 1;
}
</style>
