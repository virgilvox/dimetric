<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useTilesetEditorStore } from '../../stores/tileset-editor';
import { useCollisionEditor } from '../../composables/use-collision-editor';
import { editorBus } from '../../events/bus';
import type { DmCollisionShape } from '@dimetric/core';

const tilesetEditor = useTilesetEditorStore();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const SCALE = 4; // 4× zoom for editing
const tileW = 64;
const tileH = 32;
const canvasW = tileW * SCALE;
const canvasH = tileH * SCALE;

const editor = useCollisionEditor((shapes: DmCollisionShape[]) => {
  if (tilesetEditor.selectedLocalId === null) return;
  tilesetEditor.setCollisionShapes(tilesetEditor.selectedLocalId, shapes);
  editorBus.emit('map:changed');
});

// Load shapes when tile selection changes
watch(() => tilesetEditor.activeTileData, (data) => {
  editor.setShapes(data?.collision ?? []);
  draw();
}, { immediate: true });

function toCanvasCoords(e: MouseEvent): { x: number; y: number } {
  const canvas = canvasRef.value!;
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - rect.left) / rect.width) * tileW,
    y: ((e.clientY - rect.top) / rect.height) * tileH,
  };
}

function onDown(e: MouseEvent) {
  const { x, y } = toCanvasCoords(e);
  editor.onPointerDown(x, y);
  draw();
}

function onMove(e: MouseEvent) {
  const { x, y } = toCanvasCoords(e);
  editor.onPointerMove(x, y);
  draw();
}

function onUp(e: MouseEvent) {
  const { x, y } = toCanvasCoords(e);
  editor.onPointerUp(x, y);
  draw();
}

function draw() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvasW, canvasH);

  ctx.save();
  ctx.scale(SCALE, SCALE);

  // Draw tile diamond outline
  ctx.beginPath();
  ctx.moveTo(tileW / 2, 0);
  ctx.lineTo(tileW, tileH / 2);
  ctx.lineTo(tileW / 2, tileH);
  ctx.lineTo(0, tileH / 2);
  ctx.closePath();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Draw existing shapes
  for (let i = 0; i < editor.shapes.value.length; i++) {
    const shape = editor.shapes.value[i];
    const selected = i === editor.selectedShapeIndex.value;
    ctx.fillStyle = selected ? 'rgba(52, 152, 219, 0.4)' : 'rgba(231, 76, 60, 0.3)';
    ctx.strokeStyle = selected ? '#3498db' : '#e74c3c';
    ctx.lineWidth = 0.5;

    drawShape(ctx, shape);
  }

  // Draw current in-progress shape
  if (editor.isDrawing.value && editor.currentPoints.value.length >= 2) {
    ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 0.5;

    if (editor.drawMode.value === 'polygon') {
      const pts = editor.currentPoints.value;
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) {
        ctx.lineTo(pts[i], pts[i + 1]);
      }
      ctx.stroke();
      // Draw points
      for (let i = 0; i < pts.length; i += 2) {
        ctx.fillRect(pts[i] - 1, pts[i + 1] - 1, 2, 2);
      }
    } else {
      const [x, y, w, h] = editor.currentPoints.value;
      if (editor.drawMode.value === 'rect') {
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
      } else {
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

function drawShape(ctx: CanvasRenderingContext2D, shape: DmCollisionShape) {
  const d = shape.data;
  switch (shape.type) {
    case 'rect':
      ctx.fillRect(d[0], d[1], d[2], d[3]);
      ctx.strokeRect(d[0], d[1], d[2], d[3]);
      break;
    case 'ellipse':
      ctx.beginPath();
      ctx.ellipse(d[0] + d[2] / 2, d[1] + d[3] / 2, d[2] / 2, d[3] / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'polygon':
      if (d.length >= 6) {
        ctx.beginPath();
        ctx.moveTo(d[0], d[1]);
        for (let i = 2; i < d.length; i += 2) {
          ctx.lineTo(d[i], d[i + 1]);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      break;
  }
}

onMounted(draw);
</script>

<template>
  <div class="collision-editor">
    <div v-if="tilesetEditor.selectedLocalId === null" class="empty-state">
      Select a tile to edit collision
    </div>
    <template v-else>
      <div class="toolbar">
        <button
          v-for="mode in (['rect', 'ellipse', 'polygon'] as const)"
          :key="mode"
          :class="{ active: editor.drawMode.value === mode }"
          @click="editor.drawMode.value = mode"
        >
          {{ mode[0].toUpperCase() + mode.slice(1) }}
        </button>
        <button
          v-if="editor.drawMode.value === 'polygon' && editor.isDrawing.value"
          @click="editor.finishPolygon(); draw()"
        >
          Done
        </button>
      </div>

      <canvas
        ref="canvasRef"
        :width="canvasW"
        :height="canvasH"
        class="collision-canvas"
        @pointerdown="onDown"
        @pointermove="onMove"
        @pointerup="onUp"
      />

      <div class="shape-list">
        <div v-for="(shape, i) in editor.shapes.value" :key="i" class="shape-item">
          <span
            :class="{ selected: i === editor.selectedShapeIndex.value }"
            @click="editor.selectedShapeIndex.value = i; draw()"
          >
            {{ shape.type }} {{ i + 1 }}
          </span>
          <button class="remove-btn" @click="editor.removeShape(i); draw()">×</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.collision-editor {
  padding: 8px;
  font-size: 12px;
}

.empty-state {
  color: #888;
  text-align: center;
  padding: 16px 0;
}

.toolbar {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
}

.toolbar button {
  padding: 3px 8px;
  background: #2a2a3e;
  border: 1px solid #444;
  color: #e0e0e0;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
}

.toolbar button.active {
  background: #3498db;
  border-color: #3498db;
}

.collision-canvas {
  display: block;
  width: 100%;
  max-width: 256px;
  aspect-ratio: 2/1;
  background: #1a1a2e;
  border: 1px solid #444;
  border-radius: 3px;
  cursor: crosshair;
}

.shape-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.shape-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 4px;
  color: #aaa;
}

.shape-item span {
  cursor: pointer;
}

.shape-item span.selected {
  color: #3498db;
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
</style>
