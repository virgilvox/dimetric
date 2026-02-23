import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { InputManager } from '../src/input/input-manager';

// Minimal window stub for Node environment
beforeEach(() => {
  const listeners: Record<string, ((e: any) => void)[]> = {};
  vi.stubGlobal('window', {
    addEventListener(type: string, fn: (e: any) => void) {
      (listeners[type] ??= []).push(fn);
    },
    removeEventListener(type: string, fn: (e: any) => void) {
      const arr = listeners[type];
      if (arr) {
        const idx = arr.indexOf(fn);
        if (idx >= 0) arr.splice(idx, 1);
      }
    },
    dispatchEvent(e: any) {
      const arr = listeners[e.type];
      if (arr) arr.forEach((fn) => fn(e));
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// Minimal KeyboardEvent polyfill for Node
class FakeKeyboardEvent {
  type: string;
  key: string;
  constructor(type: string, opts: { key: string }) {
    this.type = type;
    this.key = opts.key;
  }
}

describe('InputManager', () => {
  let input: InputManager;

  beforeEach(() => {
    input = new InputManager();
    input.attach();
  });

  function pressKey(key: string) {
    window.dispatchEvent(new FakeKeyboardEvent('keydown', { key }) as any);
  }

  function releaseKey(key: string) {
    window.dispatchEvent(new FakeKeyboardEvent('keyup', { key }) as any);
  }

  it('tracks key down state', () => {
    pressKey('a');
    expect(input.isDown('a')).toBe(true);
    releaseKey('a');
    expect(input.isDown('a')).toBe(false);
  });

  it('tracks justPressed', () => {
    pressKey('b');
    expect(input.justPressed('b')).toBe(true);
    input.flush();
    expect(input.justPressed('b')).toBe(false);
    expect(input.isDown('b')).toBe(true);
  });

  it('tracks justReleased', () => {
    pressKey('c');
    input.flush();
    releaseKey('c');
    expect(input.justReleased('c')).toBe(true);
    input.flush();
    expect(input.justReleased('c')).toBe(false);
  });

  it('does not re-trigger justPressed on held key', () => {
    pressKey('d');
    input.flush();
    pressKey('d'); // repeat keydown
    expect(input.justPressed('d')).toBe(false);
  });

  it('cleans up on detach', () => {
    input.detach();
    pressKey('x');
    expect(input.isDown('x')).toBe(false);
  });
});
