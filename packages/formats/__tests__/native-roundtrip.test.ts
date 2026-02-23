import { describe, it, expect, beforeEach } from 'vitest';
import { createMap, createObjectLayer, createTileset, resetIdCounter, PROJECT_VERSION, type DmProject } from '@dimetric/core';
import { serializeProject, serializeProjectToJson } from '../src/native/serialize';
import { deserializeProject, deserializeProjectFromJson } from '../src/native/deserialize';
import { FORMAT_MAGIC } from '../src/native/schema';

beforeEach(() => {
  resetIdCounter();
});

function makeTestProject(): DmProject {
  const tileset = createTileset({
    name: 'Terrain',
    imageSource: 'data:image/png;base64,abc',
    imageSize: { width: 256, height: 128 },
    tileSize: { width: 64, height: 32 },
  });

  const map = createMap({
    name: 'Test Map',
    mapSize: { width: 10, height: 10 },
    tileSize: { width: 64, height: 32 },
  });

  // Add tileset reference
  map.tilesets.push({ firstGid: 1, tileset });

  // Paint some tiles
  const layer = map.layers[0];
  if (layer.type === 'tile') {
    layer.data[0] = 1;
    layer.data[1] = 2;
    layer.data[15] = 5;
  }

  return {
    version: PROJECT_VERSION,
    name: 'Test Project',
    maps: [map],
    tilesets: [tileset],
  };
}

describe('native format round-trip', () => {
  it('serializes and deserializes a project through JSON', () => {
    const original = makeTestProject();
    const json = serializeProjectToJson(original);
    const restored = deserializeProjectFromJson(json);

    expect(restored.name).toBe('Test Project');
    expect(restored.maps).toHaveLength(1);
    expect(restored.tilesets).toHaveLength(1);
  });

  it('preserves map structure', () => {
    const original = makeTestProject();
    const json = serializeProjectToJson(original);
    const restored = deserializeProjectFromJson(json);

    const map = restored.maps[0];
    expect(map.name).toBe('Test Map');
    expect(map.orientation).toBe('isometric');
    expect(map.mapSize).toEqual({ width: 10, height: 10 });
    expect(map.tileSize).toEqual({ width: 64, height: 32 });
    expect(map.layers).toHaveLength(1);
    expect(map.tilesets).toHaveLength(1);
  });

  it('preserves tile data as Uint32Array', () => {
    const original = makeTestProject();
    const json = serializeProjectToJson(original);
    const restored = deserializeProjectFromJson(json);

    const layer = restored.maps[0].layers[0];
    expect(layer.type).toBe('tile');
    if (layer.type === 'tile') {
      expect(layer.data).toBeInstanceOf(Uint32Array);
      expect(layer.data[0]).toBe(1);
      expect(layer.data[1]).toBe(2);
      expect(layer.data[15]).toBe(5);
      expect(layer.data[3]).toBe(0);
    }
  });

  it('preserves tileset data', () => {
    const original = makeTestProject();
    const json = serializeProjectToJson(original);
    const restored = deserializeProjectFromJson(json);

    const ts = restored.tilesets[0];
    expect(ts.name).toBe('Terrain');
    expect(ts.imageSource).toBe('data:image/png;base64,abc');
    expect(ts.tileSize).toEqual({ width: 64, height: 32 });
    expect(ts.columns).toBe(4);
    expect(ts.tileCount).toBe(16);
  });

  it('links tileset refs in maps to deserialized tilesets', () => {
    const original = makeTestProject();
    const json = serializeProjectToJson(original);
    const restored = deserializeProjectFromJson(json);

    const ref = restored.maps[0].tilesets[0];
    expect(ref.firstGid).toBe(1);
    expect(ref.tileset.id).toBe(restored.tilesets[0].id);
  });

  it('rejects files without format marker', () => {
    expect(() => deserializeProject({ name: 'bad' })).toThrow('Not a Dimetric project file');
  });

  it('includes format marker and version in serialized output', () => {
    const original = makeTestProject();
    const serialized = serializeProject(original);
    expect(serialized._format).toBe('dimetric-project');
    expect(serialized._version).toBe(1);
  });
});

describe('deserialization validation', () => {
  it('rejects null input', () => {
    expect(() => deserializeProject(null)).toThrow('expected an object');
  });

  it('rejects undefined input', () => {
    expect(() => deserializeProject(undefined)).toThrow('expected an object');
  });

  it('rejects number input', () => {
    expect(() => deserializeProject(42)).toThrow('expected an object');
  });

  it('rejects string input', () => {
    expect(() => deserializeProject('hello')).toThrow('expected an object');
  });

  it('rejects object without format marker', () => {
    expect(() => deserializeProject({ name: 'bad' })).toThrow('missing format marker');
  });

  it('rejects object with missing tilesets array', () => {
    expect(() => deserializeProject({
      _format: FORMAT_MAGIC,
      _version: 1,
      name: 'bad',
      maps: [],
    })).toThrow('missing tilesets array');
  });

  it('rejects object with missing maps array', () => {
    expect(() => deserializeProject({
      _format: FORMAT_MAGIC,
      _version: 1,
      name: 'bad',
      tilesets: [],
    })).toThrow('missing maps array');
  });

  it('rejects tile layer with missing width', () => {
    const project = makeTestProject();
    const serialized = serializeProject(project);
    const layer = serialized.maps[0].layers[0];
    delete (layer as any).width;
    expect(() => deserializeProject(serialized)).toThrow('width must be a positive number');
  });

  it('rejects tile layer with missing data', () => {
    const project = makeTestProject();
    const serialized = serializeProject(project);
    const layer = serialized.maps[0].layers[0];
    delete (layer as any).data;
    expect(() => deserializeProject(serialized)).toThrow('missing data array');
  });
});

describe('object layer round-trip', () => {
  it('round-trips a project with an object layer', () => {
    const project = makeTestProject();
    const objLayer = createObjectLayer({ name: 'Objects' });
    project.maps[0].layers.push(objLayer);

    const json = serializeProjectToJson(project);
    const restored = deserializeProjectFromJson(json);

    expect(restored.maps[0].layers).toHaveLength(2);
    const restoredObjLayer = restored.maps[0].layers[1];
    expect(restoredObjLayer.type).toBe('object');
    expect(restoredObjLayer.name).toBe('Objects');
    if (restoredObjLayer.type === 'object') {
      expect(restoredObjLayer.objects).toEqual([]);
    }
  });
});

describe('empty map round-trip', () => {
  it('round-trips a project with no tilesets and an empty map', () => {
    const map = createMap({ name: 'Empty' });
    const project: DmProject = {
      version: PROJECT_VERSION,
      name: 'Empty Project',
      maps: [map],
      tilesets: [],
    };

    const json = serializeProjectToJson(project);
    const restored = deserializeProjectFromJson(json);

    expect(restored.name).toBe('Empty Project');
    expect(restored.tilesets).toEqual([]);
    expect(restored.maps).toHaveLength(1);
    expect(restored.maps[0].tilesets).toEqual([]);
  });
});

describe('properties round-trip', () => {
  it('preserves map properties through serialization', () => {
    const project = makeTestProject();
    project.maps[0].properties = { difficulty: 'hard', level: 3 };

    const json = serializeProjectToJson(project);
    const restored = deserializeProjectFromJson(json);

    expect(restored.maps[0].properties).toEqual({ difficulty: 'hard', level: 3 });
  });
});
