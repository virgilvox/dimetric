import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { extractGid, extractFlipFlags, composeGid } from '@dimetric/core';

export type ToolType = 'brush' | 'eraser' | 'fill' | 'pan' | 'eyedropper' | 'terrain';

export const useEditorStore = defineStore('editor', () => {
  const activeTool = ref<ToolType>('brush');
  const activeLayerId = ref<string | null>(null);
  const selectedGid = ref<number>(0);
  const showGrid = ref(true);
  const hoveredCol = ref<number | null>(null);
  const hoveredRow = ref<number | null>(null);
  const mode = ref<'edit' | 'preview'>('edit');

  /** Whether a tileset tile is selected for painting. */
  const hasBrush = computed(() => selectedGid.value > 0);

  /** Flip flags extracted from the currently selected GID. */
  const selectedFlipFlags = computed(() => extractFlipFlags(selectedGid.value));

  /** Human-readable name for the active tool. */
  const toolDisplayName = computed(() => {
    const names: Record<ToolType, string> = {
      brush: 'Brush', eraser: 'Eraser', fill: 'Fill',
      pan: 'Pan', eyedropper: 'Eyedropper', terrain: 'Terrain',
    };
    return names[activeTool.value];
  });

  /** Icon name for the active tool. */
  const toolIconName = computed(() => {
    const icons: Record<ToolType, string> = {
      brush: 'brush', eraser: 'eraser', fill: 'fill',
      pan: 'hand', eyedropper: 'eyedropper', terrain: 'terrain',
    };
    return icons[activeTool.value];
  });

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

  /** Toggle horizontal flip on the selected GID. */
  function flipSelectedH(): void {
    if (selectedGid.value <= 0) return;
    const gid = extractGid(selectedGid.value);
    const flags = extractFlipFlags(selectedGid.value);
    flags.horizontal = !flags.horizontal;
    selectedGid.value = composeGid(gid, flags);
  }

  /** Toggle vertical flip on the selected GID. */
  function flipSelectedV(): void {
    if (selectedGid.value <= 0) return;
    const gid = extractGid(selectedGid.value);
    const flags = extractFlipFlags(selectedGid.value);
    flags.vertical = !flags.vertical;
    selectedGid.value = composeGid(gid, flags);
  }

  /** Rotate the selected GID 90 degrees clockwise (Tiled convention). */
  function rotateSelected(): void {
    if (selectedGid.value <= 0) return;
    const gid = extractGid(selectedGid.value);
    const flags = extractFlipFlags(selectedGid.value);
    // Tiled 90 CW rotation: cycle through the rotation states
    // No rotation -> 90 CW (diag+H) -> 180 (H+V) -> 270 (diag+V) -> back to none
    const { horizontal: h, vertical: v, diagonal: d } = flags;
    if (!d && !h && !v) {
      // 0 -> 90: set diagonal + horizontal
      selectedGid.value = composeGid(gid, { diagonal: true, horizontal: true, vertical: false });
    } else if (d && h && !v) {
      // 90 -> 180: set horizontal + vertical
      selectedGid.value = composeGid(gid, { diagonal: false, horizontal: true, vertical: true });
    } else if (!d && h && v) {
      // 180 -> 270: set diagonal + vertical
      selectedGid.value = composeGid(gid, { diagonal: true, horizontal: false, vertical: true });
    } else {
      // 270 or other -> 0: clear all
      selectedGid.value = composeGid(gid, { diagonal: false, horizontal: false, vertical: false });
    }
  }

  return {
    activeTool,
    activeLayerId,
    selectedGid,
    showGrid,
    hoveredCol,
    hoveredRow,
    mode,
    hasBrush,
    selectedFlipFlags,
    toolDisplayName,
    toolIconName,
    setTool,
    setActiveLayer,
    setSelectedGid,
    setHoveredCell,
    toggleGrid,
    flipSelectedH,
    flipSelectedV,
    rotateSelected,
  };
});
