import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PreviewManager } from '../src/preview/preview-manager';
import type { DmMap } from '@dimetric/core';

// Stub globals for Node environment
vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(cb, 16));
vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));

// Minimal DOM stubs
if (typeof document === 'undefined') {
  const mockEl = {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 800, height: 600 })),
  };
  vi.stubGlobal('document', { createElement: () => mockEl });
}

function createMockMap(): DmMap {
  return {
    id: 'test',
    name: 'Test',
    orientation: 'isometric',
    renderOrder: 'right-down',
    mapSize: { width: 10, height: 10 },
    tileSize: { width: 64, height: 32 },
    layers: [
      {
        id: 'ground',
        name: 'Ground',
        type: 'tile',
        visible: true,
        locked: false,
        opacity: 1,
        offset: { x: 0, y: 0 },
        width: 10,
        height: 10,
        data: new Uint32Array(100).fill(1),
      },
    ],
    tilesets: [],
  };
}

function createMockRenderer(): any {
  return {
    setGridVisible: vi.fn(),
    setMap: vi.fn(),
    rebuildLayers: vi.fn(),
    camera: {
      getState: vi.fn(() => ({ x: 0, y: 0, zoom: 1 })),
      panTo: vi.fn(),
      setZoom: vi.fn(),
    },
    getViewport: vi.fn(() => ({
      viewport: { addChild: vi.fn() },
      screenToWorld: vi.fn(() => ({ x: 0, y: 0 })),
    })),
    getApp: vi.fn(() => ({
      canvas: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        getBoundingClientRect: vi.fn(() => ({ left: 0, top: 0, width: 800, height: 600 })),
      },
      renderer: {
        generateTexture: vi.fn(() => ({
          destroy: vi.fn(),
        })),
      },
    })),
    highlight: { hide: vi.fn() },
    cursor: { hide: vi.fn() },
  };
}

describe('PreviewManager', () => {
  let pm: PreviewManager;

  beforeEach(() => {
    pm = new PreviewManager();
  });

  it('isActive is false initially', () => {
    expect(pm.isActive).toBe(false);
  });

  it('start sets isActive to true', () => {
    const renderer = createMockRenderer();
    const map = createMockMap();

    pm.start(renderer, map, { startCol: 3, startRow: 3, collisionLayerName: 'Ground' });
    expect(pm.isActive).toBe(true);
  });

  it('stop sets isActive to false and restores camera', () => {
    const renderer = createMockRenderer();
    const map = createMockMap();

    pm.start(renderer, map, { startCol: 3, startRow: 3, collisionLayerName: 'Ground' });
    pm.stop(renderer);

    expect(pm.isActive).toBe(false);
    expect(renderer.camera.panTo).toHaveBeenCalled();
    expect(renderer.camera.setZoom).toHaveBeenCalledWith(1);
  });

  it('start hides grid', () => {
    const renderer = createMockRenderer();
    const map = createMockMap();

    pm.start(renderer, map, { startCol: 3, startRow: 3, collisionLayerName: 'Ground' });
    expect(renderer.setGridVisible).toHaveBeenCalledWith(false);
  });

  it('stop restores grid', () => {
    const renderer = createMockRenderer();
    const map = createMockMap();

    pm.start(renderer, map, { startCol: 3, startRow: 3, collisionLayerName: 'Ground' });
    pm.stop(renderer);
    expect(renderer.setGridVisible).toHaveBeenCalledWith(true);
  });
});
