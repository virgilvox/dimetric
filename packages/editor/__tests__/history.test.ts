import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useHistoryStore } from '../src/stores/history';
import { useProjectStore } from '../src/stores/project';

describe('History Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function setupMap() {
    const project = useProjectStore();
    const map = project.newMap({
      name: 'Test',
      mapSize: { width: 4, height: 4 },
      tileSize: { width: 64, height: 32 },
    });
    return { project, map, layerId: map.layers[0].id };
  }

  describe('tile mutations', () => {
    it('should undo a single tile change', () => {
      const { project, map, layerId } = setupMap();
      const history = useHistoryStore();

      history.beginBatch(map.id, layerId);
      const oldGid = project.getTile(map.id, layerId, 1, 1);
      history.addToBatch(1, 1, oldGid, 42);
      project.setTile(map.id, layerId, 1, 1, 42);
      history.endBatch();

      expect(project.getTile(map.id, layerId, 1, 1)).toBe(42);
      expect(history.canUndo).toBe(true);

      history.undo();
      expect(project.getTile(map.id, layerId, 1, 1)).toBe(0);
      expect(history.canUndo).toBe(false);
    });

    it('should redo after undo', () => {
      const { project, map, layerId } = setupMap();
      const history = useHistoryStore();

      history.beginBatch(map.id, layerId);
      history.addToBatch(2, 2, 0, 10);
      project.setTile(map.id, layerId, 2, 2, 10);
      history.endBatch();

      history.undo();
      expect(project.getTile(map.id, layerId, 2, 2)).toBe(0);
      expect(history.canRedo).toBe(true);

      history.redo();
      expect(project.getTile(map.id, layerId, 2, 2)).toBe(10);
      expect(history.canRedo).toBe(false);
    });

    it('should batch multiple tile changes into one undo step', () => {
      const { project, map, layerId } = setupMap();
      const history = useHistoryStore();

      history.beginBatch(map.id, layerId);
      history.addToBatch(0, 0, 0, 1);
      project.setTile(map.id, layerId, 0, 0, 1);
      history.addToBatch(1, 0, 0, 2);
      project.setTile(map.id, layerId, 1, 0, 2);
      history.addToBatch(2, 0, 0, 3);
      project.setTile(map.id, layerId, 2, 0, 3);
      history.endBatch();

      expect(history.undoStack.length).toBe(1);

      history.undo();
      expect(project.getTile(map.id, layerId, 0, 0)).toBe(0);
      expect(project.getTile(map.id, layerId, 1, 0)).toBe(0);
      expect(project.getTile(map.id, layerId, 2, 0)).toBe(0);
    });

    it('should skip no-op changes in batch', () => {
      const { map, layerId } = setupMap();
      const history = useHistoryStore();

      history.beginBatch(map.id, layerId);
      history.addToBatch(0, 0, 0, 0); // same gid, should be skipped
      history.endBatch();

      expect(history.undoStack.length).toBe(0);
    });
  });

  describe('redo cleared on new mutation', () => {
    it('should clear redo stack when new mutation is pushed', () => {
      const { project, map, layerId } = setupMap();
      const history = useHistoryStore();

      // First mutation
      history.beginBatch(map.id, layerId);
      history.addToBatch(0, 0, 0, 5);
      project.setTile(map.id, layerId, 0, 0, 5);
      history.endBatch();

      // Undo
      history.undo();
      expect(history.canRedo).toBe(true);

      // New mutation should clear redo
      history.beginBatch(map.id, layerId);
      history.addToBatch(1, 1, 0, 10);
      project.setTile(map.id, layerId, 1, 1, 10);
      history.endBatch();

      expect(history.canRedo).toBe(false);
    });
  });

  describe('stack overflow truncation', () => {
    it('should truncate undo stack beyond max size', () => {
      const { project, map, layerId } = setupMap();
      const history = useHistoryStore();

      for (let i = 0; i < 110; i++) {
        history.beginBatch(map.id, layerId);
        history.addToBatch(0, 0, i, i + 1);
        project.setTile(map.id, layerId, 0, 0, i + 1);
        history.endBatch();
      }

      expect(history.undoStack.length).toBe(100);
    });
  });

  describe('layer operations', () => {
    it('should undo layer add', () => {
      const { project, map } = setupMap();
      const history = useHistoryStore();

      const newLayer = project.addLayer(map.id, 'New Layer');
      expect(newLayer).not.toBeNull();
      const idx = map.layers.indexOf(newLayer!);
      history.push({ type: 'layer-add', mapId: map.id, layer: newLayer!, index: idx });

      expect(map.layers.length).toBe(2);

      history.undo();
      expect(map.layers.length).toBe(1);
    });

    it('should undo layer remove', () => {
      const { project, map } = setupMap();
      const history = useHistoryStore();

      // Add a second layer so we have something to remove
      const newLayer = project.addLayer(map.id, 'Layer 2');
      expect(map.layers.length).toBe(2);

      const idx = map.layers.findIndex((l) => l.id === newLayer!.id);
      history.push({ type: 'layer-remove', mapId: map.id, layer: newLayer!, index: idx });
      project.removeLayer(map.id, newLayer!.id);

      expect(map.layers.length).toBe(1);

      history.undo();
      expect(map.layers.length).toBe(2);
      expect(map.layers[idx].name).toBe('Layer 2');
    });

    it('should undo layer property change', () => {
      const { map } = setupMap();
      const history = useHistoryStore();
      const layerId = map.layers[0].id;

      history.push({ type: 'layer-property', mapId: map.id, layerId, property: 'name', oldValue: 'Layer 1', newValue: 'Renamed' });
      map.layers[0].name = 'Renamed';

      expect(map.layers[0].name).toBe('Renamed');

      history.undo();
      expect(map.layers[0].name).toBe('Layer 1');
    });
  });

  describe('clear', () => {
    it('should clear both stacks', () => {
      const { project, map, layerId } = setupMap();
      const history = useHistoryStore();

      history.beginBatch(map.id, layerId);
      history.addToBatch(0, 0, 0, 5);
      project.setTile(map.id, layerId, 0, 0, 5);
      history.endBatch();

      history.undo();
      expect(history.canUndo).toBe(false);
      expect(history.canRedo).toBe(true);

      history.clear();
      expect(history.canUndo).toBe(false);
      expect(history.canRedo).toBe(false);
    });
  });
});
