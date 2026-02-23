<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTilesetEditorStore } from '../../stores/tileset-editor';
import type { DmWangSet, DmWangColor, DmWangSetType } from '@dimetric/core';

const tilesetEditor = useTilesetEditorStore();

const selectedSetIndex = ref(0);
const selectedColorIndex = ref(0);

const newSetName = ref('');
const newSetType = ref<DmWangSetType>('corner');

const wangSets = computed<DmWangSet[]>(() => {
  const ts = tilesetEditor.activeTileset;
  if (!ts) return [];
  return ts.tileset.wangSets ?? [];
});

const activeSet = computed<DmWangSet | null>(() => {
  return wangSets.value[selectedSetIndex.value] ?? null;
});

function addWangSet() {
  const name = newSetName.value.trim();
  if (!name) return;
  const ts = tilesetEditor.activeTileset;
  if (!ts) return;

  if (!ts.tileset.wangSets) ts.tileset.wangSets = [];

  ts.tileset.wangSets.push({
    name,
    type: newSetType.value,
    colors: [],
    wangTiles: [],
  });

  selectedSetIndex.value = ts.tileset.wangSets.length - 1;
  newSetName.value = '';
}

function removeWangSet(index: number) {
  const ts = tilesetEditor.activeTileset;
  if (!ts?.tileset.wangSets) return;
  ts.tileset.wangSets.splice(index, 1);
  if (selectedSetIndex.value >= (ts.tileset.wangSets.length || 0)) {
    selectedSetIndex.value = Math.max(0, (ts.tileset.wangSets.length || 1) - 1);
  }
}

function addColor() {
  const set = activeSet.value;
  if (!set) return;
  const colorIndex = set.colors.length + 1;
  set.colors.push({
    name: `Color ${colorIndex}`,
    color: randomColor(),
    tile: 0,
    probability: 1,
  });
}

function removeColor(index: number) {
  const set = activeSet.value;
  if (!set) return;
  set.colors.splice(index, 1);
  // Remove wang tiles that reference this color
  set.wangTiles = set.wangTiles.filter(wt =>
    !wt.wangId.some(c => c === index + 1),
  );
}

function updateColorName(index: number, name: string) {
  const set = activeSet.value;
  if (!set) return;
  set.colors[index].name = name;
}

function updateColorValue(index: number, color: string) {
  const set = activeSet.value;
  if (!set) return;
  set.colors[index].color = color;
}

function selectColor(index: number) {
  selectedColorIndex.value = index;
}

function randomColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
}
</script>

<template>
  <div class="terrain-panel">
    <div v-if="!tilesetEditor.activeTileset" class="empty-state">
      No tileset loaded
    </div>
    <template v-else>
      <!-- Wang Set selector -->
      <div class="section">
        <div class="section-header">
          <span>Terrain Sets</span>
        </div>

        <div class="set-list">
          <div
            v-for="(set, i) in wangSets"
            :key="i"
            :class="['set-item', { active: i === selectedSetIndex }]"
            @click="selectedSetIndex = i"
          >
            <span>{{ set.name }} ({{ set.type }})</span>
            <button class="remove-btn" @click.stop="removeWangSet(i)">×</button>
          </div>
        </div>

        <div class="add-set">
          <input
            v-model="newSetName"
            placeholder="Set name"
            class="name-input"
            @keyup.enter="addWangSet"
          />
          <select v-model="newSetType" class="type-select">
            <option value="corner">Corner</option>
            <option value="edge">Edge</option>
            <option value="mixed">Mixed</option>
          </select>
          <button :disabled="!newSetName.trim()" @click="addWangSet">+</button>
        </div>
      </div>

      <!-- Colors for active set -->
      <div v-if="activeSet" class="section">
        <div class="section-header">
          <span>Colors</span>
          <button @click="addColor">+ Color</button>
        </div>

        <div class="color-list">
          <div
            v-for="(color, i) in activeSet.colors"
            :key="i"
            :class="['color-item', { selected: i === selectedColorIndex }]"
            @click="selectColor(i)"
          >
            <input
              type="color"
              :value="color.color"
              class="color-swatch"
              @input="updateColorValue(i, ($event.target as HTMLInputElement).value)"
              @click.stop
            />
            <input
              :value="color.name"
              class="color-name"
              @input="updateColorName(i, ($event.target as HTMLInputElement).value)"
              @click.stop
            />
            <button class="remove-btn" @click.stop="removeColor(i)">×</button>
          </div>
        </div>
      </div>

      <div v-if="activeSet" class="hint">
        Select a color above, then use the Terrain tool (T) to paint on the map.
      </div>
    </template>
  </div>
</template>

<style scoped>
.terrain-panel {
  padding: 8px;
  font-size: 12px;
}

.empty-state {
  color: #888;
  text-align: center;
  padding: 16px 0;
}

.section {
  margin-bottom: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  color: #e0e0e0;
  font-weight: bold;
}

.section-header button {
  padding: 2px 8px;
  background: #2a2a3e;
  border: 1px solid #444;
  color: #e0e0e0;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
}

.set-list,
.color-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 6px;
}

.set-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  background: #2a2a3e;
  border-radius: 3px;
  color: #aaa;
  cursor: pointer;
}

.set-item.active {
  background: #3a3a5e;
  color: #e0e0e0;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 4px;
  background: #2a2a3e;
  border-radius: 3px;
  cursor: pointer;
}

.color-item.selected {
  outline: 1px solid #3498db;
}

.color-swatch {
  width: 20px;
  height: 20px;
  border: 1px solid #444;
  border-radius: 2px;
  padding: 0;
  cursor: pointer;
}

.color-name {
  flex: 1;
  padding: 2px 4px;
  background: transparent;
  border: 1px solid transparent;
  color: #e0e0e0;
  font-size: 12px;
  border-radius: 2px;
}

.color-name:focus {
  background: #1a1a2e;
  border-color: #444;
}

.add-set {
  display: grid;
  grid-template-columns: 1fr 70px 24px;
  gap: 4px;
}

.add-set input,
.add-set select {
  padding: 2px 4px;
  background: #2a2a3e;
  border: 1px solid #444;
  color: #e0e0e0;
  border-radius: 3px;
  font-size: 12px;
}

.add-set button {
  width: 24px;
  height: 24px;
  background: #3498db;
  border: none;
  color: white;
  border-radius: 3px;
  cursor: pointer;
}

.add-set button:disabled {
  opacity: 0.5;
  cursor: default;
}

.remove-btn {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 14px;
}

.remove-btn:hover {
  color: #e74c3c;
}

.hint {
  color: #888;
  font-style: italic;
  padding: 4px 0;
}
</style>
