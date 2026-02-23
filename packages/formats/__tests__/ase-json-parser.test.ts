import { describe, it, expect } from 'vitest';
import { parseAseJson } from '../src/aseprite/ase-json-parser';

describe('parseAseJson', () => {
  it('parses hash format frames', () => {
    const json = {
      frames: {
        'sprite 0.ase': {
          frame: { x: 0, y: 0, w: 32, h: 32 },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 },
          sourceSize: { w: 32, h: 32 },
          duration: 100,
        },
        'sprite 1.ase': {
          frame: { x: 32, y: 0, w: 32, h: 32 },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 },
          sourceSize: { w: 32, h: 32 },
          duration: 150,
        },
      },
      meta: {
        image: 'sprite.png',
        size: { w: 64, h: 32 },
        frameTags: [{ name: 'idle', from: 0, to: 1, direction: 'forward' }],
        slices: [],
      },
    };

    const result = parseAseJson(json);
    expect(result.frames.length).toBe(2);
    expect(result.frames[0].duration).toBe(100);
    expect(result.frames[1].frame.x).toBe(32);
    expect(result.frameTags.length).toBe(1);
    expect(result.frameTags[0].name).toBe('idle');
    expect(result.image).toBe('sprite.png');
  });

  it('parses array format frames', () => {
    const json = {
      frames: [
        { filename: 'frame0', frame: { x: 0, y: 0, w: 16, h: 16 }, duration: 200 },
      ],
      meta: { image: 'test.png', size: { w: 16, h: 16 } },
    };
    const result = parseAseJson(json);
    expect(result.frames.length).toBe(1);
    expect(result.frames[0].filename).toBe('frame0');
  });

  it('parses slices', () => {
    const json = {
      frames: {},
      meta: {
        image: 'test.png',
        size: { w: 32, h: 32 },
        slices: [
          {
            name: 'hitbox',
            color: '#ff0000ff',
            keys: [{ frame: 0, bounds: { x: 4, y: 4, w: 24, h: 24 } }],
          },
        ],
      },
    };
    const result = parseAseJson(json);
    expect(result.slices.length).toBe(1);
    expect(result.slices[0].name).toBe('hitbox');
    expect(result.slices[0].keys[0].bounds.w).toBe(24);
  });
});
