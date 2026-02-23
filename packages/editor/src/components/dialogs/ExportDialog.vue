<script setup lang="ts">
import { ref } from 'vue';
import { useProjectStore } from '../../stores/project';
import { exportAsHtml } from '../../export/html-exporter';
import { exportAsBundle } from '../../export/bundle-exporter';
import { exportAsTmx, exportAsTmj, getMapFilename } from '../../export/tmx-exporter';
import { downloadFile } from '../../export/download';

const emit = defineEmits<{ close: [] }>();

const project = useProjectStore();
const selectedFormat = ref<'html' | 'bundle' | 'tmx' | 'tmj'>('html');

const formats = [
  { id: 'html' as const, label: 'Standalone HTML', desc: 'Self-contained HTML file with embedded runtime' },
  { id: 'bundle' as const, label: 'JSON Bundle', desc: 'Game bundle with maps, tilesets, and embedded assets' },
  { id: 'tmx' as const, label: 'Tiled TMX', desc: 'Tiled Map Editor XML format' },
  { id: 'tmj' as const, label: 'Tiled TMJ', desc: 'Tiled Map Editor JSON format' },
];

function doExport() {
  const map = project.activeMap;
  if (!map) return;

  switch (selectedFormat.value) {
    case 'html': {
      const html = exportAsHtml(map);
      downloadFile(html, getMapFilename(map, 'html'), 'text/html');
      break;
    }
    case 'bundle': {
      const bundle = exportAsBundle(map);
      const json = JSON.stringify(bundle, null, 2);
      downloadFile(json, getMapFilename(map, 'json'), 'application/json');
      break;
    }
    case 'tmx': {
      const xml = exportAsTmx(map);
      downloadFile(xml, getMapFilename(map, 'tmx'), 'application/xml');
      break;
    }
    case 'tmj': {
      const json = exportAsTmj(map);
      downloadFile(json, getMapFilename(map, 'tmj'), 'application/json');
      break;
    }
  }

  emit('close');
}
</script>

<template>
  <div class="dialog-overlay" @click.self="emit('close')">
    <div class="dialog">
      <div class="dialog-header">
        <span>Export Map</span>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>

      <div class="dialog-body">
        <div class="format-list">
          <label
            v-for="fmt in formats"
            :key="fmt.id"
            :class="['format-option', { selected: selectedFormat === fmt.id }]"
          >
            <input
              type="radio"
              :value="fmt.id"
              v-model="selectedFormat"
            />
            <div class="format-info">
              <span class="format-label">{{ fmt.label }}</span>
              <span class="format-desc">{{ fmt.desc }}</span>
            </div>
          </label>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn-cancel" @click="emit('close')">Cancel</button>
        <button class="btn-export" @click="doExport">Export</button>
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
  z-index: 100;
}

.dialog {
  background: #2a2a3e;
  border-radius: 8px;
  width: 400px;
  max-width: 90vw;
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
  font-size: 20px;
  cursor: pointer;
}

.close-btn:hover {
  color: #e0e0e0;
}

.dialog-body {
  padding: 16px 20px;
}

.format-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.format-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #444;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.format-option:hover {
  border-color: #666;
}

.format-option.selected {
  border-color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.format-option input {
  margin-top: 2px;
}

.format-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.format-label {
  color: #e0e0e0;
  font-weight: 500;
  font-size: 13px;
}

.format-desc {
  color: #888;
  font-size: 11px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #444;
}

.btn-cancel,
.btn-export {
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

.btn-export {
  background: #3498db;
  color: white;
}

.btn-export:hover {
  background: #2980b9;
}
</style>
