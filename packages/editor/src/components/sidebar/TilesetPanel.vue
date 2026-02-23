<template>
  <div class="tileset-panel">
    <div class="panel-header">
      <span>Tileset</span>
      <button class="panel-action" title="Import tileset" @click="openImport"><SvgIcon name="plus" :size="14" /></button>
    </div>
    <div v-if="!map || map.tilesets.length === 0" class="panel-empty">
      No tileset loaded.<br />
      <button class="link-btn" @click="openImport">Import tileset</button>
    </div>
    <template v-else>
      <!-- Tileset selector when multiple tilesets exist -->
      <div v-if="map.tilesets.length > 1" class="tileset-selector">
        <select v-model="selectedTilesetIndex" class="tileset-select">
          <option
            v-for="(ref, idx) in map.tilesets"
            :key="ref.tileset.id"
            :value="idx"
          >
            {{ ref.tileset.name }}
          </option>
        </select>
      </div>
      <TileSearchBar v-model:query="searchQuery" />
      <div v-if="activeTileset" class="tileset-grid" ref="gridRef">
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
      <TileTransformBar v-if="selectedLocalId >= 0" />
    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { Texture } from 'pixi.js';
import { useProjectStore } from '../../stores/project';
import { useEditorStore } from '../../stores/editor';
import { useTilesetEditorStore } from '../../stores/tileset-editor';
import { editorBus } from '../../events/bus';
import { sliceTilesetTextures } from '@dimetric/renderer';
import { SvgIcon } from '../icons';
import TileSearchBar from './TileSearchBar.vue';
import TileTransformBar from './TileTransformBar.vue';

const emit = defineEmits<{
  texturesLoaded: [textures: Map<number, any>];
}>();

const project = useProjectStore();
const editor = useEditorStore();
const tilesetEditor = useTilesetEditorStore();
const selectedTilesetIndex = ref(0);
const searchQuery = ref('');

const tilesetCanvas = ref<HTMLCanvasElement | null>(null);
const gridRef = ref<HTMLElement | null>(null);
const tilesetImage = ref<HTMLImageElement | null>(null);
const selectedLocalId = ref(-1);

const map = computed(() => project.activeMap);

const activeTileset = computed(() => {
  const m = map.value;
  if (!m || m.tilesets.length === 0) return null;
  const idx = Math.min(selectedTilesetIndex.value, m.tilesets.length - 1);
  return m.tilesets[idx];
});

const canvasWidth = computed(() => activeTileset.value?.tileset.imageSize.width ?? 0);
const canvasHeight = computed(() => activeTileset.value?.tileset.imageSize.height ?? 0);

/** Set of local tile IDs that match the current search query. Null means no filter active. */
const matchingTileIds = computed<Set<number> | null>(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q || !activeTileset.value) return null;
  const ts = activeTileset.value.tileset;
  const matched = new Set<number>();
  for (let i = 0; i < ts.tileCount; i++) {
    // Match against local ID as string
    if (String(i).includes(q)) {
      matched.add(i);
      continue;
    }
    // Match against GID as string
    const gid = activeTileset.value.firstGid + i;
    if (String(gid).includes(q)) {
      matched.add(i);
    }
  }
  return matched;
});

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
  tilesetEditor.selectTile(localId);
}

function openImport() {
  editorBus.emit('import:request', []);
}

// Track which tilesets already have PixiJS textures created
const loadedTilesetIds = new Set<string>();

// Watch for new tilesets being added (via ImportAssetDialog or autosave restore)
watch(
  () => map.value?.tilesets.length,
  async (newLen, oldLen) => {
    if (!map.value || !newLen || newLen <= (oldLen ?? 0)) return;

    for (const tsRef of map.value.tilesets) {
      const id = tsRef.tileset.id;
      if (loadedTilesetIds.has(id)) continue;
      loadedTilesetIds.add(id);

      // Select the newly added tileset
      const idx = map.value.tilesets.indexOf(tsRef);
      if (idx >= 0) selectedTilesetIndex.value = idx;

      // Create PixiJS textures if the tileset has an image
      if (!tsRef.tileset.imageSource) continue;
      const img = new Image();
      img.src = tsRef.tileset.imageSource;
      await new Promise<void>((resolve) => { img.onload = () => resolve(); });

      const baseTexture = Texture.from(img);
      const textures = sliceTilesetTextures(baseTexture, tsRef.tileset, tsRef.firstGid);
      emit('texturesLoaded', textures);
    }
  },
);

function drawTilesetImage(dataUrl: string) {
  const canvas = tilesetCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    drawDimOverlay(ctx);
  };
  img.src = dataUrl;
  tilesetImage.value = img;
}

/** Draw a semi-transparent overlay on tiles that don't match the current search filter. */
function drawDimOverlay(ctx?: CanvasRenderingContext2D | null) {
  const matched = matchingTileIds.value;
  if (!matched) return; // no filter active
  const ts = activeTileset.value?.tileset;
  if (!ts) return;
  if (!ctx) {
    const canvas = tilesetCanvas.value;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (!ctx) return;
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  for (let i = 0; i < ts.tileCount; i++) {
    if (matched.has(i)) continue;
    const col = i % ts.columns;
    const row = Math.floor(i / ts.columns);
    const x = ts.margin + col * (ts.tileSize.width + ts.spacing);
    const y = ts.margin + row * (ts.tileSize.height + ts.spacing);
    ctx.fillRect(x, y, ts.tileSize.width, ts.tileSize.height);
  }
}

// Redraw when tileset changes (switching tabs or new import)
watch(activeTileset, (ts) => {
  selectedLocalId.value = -1;
  searchQuery.value = '';
  if (ts) {
    nextTick(() => drawTilesetImage(ts.tileset.imageSource));
  }
});

// On mount, mark any already-loaded tilesets so the watcher only fires for new ones
onMounted(() => {
  if (map.value) {
    for (const tsRef of map.value.tilesets) {
      loadedTilesetIds.add(tsRef.tileset.id);
    }
  }
});

// Redraw dim overlay when search query changes
watch(matchingTileIds, () => {
  const ts = activeTileset.value;
  if (ts && tilesetImage.value) {
    const canvas = tilesetCanvas.value;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tilesetImage.value, 0, 0);
    drawDimOverlay(ctx);
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

.tileset-selector {
  padding: 4px var(--panel-padding);
  border-bottom: 1px solid var(--border-color);
}

.tileset-select {
  width: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 12px;
  outline: none;
}

.tileset-select:focus {
  border-color: var(--accent);
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
