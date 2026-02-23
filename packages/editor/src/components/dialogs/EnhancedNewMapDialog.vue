<template>
  <div class="dialog-backdrop" @click.self="$emit('close')">
    <div class="dialog">
      <div class="dialog-header">
        <h3>New Map</h3>
        <button class="close-btn" @click="$emit('close')">
          <SvgIcon name="x" :size="16" />
        </button>
      </div>

      <!-- Orientation picker -->
      <div class="form-group">
        <label>Orientation</label>
        <div class="orientation-cards">
          <button
            v-for="o in orientations"
            :key="o.value"
            class="orientation-card"
            :class="{ selected: orientation === o.value }"
            @click="selectOrientation(o.value)"
          >
            <svg class="orientation-preview" width="40" height="30" viewBox="0 0 40 30">
              <!-- Isometric: diamond grid -->
              <template v-if="o.value === 'isometric'">
                <polygon points="20,2 38,10 20,18 2,10" fill="none" stroke="currentColor" stroke-width="1" />
                <polygon points="20,8 38,16 20,24 2,16" fill="none" stroke="currentColor" stroke-width="1" opacity="0.6" />
                <line x1="20" y1="2" x2="20" y2="8" stroke="currentColor" stroke-width="1" opacity="0.4" />
                <line x1="38" y1="10" x2="38" y2="16" stroke="currentColor" stroke-width="1" opacity="0.4" />
                <line x1="2" y1="10" x2="2" y2="16" stroke="currentColor" stroke-width="1" opacity="0.4" />
              </template>
              <!-- Orthogonal: square grid -->
              <template v-else-if="o.value === 'orthogonal'">
                <rect x="2" y="2" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" />
                <rect x="14" y="2" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" />
                <rect x="26" y="2" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" />
                <rect x="2" y="14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" />
                <rect x="14" y="14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" />
                <rect x="26" y="14" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1" />
              </template>
              <!-- Staggered: offset diamond grid -->
              <template v-else-if="o.value === 'staggered'">
                <polygon points="10,2 18,8 10,14 2,8" fill="none" stroke="currentColor" stroke-width="1" />
                <polygon points="24,2 32,8 24,14 16,8" fill="none" stroke="currentColor" stroke-width="1" />
                <polygon points="17,10 25,16 17,22 9,16" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7" />
                <polygon points="31,10 39,16 31,22 23,16" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7" />
              </template>
              <!-- Hexagonal: hex grid -->
              <template v-else-if="o.value === 'hexagonal'">
                <polygon points="10,2 17,5 17,12 10,15 3,12 3,5" fill="none" stroke="currentColor" stroke-width="1" />
                <polygon points="24,2 31,5 31,12 24,15 17,12 17,5" fill="none" stroke="currentColor" stroke-width="1" />
                <polygon points="17,14 24,17 24,24 17,27 10,24 10,17" fill="none" stroke="currentColor" stroke-width="1" opacity="0.7" />
              </template>
            </svg>
            <span class="orientation-label">{{ o.label }}</span>
          </button>
        </div>
      </div>

      <!-- Tile size presets -->
      <div class="form-group">
        <label>Tile Size</label>
        <div class="preset-buttons">
          <button
            v-for="preset in currentPresets"
            :key="preset.label"
            class="preset-btn"
            :class="{ selected: isPresetSelected(preset) }"
            @click="applyPreset(preset)"
          >
            {{ preset.label }}
            <span class="preset-size">{{ preset.w }}x{{ preset.h }}</span>
          </button>
        </div>
      </div>

      <!-- Custom tile size (shown when Custom is selected or values don't match presets) -->
      <div v-if="isCustomSize" class="form-row">
        <div class="form-group">
          <label>Tile Width (px)</label>
          <input v-model.number="tileW" type="number" min="1" />
        </div>
        <div class="form-group">
          <label>Tile Height (px)</label>
          <input v-model.number="tileH" type="number" min="1" />
        </div>
      </div>

      <!-- Map name -->
      <div class="form-group">
        <label>Map Name</label>
        <input v-model="name" type="text" />
      </div>

      <!-- Map dimensions -->
      <div class="form-row">
        <div class="form-group">
          <label>Width (tiles)</label>
          <input v-model.number="cols" type="number" min="1" max="1000" />
        </div>
        <div class="form-group">
          <label>Height (tiles)</label>
          <input v-model.number="rows" type="number" min="1" max="1000" />
        </div>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button class="btn" @click="$emit('close')">Cancel</button>
        <button class="btn btn-primary" @click="doCreate">Create</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { DmOrientation } from '@dimetric/core';
import { SvgIcon } from '../icons';

interface TileSizePreset {
  label: string;
  w: number;
  h: number;
  custom?: boolean;
}

const orientations: { value: DmOrientation; label: string }[] = [
  { value: 'isometric', label: 'Isometric' },
  { value: 'orthogonal', label: 'Orthogonal' },
  { value: 'staggered', label: 'Staggered' },
  { value: 'hexagonal', label: 'Hexagonal' },
];

const presetsByOrientation: Record<DmOrientation, TileSizePreset[]> = {
  isometric: [
    { label: 'Standard', w: 64, h: 32 },
    { label: 'HD', w: 128, h: 64 },
    { label: 'Pixel', w: 32, h: 16 },
    { label: 'Custom', w: 0, h: 0, custom: true },
  ],
  orthogonal: [
    { label: 'Small', w: 16, h: 16 },
    { label: 'Standard', w: 32, h: 32 },
    { label: 'Large', w: 64, h: 64 },
    { label: 'Custom', w: 0, h: 0, custom: true },
  ],
  staggered: [
    { label: 'Standard', w: 64, h: 32 },
    { label: 'HD', w: 128, h: 64 },
    { label: 'Pixel', w: 32, h: 16 },
    { label: 'Custom', w: 0, h: 0, custom: true },
  ],
  hexagonal: [
    { label: '64x64', w: 64, h: 64 },
    { label: '128x128', w: 128, h: 128 },
    { label: 'Custom', w: 0, h: 0, custom: true },
  ],
};

const emit = defineEmits<{
  close: [];
  create: [{
    name: string;
    cols: number;
    rows: number;
    tileWidth: number;
    tileHeight: number;
    orientation: DmOrientation;
  }];
}>();

const orientation = ref<DmOrientation>('isometric');
const name = ref('Untitled Map');
const cols = ref(20);
const rows = ref(20);
const tileW = ref(64);
const tileH = ref(32);
const isCustomSize = ref(false);

const currentPresets = computed(() => presetsByOrientation[orientation.value]);

function selectOrientation(o: DmOrientation) {
  orientation.value = o;
  // Apply the first (default) preset for the new orientation
  const presets = presetsByOrientation[o];
  const firstNonCustom = presets.find(p => !p.custom);
  if (firstNonCustom) {
    tileW.value = firstNonCustom.w;
    tileH.value = firstNonCustom.h;
    isCustomSize.value = false;
  }
}

function isPresetSelected(preset: TileSizePreset): boolean {
  if (preset.custom) return isCustomSize.value;
  return !isCustomSize.value && tileW.value === preset.w && tileH.value === preset.h;
}

function applyPreset(preset: TileSizePreset) {
  if (preset.custom) {
    isCustomSize.value = true;
  } else {
    tileW.value = preset.w;
    tileH.value = preset.h;
    isCustomSize.value = false;
  }
}

function doCreate() {
  emit('create', {
    name: name.value.trim() || 'Untitled Map',
    cols: cols.value,
    rows: rows.value,
    tileWidth: tileW.value,
    tileHeight: tileH.value,
    orientation: orientation.value,
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
  padding: 24px;
  min-width: 460px;
  max-width: 520px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

/* Orientation cards */
.orientation-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.orientation-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.orientation-card:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.orientation-card.selected {
  border-color: var(--accent);
  background: var(--bg-hover);
  color: var(--text-primary);
}

.orientation-preview {
  flex-shrink: 0;
}

.orientation-label {
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

/* Preset buttons */
.preset-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.preset-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.preset-btn.selected {
  border-color: var(--accent);
  background: var(--bg-hover);
  color: var(--text-primary);
}

.preset-size {
  font-size: 10px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.preset-btn.selected .preset-size {
  color: var(--text-secondary);
}

/* Form elements */
.form-group {
  margin-bottom: 14px;
}

.form-group label {
  display: block;
  font-size: 11px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  width: 100%;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  font-size: 13px;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

/* Actions */
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 7px 18px;
  border-radius: var(--border-radius);
  font-size: 13px;
  font-weight: 500;
  background: var(--bg-hover);
  color: var(--text-primary);
  cursor: pointer;
  border: none;
  transition: background 0.15s;
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
</style>
