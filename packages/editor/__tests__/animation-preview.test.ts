import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock vue's onUnmounted for composable testing
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue');
  return { ...actual as any, onUnmounted: vi.fn() };
});

import { useAnimationPreview } from '../src/composables/use-animation-preview';

describe('useAnimationPreview', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts at frame 0', () => {
    const preview = useAnimationPreview();
    expect(preview.currentFrameIndex.value).toBe(0);
    expect(preview.isPlaying.value).toBe(false);
  });

  it('advances frames on timer', () => {
    const preview = useAnimationPreview();
    const frames = [
      { tileId: 0, duration: 100 },
      { tileId: 1, duration: 200 },
      { tileId: 2, duration: 100 },
    ];

    preview.start(frames);
    expect(preview.isPlaying.value).toBe(true);
    expect(preview.currentFrameIndex.value).toBe(0);

    vi.advanceTimersByTime(100);
    expect(preview.currentFrameIndex.value).toBe(1);

    vi.advanceTimersByTime(200);
    expect(preview.currentFrameIndex.value).toBe(2);

    // Wraps around
    vi.advanceTimersByTime(100);
    expect(preview.currentFrameIndex.value).toBe(0);
  });

  it('stop resets state', () => {
    const preview = useAnimationPreview();
    const frames = [
      { tileId: 0, duration: 100 },
      { tileId: 1, duration: 100 },
    ];

    preview.start(frames);
    vi.advanceTimersByTime(100);
    expect(preview.currentFrameIndex.value).toBe(1);

    preview.stop();
    expect(preview.isPlaying.value).toBe(false);
    expect(preview.currentFrameIndex.value).toBe(0);
  });

  it('toggle starts and stops', () => {
    const preview = useAnimationPreview();
    const frames = [
      { tileId: 0, duration: 100 },
      { tileId: 1, duration: 100 },
    ];

    preview.toggle(frames);
    expect(preview.isPlaying.value).toBe(true);

    preview.toggle(frames);
    expect(preview.isPlaying.value).toBe(false);
  });

  it('does not start with empty frames', () => {
    const preview = useAnimationPreview();
    preview.start([]);
    expect(preview.isPlaying.value).toBe(false);
  });
});
