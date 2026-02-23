<template>
  <div class="dialog-backdrop" @click.self="$emit('close')">
    <div class="dialog">
      <h3>Import Tileset</h3>

      <div class="form-group">
        <label>Image file</label>
        <input type="file" accept="image/*" @change="onFileChange" />
      </div>

      <div v-if="previewUrl" class="preview">
        <img :src="previewUrl" alt="Preview" />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Name</label>
          <input v-model="name" type="text" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Tile Width</label>
          <input v-model.number="tileWidth" type="number" min="1" />
        </div>
        <div class="form-group">
          <label>Tile Height</label>
          <input v-model.number="tileHeight" type="number" min="1" />
        </div>
      </div>

      <div class="dialog-actions">
        <button class="btn" @click="$emit('close')">Cancel</button>
        <button class="btn btn-primary" :disabled="!canImport" @click="doImport">Import</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const emit = defineEmits<{
  close: [];
  import: [{
    name: string;
    imageDataUrl: string;
    imageSize: { width: number; height: number };
    tileWidth: number;
    tileHeight: number;
  }];
}>();

const name = ref('');
const tileWidth = ref(64);
const tileHeight = ref(32);
const previewUrl = ref<string | null>(null);
const imageSize = ref<{ width: number; height: number } | null>(null);
const imageDataUrl = ref<string | null>(null);

const canImport = computed(() =>
  name.value.trim() && imageDataUrl.value && tileWidth.value > 0 && tileHeight.value > 0,
);

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (!name.value) {
    name.value = file.name.replace(/\.[^.]+$/, '');
  }

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result as string;
    imageDataUrl.value = dataUrl;
    previewUrl.value = dataUrl;

    const img = new Image();
    img.onload = () => {
      imageSize.value = { width: img.width, height: img.height };
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

function doImport() {
  if (!canImport.value || !imageDataUrl.value || !imageSize.value) return;
  emit('import', {
    name: name.value.trim(),
    imageDataUrl: imageDataUrl.value,
    imageSize: imageSize.value,
    tileWidth: tileWidth.value,
    tileHeight: tileHeight.value,
  });
}
</script>

<style scoped>
.dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--bg-panel);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  min-width: 360px;
  max-width: 480px;
}

.dialog h3 {
  margin-bottom: 16px;
  font-size: 16px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 4px;
  text-transform: uppercase;
}

.form-group input {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.preview {
  margin-bottom: 12px;
  max-height: 150px;
  overflow: auto;
  background: #000;
  border-radius: 4px;
  padding: 4px;
}

.preview img {
  display: block;
  max-width: 100%;
  image-rendering: pixelated;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.btn {
  padding: 6px 16px;
  border-radius: var(--border-radius);
  font-size: 13px;
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

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
