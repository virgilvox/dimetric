import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type ToolType = 'brush' | 'eraser' | 'fill' | 'pan' | 'eyedropper';

export const useEditorStore = defineStore('editor', () => {
  const activeTool = ref<ToolType>('brush');
  const activeLayerId = ref<string | null>(null);
  const selectedGid = ref<number>(0);
  const showGrid = ref(true);
  const hoveredCol = ref<number | null>(null);
  const hoveredRow = ref<number | null>(null);

  /** Whether a tileset tile is selected for painting. */
  const hasBrush = computed(() => selectedGid.value > 0);

  function setTool(tool: ToolType): void {
    activeTool.value = tool;
  }

  function setActiveLayer(layerId: string): void {
    activeLayerId.value = layerId;
  }

  function setSelectedGid(gid: number): void {
    selectedGid.value = gid;
  }

  function setHoveredCell(col: number | null, row: number | null): void {
    hoveredCol.value = col;
    hoveredRow.value = row;
  }

  function toggleGrid(): void {
    showGrid.value = !showGrid.value;
  }

  return {
    activeTool,
    activeLayerId,
    selectedGid,
    showGrid,
    hoveredCol,
    hoveredRow,
    hasBrush,
    setTool,
    setActiveLayer,
    setSelectedGid,
    setHoveredCell,
    toggleGrid,
  };
});
