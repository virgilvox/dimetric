<template>
  <div class="dialog-backdrop" @click.self="$emit('close')">
    <div class="dialog">
      <h3>New Map</h3>

      <div class="form-group">
        <label>Name</label>
        <input v-model="name" type="text" />
      </div>

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

      <div class="form-row">
        <div class="form-group">
          <label>Tile Width (px)</label>
          <input v-model.number="tileW" type="number" min="1" />
        </div>
        <div class="form-group">
          <label>Tile Height (px)</label>
          <input v-model.number="tileH" type="number" min="1" />
        </div>
      </div>

      <div class="dialog-actions">
        <button class="btn" @click="$emit('close')">Cancel</button>
        <button class="btn btn-primary" @click="doCreate">Create</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  close: [];
  create: [{
    name: string;
    cols: number;
    rows: number;
    tileWidth: number;
    tileHeight: number;
  }];
}>();

const name = ref('Untitled Map');
const cols = ref(20);
const rows = ref(20);
const tileW = ref(64);
const tileH = ref(32);

function doCreate() {
  emit('create', {
    name: name.value.trim() || 'Untitled Map',
    cols: cols.value,
    rows: rows.value,
    tileWidth: tileW.value,
    tileHeight: tileH.value,
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
</style>
