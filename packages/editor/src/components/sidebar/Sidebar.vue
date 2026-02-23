<template>
  <div class="sidebar">
    <PanelSection title="Tileset" icon="image" :initial-height="300">
      <TilesetPanel @textures-loaded="$emit('texturesLoaded', $event)" />
    </PanelSection>
    <PanelSection
      v-if="tilesetEditor.selectedLocalId !== null"
      title="Tile Editor"
      icon="settings"
      :initial-height="250"
    >
      <div class="mode-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab', { active: tilesetEditor.editMode === tab.id }]"
          @click="tilesetEditor.setEditMode(tab.id)"
        >
          <SvgIcon :name="tab.icon" :size="12" />
          <span>{{ tab.label }}</span>
        </button>
      </div>
      <TilePropertiesPanel v-if="tilesetEditor.editMode === 'properties'" />
      <CollisionEditor v-else-if="tilesetEditor.editMode === 'collision'" />
      <AnimationEditor v-else-if="tilesetEditor.editMode === 'animation'" />
      <TerrainPanel v-else-if="tilesetEditor.editMode === 'terrain'" />
    </PanelSection>
    <PanelSection title="Layers" icon="layers" :initial-height="250">
      <LayerPanel />
    </PanelSection>
  </div>
</template>

<script setup lang="ts">
import TilesetPanel from './TilesetPanel.vue';
import LayerPanel from './LayerPanel.vue';
import TilePropertiesPanel from './TilePropertiesPanel.vue';
import CollisionEditor from './CollisionEditor.vue';
import AnimationEditor from './AnimationEditor.vue';
import TerrainPanel from './TerrainPanel.vue';
import PanelSection from './PanelSection.vue';
import { SvgIcon } from '../icons';
import { useTilesetEditorStore, type TilesetEditMode } from '../../stores/tileset-editor';

defineEmits<{
  texturesLoaded: [textures: Map<number, any>];
}>();

const tilesetEditor = useTilesetEditorStore();

const tabs: { id: TilesetEditMode; label: string; icon: string }[] = [
  { id: 'properties', label: 'Properties', icon: 'settings' },
  { id: 'collision', label: 'Collision', icon: 'shapes' },
  { id: 'animation', label: 'Animation', icon: 'play' },
  { id: 'terrain', label: 'Terrain', icon: 'terrain' },
];
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mode-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
}

.tab {
  flex: 1;
  padding: 4px 2px;
  font-size: 10px;
  text-transform: uppercase;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  color: var(--text-primary);
  border-bottom-color: var(--accent);
}
</style>
