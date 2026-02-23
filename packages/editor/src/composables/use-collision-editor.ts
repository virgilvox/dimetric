import { ref, type Ref } from 'vue';
import type { DmCollisionShape, DmCollisionShapeType } from '@dimetric/core';

export type CollisionDrawMode = 'rect' | 'ellipse' | 'polygon';

export interface CollisionEditorState {
  shapes: Ref<DmCollisionShape[]>;
  drawMode: Ref<CollisionDrawMode>;
  isDrawing: Ref<boolean>;
  currentPoints: Ref<number[]>;
  selectedShapeIndex: Ref<number>;
  setShapes: (shapes: DmCollisionShape[]) => void;
  onPointerDown: (x: number, y: number) => void;
  onPointerMove: (x: number, y: number) => void;
  onPointerUp: (x: number, y: number) => void;
  finishPolygon: () => void;
  removeShape: (index: number) => void;
}

export function useCollisionEditor(
  onChanged: (shapes: DmCollisionShape[]) => void,
): CollisionEditorState {
  const shapes = ref<DmCollisionShape[]>([]);
  const drawMode = ref<CollisionDrawMode>('rect');
  const isDrawing = ref(false);
  const currentPoints = ref<number[]>([]);
  const selectedShapeIndex = ref(-1);

  let startX = 0;
  let startY = 0;

  function setShapes(newShapes: DmCollisionShape[]) {
    shapes.value = newShapes.map(s => ({ ...s, data: [...s.data] }));
  }

  function onPointerDown(x: number, y: number) {
    if (drawMode.value === 'polygon') {
      // Polygon mode: accumulate points
      currentPoints.value.push(x, y);
      isDrawing.value = true;
      return;
    }

    // Rect/ellipse mode: start drag
    startX = x;
    startY = y;
    isDrawing.value = true;
    currentPoints.value = [x, y, 0, 0];
  }

  function onPointerMove(x: number, y: number) {
    if (!isDrawing.value) return;

    if (drawMode.value === 'polygon') return; // Polygon doesn't track drag

    // Update rect/ellipse preview
    const w = x - startX;
    const h = y - startY;
    currentPoints.value = [
      Math.min(startX, x),
      Math.min(startY, y),
      Math.abs(w),
      Math.abs(h),
    ];
  }

  function onPointerUp(x: number, y: number) {
    if (!isDrawing.value) return;

    if (drawMode.value === 'polygon') return; // Polygon finishes with finishPolygon()

    isDrawing.value = false;

    const w = Math.abs(x - startX);
    const h = Math.abs(y - startY);
    if (w < 2 && h < 2) {
      currentPoints.value = [];
      return; // Too small, ignore
    }

    const shape: DmCollisionShape = {
      type: drawMode.value as DmCollisionShapeType,
      data: [Math.min(startX, x), Math.min(startY, y), w, h],
    };

    shapes.value.push(shape);
    currentPoints.value = [];
    onChanged(shapes.value);
  }

  function finishPolygon() {
    if (drawMode.value !== 'polygon' || currentPoints.value.length < 6) {
      currentPoints.value = [];
      isDrawing.value = false;
      return;
    }

    const shape: DmCollisionShape = {
      type: 'polygon',
      data: [...currentPoints.value],
    };

    shapes.value.push(shape);
    currentPoints.value = [];
    isDrawing.value = false;
    onChanged(shapes.value);
  }

  function removeShape(index: number) {
    shapes.value.splice(index, 1);
    if (selectedShapeIndex.value >= shapes.value.length) {
      selectedShapeIndex.value = -1;
    }
    onChanged(shapes.value);
  }

  return {
    shapes,
    drawMode,
    isDrawing,
    currentPoints,
    selectedShapeIndex,
    setShapes,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    finishPolygon,
    removeShape,
  };
}
