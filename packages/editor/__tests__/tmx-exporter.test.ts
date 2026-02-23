import { describe, it, expect } from 'vitest';
import { getMapFilename } from '../src/export/tmx-exporter';
import type { DmMap } from '@dimetric/core';

function createMinimalMap(name: string): DmMap {
  return {
    id: 'test',
    name,
    orientation: 'isometric',
    renderOrder: 'right-down',
    mapSize: { width: 5, height: 5 },
    tileSize: { width: 64, height: 32 },
    layers: [],
    tilesets: [],
  };
}

describe('tmx-exporter', () => {
  describe('getMapFilename', () => {
    it('generates filename from map name', () => {
      const map = createMinimalMap('My Cool Map');
      expect(getMapFilename(map, 'tmx')).toBe('my-cool-map.tmx');
    });

    it('handles special characters', () => {
      const map = createMinimalMap('Test Map! (v2)');
      expect(getMapFilename(map, 'tmj')).toBe('test-map-v2.tmj');
    });

    it('defaults to untitled', () => {
      const map = createMinimalMap('');
      expect(getMapFilename(map, 'tmx')).toBe('untitled.tmx');
    });
  });
});
