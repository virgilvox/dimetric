import { describe, it, expect } from 'vitest';
import { AnimationTicker } from '../src/sprites/animation-ticker';

// Minimal mock sprite
function mockSprite() {
  return { texture: null as any } as any;
}

function mockTexture(id: number) {
  return { _id: id } as any;
}

describe('AnimationTicker', () => {
  it('advances frames based on elapsed time', () => {
    const ticker = new AnimationTicker();
    const sprite = mockSprite();
    const tex0 = mockTexture(0);
    const tex1 = mockTexture(1);

    sprite.texture = tex0;
    ticker.add(sprite, [
      { texture: tex0, duration: 100 },
      { texture: tex1, duration: 100 },
    ]);

    // Not enough time to advance
    ticker.tick(50);
    expect(sprite.texture).toBe(tex0);

    // Enough to advance to frame 1
    ticker.tick(60);
    expect(sprite.texture).toBe(tex1);

    // Advance past frame 1, wrap to frame 0
    ticker.tick(100);
    expect(sprite.texture).toBe(tex0);
  });

  it('does not add single-frame entries', () => {
    const ticker = new AnimationTicker();
    const sprite = mockSprite();
    ticker.add(sprite, [{ texture: mockTexture(0), duration: 100 }]);
    expect(ticker.count).toBe(0);
  });

  it('clears all entries', () => {
    const ticker = new AnimationTicker();
    ticker.add(mockSprite(), [
      { texture: mockTexture(0), duration: 100 },
      { texture: mockTexture(1), duration: 100 },
    ]);
    expect(ticker.count).toBe(1);
    ticker.clear();
    expect(ticker.count).toBe(0);
  });

  it('handles varying frame durations', () => {
    const ticker = new AnimationTicker();
    const sprite = mockSprite();
    const tex0 = mockTexture(0);
    const tex1 = mockTexture(1);
    const tex2 = mockTexture(2);

    sprite.texture = tex0;
    ticker.add(sprite, [
      { texture: tex0, duration: 50 },
      { texture: tex1, duration: 200 },
      { texture: tex2, duration: 100 },
    ]);

    ticker.tick(50); // Past frame 0 (50ms)
    expect(sprite.texture).toBe(tex1);

    ticker.tick(200); // Past frame 1 (200ms)
    expect(sprite.texture).toBe(tex2);

    ticker.tick(100); // Past frame 2 (100ms), wrap to frame 0
    expect(sprite.texture).toBe(tex0);
  });
});
