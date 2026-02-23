import { ref, onUnmounted, type Ref } from 'vue';
import type { DmTileAnimationFrame } from '@dimetric/core';

export interface AnimationPreviewState {
  currentFrameIndex: Ref<number>;
  isPlaying: Ref<boolean>;
  start: (frames: DmTileAnimationFrame[]) => void;
  stop: () => void;
  toggle: (frames: DmTileAnimationFrame[]) => void;
}

export function useAnimationPreview(): AnimationPreviewState {
  const currentFrameIndex = ref(0);
  const isPlaying = ref(false);

  let timer: ReturnType<typeof setTimeout> | null = null;
  let activeFrames: DmTileAnimationFrame[] = [];

  function scheduleNext() {
    if (!isPlaying.value || activeFrames.length === 0) return;

    const frame = activeFrames[currentFrameIndex.value];
    timer = setTimeout(() => {
      currentFrameIndex.value = (currentFrameIndex.value + 1) % activeFrames.length;
      scheduleNext();
    }, frame.duration);
  }

  function start(frames: DmTileAnimationFrame[]) {
    stop();
    if (frames.length === 0) return;
    activeFrames = frames;
    currentFrameIndex.value = 0;
    isPlaying.value = true;
    scheduleNext();
  }

  function stop() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    isPlaying.value = false;
    currentFrameIndex.value = 0;
    activeFrames = [];
  }

  function toggle(frames: DmTileAnimationFrame[]) {
    if (isPlaying.value) {
      stop();
    } else {
      start(frames);
    }
  }

  onUnmounted(stop);

  return {
    currentFrameIndex,
    isPlaying,
    start,
    stop,
    toggle,
  };
}
