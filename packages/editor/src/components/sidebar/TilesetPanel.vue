<template>
  <div class="tileset-panel">
    <div class="panel-header">
      <span>Tileset</span>
      <button class="panel-action" title="Import tileset" @click="showImport = true">+</button>
    </div>
    <div v-if="!activeTileset" class="panel-empty">
      No tileset loaded.<br />
      <button class="link-btn" @click="showImport = true">Import tileset</button>
    </div>
    <div v-else class="tileset-grid" ref="gridRef">
      <canvas
        ref="tilesetCanvas"
        :width="canvasWidth"
        :height="canvasHeight"
        @click="onTileClick"
      />
      <div
        v-if="selectedLocalId >= 0"
        class="tile-selection"
        :style="selectionStyle"
      />
    </div>

    <ImportTilesetDialog
      v-if="showImport"
      @close="showImport = false"
      @import="onImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { Texture } from 'pixi.js';
import { useProjectStore } from '../../stores/project';
import { useEditorStore } from '../../stores/editor';
import { sliceTilesetTextures } from '@dimetric/renderer';
import ImportTilesetDialog from '../dialogs/ImportTilesetDialog.vue';

const emit = defineEmits<{
  texturesLoaded: [textures: Map<number, any>];
}>();

const project = useProjectStore();
const editor = useEditorStore();
const showImport = ref(false);

const tilesetCanvas = ref<HTMLCanvasElement | null>(null);
const gridRef = ref<HTMLElement | null>(null);
const tilesetImage = ref<HTMLImageElement | null>(null);
const selectedLocalId = ref(-1);

const activeTileset = computed(() => {
  const map = project.activeMap;
  if (!map || map.tilesets.length === 0) return null;
  return map.tilesets[0];
});

const canvasWidth = computed(() => activeTileset.value?.tileset.imageSize.width ?? 0);
const canvasHeight = computed(() => activeTileset.value?.tileset.imageSize.height ?? 0);

const selectionStyle = computed(() => {
  if (!activeTileset.value || selectedLocalId.value < 0) return {};
  const ts = activeTileset.value.tileset;
  const col = selectedLocalId.value % ts.columns;
  const row = Math.floor(selectedLocalId.value / ts.columns);
  return {
    left: `${ts.margin + col * (ts.tileSize.width + ts.spacing)}px`,
    top: `${ts.margin + row * (ts.tileSize.height + ts.spacing)}px`,
    width: `${ts.tileSize.width}px`,
    height: `${ts.tileSize.height}px`,
  };
});

function onTileClick(e: MouseEvent) {
  if (!activeTileset.value || !tilesetCanvas.value) return;
  const ts = activeTileset.value.tileset;
  const rect = tilesetCanvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const col = Math.floor((x - ts.margin) / (ts.tileSize.width + ts.spacing));
  const row = Math.floor((y - ts.margin) / (ts.tileSize.height + ts.spacing));
  if (col < 0 || col >= ts.columns) return;
  const localId = row * ts.columns + col;
  if (localId >= ts.tileCount) return;
  selectedLocalId.value = localId;
  const gid = activeTileset.value.firstGid + localId;
  editor.setSelectedGid(gid);
}

async function onImport(data: { name: string; imageDataUrl: string; imageSize: { width: number; height: number }; tileWidth: number; tileHeight: number }) {
  showImport.value = false;

  const ts = project.addTileset({
    name: data.name,
    imageSource: data.imageDataUrl,
    imageSize: data.imageSize,
    tileSize: { width: data.tileWidth, height: data.tileHeight },
  });

  // Draw tileset image on the canvas preview
  await nextTick();
  drawTilesetImage(data.imageDataUrl);

  // Create PixiJS textures
  const map = project.activeMap;
  if (!map) return;
  const tsRef = map.tilesets.find((r) => r.tileset.id === ts.id);
  if (!tsRef) return;

  const img = new Image();
  img.src = data.imageDataUrl;
  await new Promise<void>((resolve) => { img.onload = () => resolve(); });

  const baseTexture = Texture.from(img);
  const textures = sliceTilesetTextures(baseTexture, ts, tsRef.firstGid);
  emit('texturesLoaded', textures);
}

function drawTilesetImage(dataUrl: string) {
  const canvas = tilesetCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = dataUrl;
  tilesetImage.value = img;
}

// Redraw when tileset changes
watch(activeTileset, (ts) => {
  if (ts) {
    drawTilesetImage(ts.tileset.imageSource);
  }
});
</script>

<style scoped>
.tileset-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-bottom: 1px solid var(--border-color);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px var(--panel-padding);
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.panel-action {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--text-secondary);
}

.panel-action:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.panel-empty {
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.6;
}

.link-btn {
  color: var(--accent);
  font-size: 12px;
}

.link-btn:hover {
  text-decoration: underline;
}

.tileset-grid {
  flex: 1;
  overflow: auto;
  padding: 4px;
  position: relative;
}

.tileset-grid canvas {
  display: block;
  image-rendering: pixelated;
}

.tile-selection {
  position: absolute;
  border: 2px solid var(--accent);
  pointer-events: none;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
}
</style>
