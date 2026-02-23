import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GameLoop } from '../src/engine/game-loop';

// Stub browser globals
beforeEach(() => {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    return setTimeout(() => cb(performance.now()), 0) as unknown as number;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GameLoop', () => {
  it('initializes with default timestep', () => {
    const loop = new GameLoop();
    expect(loop.fixedDt).toBeCloseTo(1 / 60);
    expect(loop.maxFrameTime).toBe(0.25);
    expect(loop.isRunning).toBe(false);
  });

  it('accepts custom options', () => {
    const loop = new GameLoop({ fixedDt: 1 / 30, maxFrameTime: 0.5 });
    expect(loop.fixedDt).toBeCloseTo(1 / 30);
    expect(loop.maxFrameTime).toBe(0.5);
  });

  it('tracks running state', () => {
    const loop = new GameLoop();
    expect(loop.isRunning).toBe(false);
    loop.start();
    expect(loop.isRunning).toBe(true);
    loop.stop();
    expect(loop.isRunning).toBe(false);
  });

  it('does not start twice', () => {
    const loop = new GameLoop();
    loop.start();
    loop.start(); // should not throw
    expect(loop.isRunning).toBe(true);
    loop.stop();
  });
});
