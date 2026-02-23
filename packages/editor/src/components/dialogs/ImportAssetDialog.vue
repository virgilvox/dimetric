<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { DmMap, DmTileset } from '@dimetric/core';
import { SvgIcon } from '../icons';
import { detectFormat, type DetectedFormat } from '../../import/format-detector';
import { handleImport, type ImportResult } from '../../import/import-handlers';
import { atlasToTileset, inferTileSizeFromAtlas } from '../../import/atlas-to-tileset';

const props = defineProps<{
  initialFiles?: File[];
}>();

const emit = defineEmits<{
  close: [];
  'import-map': [map: DmMap];
  'import-tileset': [data: { tileset: DmTileset; imageDataUrl?: string; imageSize?: { width: number; height: number } }];
  'import-project': [json: string];
}>();

// State
const selectedFile = ref<File | null>(null);
const fileContent = ref<string | null>(null);
const detectedFormat = ref<DetectedFormat>('unknown');
const importResult = ref<ImportResult | null>(null);
const isProcessing = ref(false);
const errorMessage = ref<string | null>(null);

// Image-as-tileset options
const tileWidth = ref(64);
const tileHeight = ref(32);

// Tileset image attachment
const tilesetImageFile = ref<File | null>(null);
const tilesetImageDataUrl = ref<string | null>(null);
const tilesetImageSize = ref<{ width: number; height: number } | null>(null);

// Atlas image attachment
const companionFiles = ref<File[]>([]);
const atlasImageFile = ref<File | null>(null);
const atlasImageDataUrl = ref<string | null>(null);
const atlasImageSize = ref<{ width: number; height: number } | null>(null);

const formatLabels: Record<DetectedFormat, string> = {
  'dimetric-project': 'Dimetric Project',
  'tiled-map-json': 'Tiled Map (JSON)',
  'tiled-map-xml': 'Tiled Map (XML)',
  'tiled-tileset-json': 'Tiled Tileset (JSON)',
  'tiled-tileset-xml': 'Tiled Tileset (XML)',
  'aseprite-json': 'Aseprite Atlas',
  'texturepacker-json': 'TexturePacker Atlas',
  'image': 'Image',
  'unknown': 'Unknown',
};

const canImport = computed(() => {
  if (!importResult.value || isProcessing.value) return false;
  if (detectedFormat.value === 'unknown') return false;

  // Tileset needs an image
  if (importResult.value.type === 'tileset') {
    return !!tilesetImageDataUrl.value;
  }

  // Atlas needs an image to convert to tileset
  if (importResult.value.type === 'atlas') {
    return !!atlasImageDataUrl.value;
  }

  return true;
});

// Summary info for preview
const previewInfo = computed(() => {
  const result = importResult.value;
  if (!result) return null;

  switch (result.type) {
    case 'map': {
      const map = result.map!;
      return {
        items: [
          { label: 'Name', value: map.name },
          { label: 'Size', value: `${map.mapSize.width} x ${map.mapSize.height}` },
          { label: 'Tile Size', value: `${map.tileSize.width} x ${map.tileSize.height}` },
          { label: 'Layers', value: String(map.layers.length) },
          { label: 'Tilesets', value: String(map.tilesets.length) },
        ],
      };
    }
    case 'tileset': {
      const ts = result.tileset!;
      return {
        items: [
          { label: 'Name', value: ts.name },
          { label: 'Tile Size', value: `${ts.tileSize.width} x ${ts.tileSize.height}` },
          { label: 'Tile Count', value: String(ts.tileCount) },
          { label: 'Columns', value: String(ts.columns) },
        ],
      };
    }
    case 'atlas': {
      const atlas = result.atlas!;
      return {
        items: [
          { label: 'Image', value: atlas.image },
          { label: 'Size', value: `${atlas.size.w} x ${atlas.size.h}` },
          { label: 'Frames', value: String(atlas.frames.length) },
        ],
      };
    }
    case 'image': {
      return {
        items: [
          { label: 'Size', value: `${result.imageSize!.width} x ${result.imageSize!.height}` },
        ],
      };
    }
    case 'project': {
      let projectName = 'Unknown';
      try {
        const parsed = JSON.parse(result.projectJson!);
        projectName = parsed.name ?? 'Untitled';
      } catch {
        // ignore
      }
      return {
        items: [
          { label: 'Project', value: projectName },
          { label: 'Action', value: 'Replace current project' },
        ],
      };
    }
    default:
      return null;
  }
});

// Process initial files if provided
watch(
  () => props.initialFiles,
  (files) => {
    if (files && files.length > 0) {
      processFiles(files);
    }
  },
  { immediate: true },
);

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

async function processFiles(files: File[]) {
  // Categorize files into image and metadata
  const imageFiles: File[] = [];
  const metadataFiles: File[] = [];

  for (const f of files) {
    const ext = f.name.toLowerCase().substring(f.name.lastIndexOf('.'));
    if (IMAGE_EXTENSIONS.has(ext)) {
      imageFiles.push(f);
    } else {
      metadataFiles.push(f);
    }
  }

  // Pick primary file: prefer metadata, fall back to first file
  const primary = metadataFiles.length > 0 ? metadataFiles[0] : files[0];
  companionFiles.value = files.filter((f) => f !== primary);

  await processFile(primary);

  // After processing, if result is atlas, try to auto-match an image
  if (importResult.value?.type === 'atlas' && importResult.value.atlas) {
    const atlasImageName = importResult.value.atlas.image;
    // Try exact filename match among companion image files
    let matched = imageFiles.find(
      (f) => f.name === atlasImageName,
    );
    // Fallback: if only one image was dropped, use it
    if (!matched && imageFiles.length === 1) {
      matched = imageFiles[0];
    }
    if (matched) {
      await loadAtlasImage(matched);
    }
  }
}

async function processFile(file: File) {
  selectedFile.value = file;
  fileContent.value = null;
  importResult.value = null;
  errorMessage.value = null;
  atlasImageFile.value = null;
  atlasImageDataUrl.value = null;
  atlasImageSize.value = null;
  isProcessing.value = true;

  try {
    // Read content for format detection (text files only)
    let content: string | undefined;
    const name = file.name.toLowerCase();
    const ext = name.substring(name.lastIndexOf('.'));
    const textExtensions = new Set(['.json', '.tmj', '.tsj', '.tmx', '.tsx', '.dimetric']);
    if (textExtensions.has(ext) || name.endsWith('.dimetric.json')) {
      content = await file.text();
      fileContent.value = content;
    }

    detectedFormat.value = detectFormat(file, content);
    importResult.value = await handleImport(file, detectedFormat.value);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : String(err);
  } finally {
    isProcessing.value = false;
  }
}

function onBrowseClick() {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = '.json,.dimetric,.tmj,.tmx,.tsx,.tsj,.png,.jpg,.jpeg,.webp';
  input.onchange = () => {
    const files = input.files;
    if (files && files.length > 0) {
      processFiles(Array.from(files));
    }
  };
  input.click();
}

function onDropZoneDrop(e: DragEvent) {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    processFiles(Array.from(files));
  }
}

function onDropZoneDragOver(e: DragEvent) {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'copy';
  }
}

function onBrowseTilesetImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.png,.jpg,.jpeg,.webp';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    tilesetImageFile.value = file;
    const dataUrl = await readFileAsDataUrl(file);
    tilesetImageDataUrl.value = dataUrl;
    tilesetImageSize.value = await getImageSize(dataUrl);
  };
  input.click();
}

async function loadAtlasImage(file: File) {
  atlasImageFile.value = file;
  const dataUrl = await readFileAsDataUrl(file);
  atlasImageDataUrl.value = dataUrl;
  atlasImageSize.value = await getImageSize(dataUrl);

  // Pre-populate tile dimensions from atlas frame data
  if (importResult.value?.atlas) {
    const inferred = inferTileSizeFromAtlas(importResult.value.atlas);
    tileWidth.value = inferred.width;
    tileHeight.value = inferred.height;
  }
}

function onBrowseAtlasImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.png,.jpg,.jpeg,.webp';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (file) await loadAtlasImage(file);
  };
  input.click();
}

function doImport() {
  const result = importResult.value;
  if (!result) return;

  switch (result.type) {
    case 'map':
      if (result.map) emit('import-map', result.map);
      break;
    case 'tileset':
      if (result.tileset) {
        emit('import-tileset', {
          tileset: result.tileset,
          imageDataUrl: tilesetImageDataUrl.value ?? undefined,
          imageSize: tilesetImageSize.value ?? undefined,
        });
      }
      break;
    case 'project':
      if (result.projectJson) emit('import-project', result.projectJson);
      break;
    case 'image':
      // Treat image as a tileset import with tile dimensions
      if (result.imageDataUrl && result.imageSize) {
        emit('import-tileset', {
          tileset: {
            id: '',
            name: selectedFile.value?.name.replace(/\.[^.]+$/, '') ?? 'Untitled',
            imageSource: result.imageDataUrl,
            imageSize: { width: result.imageSize.width, height: result.imageSize.height },
            tileSize: { width: tileWidth.value, height: tileHeight.value },
            columns: Math.floor(result.imageSize.width / tileWidth.value),
            tileCount: Math.floor(result.imageSize.width / tileWidth.value) * Math.floor(result.imageSize.height / tileHeight.value),
            spacing: 0,
            margin: 0,
            tiles: {},
          },
          imageDataUrl: result.imageDataUrl,
          imageSize: result.imageSize,
        });
      }
      break;
    case 'atlas':
      if (result.atlas && atlasImageDataUrl.value && atlasImageSize.value) {
        const tileset = atlasToTileset({
          atlas: result.atlas,
          imageDataUrl: atlasImageDataUrl.value,
          imageSize: atlasImageSize.value,
          tileSizeOverride: { width: tileWidth.value, height: tileHeight.value },
        });
        emit('import-tileset', {
          tileset,
          imageDataUrl: atlasImageDataUrl.value,
          imageSize: atlasImageSize.value,
        });
      }
      break;
  }

  emit('close');
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function getImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}
</script>

<template>
  <div class="dialog-overlay" @click.self="emit('close')">
    <div class="dialog">
      <div class="dialog-header">
        <span>Import Asset</span>
        <button class="close-btn" @click="emit('close')">
          <SvgIcon name="x" :size="16" />
        </button>
      </div>

      <div class="dialog-body">
        <!-- File drop zone (shown when no file selected) -->
        <div
          v-if="!selectedFile"
          class="file-drop-zone"
          @drop="onDropZoneDrop"
          @dragover="onDropZoneDragOver"
          @click="onBrowseClick"
        >
          <SvgIcon name="upload" :size="32" />
          <span class="drop-label">Drop a file here or click to browse</span>
          <span class="drop-hint">
            Supports: .json, .tmj, .tmx, .tsx, .tsj, .png, .jpg, .webp
          </span>
        </div>

        <!-- Processing indicator -->
        <div v-else-if="isProcessing" class="processing">
          <span>Processing {{ selectedFile.name }}...</span>
        </div>

        <!-- Error state -->
        <div v-else-if="errorMessage" class="import-error">
          <p class="error-text">{{ errorMessage }}</p>
          <button class="btn" @click="selectedFile = null; errorMessage = null">
            Try another file
          </button>
        </div>

        <!-- File selected: show format + preview -->
        <template v-else-if="importResult">
          <div class="file-info">
            <div class="file-name-row">
              <SvgIcon name="folder-open" :size="16" />
              <span class="file-name">{{ selectedFile.name }}</span>
              <button class="btn-change" @click="selectedFile = null; importResult = null">
                Change
              </button>
            </div>
            <span class="format-badge">{{ formatLabels[detectedFormat] }}</span>
          </div>

          <!-- Preview info -->
          <div v-if="previewInfo" class="preview-info">
            <div v-for="item in previewInfo.items" :key="item.label" class="info-row">
              <span class="info-label">{{ item.label }}</span>
              <span class="info-value">{{ item.value }}</span>
            </div>
          </div>

          <!-- Image preview -->
          <div v-if="importResult.type === 'image' && importResult.imageDataUrl" class="image-preview">
            <img :src="importResult.imageDataUrl" alt="Preview" class="preview-img" />
            <div class="form-row">
              <div class="form-group">
                <label>Tile Width (px)</label>
                <input v-model.number="tileWidth" type="number" min="1" />
              </div>
              <div class="form-group">
                <label>Tile Height (px)</label>
                <input v-model.number="tileHeight" type="number" min="1" />
              </div>
            </div>
          </div>

          <!-- Tileset: needs image file -->
          <div v-if="importResult.type === 'tileset'" class="tileset-image-section">
            <p class="section-note">
              This tileset requires an image file. Select the tileset image:
            </p>
            <div v-if="!tilesetImageDataUrl" class="image-browse" @click="onBrowseTilesetImage">
              <SvgIcon name="image" :size="20" />
              <span>Browse for image...</span>
            </div>
            <div v-else class="tileset-image-preview">
              <img :src="tilesetImageDataUrl" alt="Tileset image" class="preview-img" />
              <div class="image-info">
                <span>{{ tilesetImageFile?.name }}</span>
                <span class="dim">{{ tilesetImageSize?.width }} x {{ tilesetImageSize?.height }}</span>
              </div>
            </div>
          </div>

          <!-- Atlas: needs image file -->
          <div v-if="importResult.type === 'atlas'" class="tileset-image-section">
            <p class="section-note">
              This atlas describes tiles in an image file. Select the atlas image to import as a tileset:
            </p>
            <div v-if="!atlasImageDataUrl" class="image-browse" @click="onBrowseAtlasImage">
              <SvgIcon name="image" :size="20" />
              <span>Browse for image{{ importResult.atlas?.image ? `: ${importResult.atlas.image}` : '...' }}</span>
            </div>
            <div v-else class="atlas-image-loaded">
              <img :src="atlasImageDataUrl" alt="Atlas image" class="preview-img" />
              <div class="image-info">
                <span>{{ atlasImageFile?.name }}</span>
                <span class="dim">{{ atlasImageSize?.width }} x {{ atlasImageSize?.height }}</span>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Tile Width (px)</label>
                  <input v-model.number="tileWidth" type="number" min="1" />
                </div>
                <div class="form-group">
                  <label>Tile Height (px)</label>
                  <input v-model.number="tileHeight" type="number" min="1" />
                </div>
              </div>
            </div>
          </div>

          <!-- Project: confirmation warning -->
          <div v-if="importResult.type === 'project'" class="project-warning">
            This will replace your current project. Unsaved changes will be lost.
          </div>
        </template>
      </div>

      <div class="dialog-footer">
        <button class="btn-cancel" @click="emit('close')">Cancel</button>
        <button
          class="btn-import"
          :disabled="!canImport"
          @click="doImport"
        >
          Import
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: #2a2a3e;
  border-radius: 8px;
  width: 460px;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #444;
  font-weight: bold;
  color: #e0e0e0;
}

.close-btn {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

.close-btn:hover {
  color: #e0e0e0;
}

.dialog-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #444;
}

/* File drop zone */
.file-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 24px;
  border: 2px dashed #555;
  border-radius: 8px;
  cursor: pointer;
  color: #999;
  transition: border-color 0.15s, color 0.15s;
}

.file-drop-zone:hover {
  border-color: #3498db;
  color: #ccc;
}

.drop-label {
  font-size: 14px;
  font-weight: 500;
}

.drop-hint {
  font-size: 11px;
  color: #666;
}

/* Processing */
.processing {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #aaa;
  font-size: 13px;
}

/* Error */
.import-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
}

.error-text {
  color: #e74c3c;
  font-size: 13px;
  text-align: center;
}

/* File info */
.file-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.file-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 13px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-change {
  background: transparent;
  border: 1px solid #555;
  color: #aaa;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-change:hover {
  color: #e0e0e0;
  border-color: #777;
}

.format-badge {
  display: inline-block;
  align-self: flex-start;
  background: rgba(52, 152, 219, 0.15);
  color: #3498db;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

/* Preview info */
.preview-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.info-label {
  color: #888;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.5px;
}

.info-value {
  color: #ccc;
}

/* Image preview */
.image-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-img {
  max-width: 100%;
  max-height: 160px;
  object-fit: contain;
  border-radius: 4px;
  background: repeating-conic-gradient(#333 0% 25%, #444 0% 50%) 50% / 16px 16px;
  align-self: center;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  font-size: 11px;
  color: #888;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.form-group input {
  width: 100%;
  padding: 6px 8px;
  background: #1e1e2e;
  border: 1px solid #444;
  border-radius: 4px;
  color: #e0e0e0;
  font-size: 13px;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

/* Tileset image section */
.tileset-image-section {
  margin-top: 12px;
}

.section-note {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 8px;
}

.image-browse {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px dashed #555;
  border-radius: 6px;
  cursor: pointer;
  color: #999;
  font-size: 13px;
  transition: border-color 0.15s;
}

.image-browse:hover {
  border-color: #3498db;
  color: #ccc;
}

.tileset-image-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #aaa;
}

.image-info .dim {
  color: #666;
}

.atlas-image-loaded {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Project warning */
.project-warning {
  padding: 12px;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 6px;
  color: #e74c3c;
  font-size: 12px;
  margin-top: 12px;
}

/* Buttons */
.btn {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  border: none;
  background: #444;
  color: #e0e0e0;
}

.btn:hover {
  background: #555;
}

.btn-cancel,
.btn-import {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  background: #444;
  color: #e0e0e0;
}

.btn-cancel:hover {
  background: #555;
}

.btn-import {
  background: #3498db;
  color: white;
}

.btn-import:hover:not(:disabled) {
  background: #2980b9;
}

.btn-import:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
