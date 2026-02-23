import { describe, it, expect } from 'vitest';
import { parseTexturePackerJson } from '../src/atlas/texturepacker-parser';

describe('parseTexturePackerJson', () => {
  it('parses hash format', () => {
    const json = {
      frames: {
        'tree.png': {
          frame: { x: 0, y: 0, w: 64, h: 128 },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: 64, h: 128 },
          sourceSize: { w: 64, h: 128 },
          pivot: { x: 0.5, y: 1.0 },
        },
        'rock.png': {
          frame: { x: 64, y: 0, w: 32, h: 32 },
          rotated: true,
          trimmed: true,
          spriteSourceSize: { x: 2, y: 2, w: 28, h: 28 },
          sourceSize: { w: 32, h: 32 },
          pivot: { x: 0.5, y: 0.5 },
        },
      },
      meta: {
        image: 'atlas.png',
        size: { w: 256, h: 256 },
        scale: '1',
      },
    };

    const result = parseTexturePackerJson(json);
    expect(result.frames.length).toBe(2);
    expect(result.frames[0].filename).toBe('tree.png');
    expect(result.frames[0].pivot).toEqual({ x: 0.5, y: 1.0 });
    expect(result.frames[1].rotated).toBe(true);
    expect(result.image).toBe('atlas.png');
    expect(result.scale).toBe(1);
  });

  it('parses array format', () => {
    const json = {
      frames: [
        {
          filename: 'item.png',
          frame: { x: 0, y: 0, w: 16, h: 16 },
          rotated: false,
          trimmed: false,
          spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
          sourceSize: { w: 16, h: 16 },
        },
      ],
      meta: { image: 'items.png', size: { w: 16, h: 16 }, scale: '2' },
    };

    const result = parseTexturePackerJson(json);
    expect(result.frames.length).toBe(1);
    expect(result.frames[0].filename).toBe('item.png');
    expect(result.scale).toBe(2);
  });

  it('defaults pivot to center', () => {
    const json = {
      frames: {
        'x.png': {
          frame: { x: 0, y: 0, w: 8, h: 8 },
        },
      },
      meta: { image: 'x.png', size: { w: 8, h: 8 } },
    };
    const result = parseTexturePackerJson(json);
    expect(result.frames[0].pivot).toEqual({ x: 0.5, y: 0.5 });
  });
});
