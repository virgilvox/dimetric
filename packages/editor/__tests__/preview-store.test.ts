import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePreviewStore } from '../src/stores/preview';

describe('PreviewStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('starts inactive', () => {
    const store = usePreviewStore();
    expect(store.isPreviewActive).toBe(false);
  });

  it('activate/deactivate toggles state', () => {
    const store = usePreviewStore();
    store.activate();
    expect(store.isPreviewActive).toBe(true);
    store.deactivate();
    expect(store.isPreviewActive).toBe(false);
  });

  it('has default start position', () => {
    const store = usePreviewStore();
    expect(store.startCol).toBe(3);
    expect(store.startRow).toBe(3);
  });

  it('has default collision layer name', () => {
    const store = usePreviewStore();
    expect(store.collisionLayerName).toBe('Walls');
  });
});
