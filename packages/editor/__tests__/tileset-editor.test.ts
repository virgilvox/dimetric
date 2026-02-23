import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTilesetEditorStore } from '../src/stores/tileset-editor';
import { useProjectStore } from '../src/stores/project';
import { useEditorStore } from '../src/stores/editor';

describe('TilesetEditorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function setupProject() {
    const project = useProjectStore();
    const editor = useEditorStore();

    project.newMap({
      name: 'Test Map',
      mapSize: { width: 10, height: 10 },
      tileSize: { width: 64, height: 32 },
    });

    project.addTileset({
      name: 'Test Tileset',
      imageSource: 'data:image/png;base64,',
      imageSize: { width: 128, height: 64 },
      tileSize: { width: 64, height: 32 },
    });

    // Set selected GID to a tile in the tileset
    editor.setSelectedGid(1);

    return { project, editor };
  }

  it('ensureTileData creates tile data if not present', () => {
    setupProject();
    const tilesetEditor = useTilesetEditorStore();
    const data = tilesetEditor.ensureTileData(0);
    expect(data).toBeDefined();
    expect(data.localId).toBe(0);
  });

  it('setTileProperty adds a property', () => {
    setupProject();
    const tilesetEditor = useTilesetEditorStore();
    tilesetEditor.setTileProperty(0, 'walkable', 'bool', true);

    const tile = tilesetEditor.activeTileset!.tileset.tiles[0];
    expect(tile.properties!['walkable']).toEqual({
      name: 'walkable',
      type: 'bool',
      value: true,
    });
  });

  it('removeTileProperty removes a property', () => {
    setupProject();
    const tilesetEditor = useTilesetEditorStore();
    tilesetEditor.setTileProperty(0, 'walkable', 'bool', true);
    tilesetEditor.removeTileProperty(0, 'walkable');

    const tile = tilesetEditor.activeTileset!.tileset.tiles[0];
    expect(tile.properties!['walkable']).toBeUndefined();
  });

  it('setCollisionShapes sets collision data', () => {
    setupProject();
    const tilesetEditor = useTilesetEditorStore();
    tilesetEditor.setCollisionShapes(0, [
      { type: 'rect', data: [0, 0, 32, 16] },
    ]);

    const tile = tilesetEditor.activeTileset!.tileset.tiles[0];
    expect(tile.collision).toHaveLength(1);
    expect(tile.collision![0].type).toBe('rect');
  });

  it('setAnimationFrames sets animation data', () => {
    setupProject();
    const tilesetEditor = useTilesetEditorStore();
    tilesetEditor.setAnimationFrames(0, [
      { tileId: 0, duration: 100 },
      { tileId: 1, duration: 100 },
    ]);

    const tile = tilesetEditor.activeTileset!.tileset.tiles[0];
    expect(tile.animation).toHaveLength(2);
  });

  it('setAnimationFrames clears animation when empty', () => {
    setupProject();
    const tilesetEditor = useTilesetEditorStore();
    tilesetEditor.setAnimationFrames(0, [
      { tileId: 0, duration: 100 },
    ]);
    tilesetEditor.setAnimationFrames(0, []);

    const tile = tilesetEditor.activeTileset!.tileset.tiles[0];
    expect(tile.animation).toBeUndefined();
  });

  it('selectTile updates selectedLocalId', () => {
    setupProject();
    const tilesetEditor = useTilesetEditorStore();
    tilesetEditor.selectTile(5);
    expect(tilesetEditor.selectedLocalId).toBe(5);
  });

  it('activeTileData returns null when no tile selected', () => {
    setupProject();
    const tilesetEditor = useTilesetEditorStore();
    expect(tilesetEditor.activeTileData).toBeNull();
  });
});
