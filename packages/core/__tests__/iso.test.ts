import { describe, it, expect } from 'vitest';
import { gridToScreen, screenToGrid, snapToGrid } from '../src/math/iso';

const TW = 64;
const TH = 32;

describe('gridToScreen', () => {
  it('converts origin (0,0) to screen (0,0)', () => {
    const { sx, sy } = gridToScreen(0, 0, TW, TH);
    expect(sx).toBe(0);
    expect(sy).toBe(0);
  });

  it('converts (1,0) correctly', () => {
    const { sx, sy } = gridToScreen(1, 0, TW, TH);
    expect(sx).toBe(32); // (1-0) * 32
    expect(sy).toBe(16); // (1+0) * 16
  });

  it('converts (0,1) correctly', () => {
    const { sx, sy } = gridToScreen(0, 1, TW, TH);
    expect(sx).toBe(-32); // (0-1) * 32
    expect(sy).toBe(16);  // (0+1) * 16
  });

  it('converts (1,1) correctly', () => {
    const { sx, sy } = gridToScreen(1, 1, TW, TH);
    expect(sx).toBe(0);  // (1-1) * 32
    expect(sy).toBe(32); // (1+1) * 16
  });

  it('handles arbitrary tile sizes', () => {
    const { sx, sy } = gridToScreen(2, 3, 128, 64);
    expect(sx).toBe((2 - 3) * 64);
    expect(sy).toBe((2 + 3) * 32);
  });
});

describe('screenToGrid', () => {
  it('inverts gridToScreen at origin', () => {
    const { col, row } = screenToGrid(0, 0, TW, TH);
    expect(col).toBeCloseTo(0);
    expect(row).toBeCloseTo(0);
  });

  it('round-trips (3, 5)', () => {
    const { sx, sy } = gridToScreen(3, 5, TW, TH);
    const { col, row } = screenToGrid(sx, sy, TW, TH);
    expect(col).toBeCloseTo(3);
    expect(row).toBeCloseTo(5);
  });

  it('round-trips negative coords', () => {
    const { sx, sy } = gridToScreen(-2, 4, TW, TH);
    const { col, row } = screenToGrid(sx, sy, TW, TH);
    expect(col).toBeCloseTo(-2);
    expect(row).toBeCloseTo(4);
  });

  it('returns fractional coords for mid-tile positions', () => {
    const { col, row } = screenToGrid(16, 8, TW, TH);
    expect(col).toBeCloseTo(0.5);
    expect(row).toBeCloseTo(0);
  });
});

describe('snapToGrid', () => {
  it('snaps exact tile center to that tile', () => {
    const { sx, sy } = gridToScreen(2, 3, TW, TH);
    const { col, row } = snapToGrid(sx, sy, TW, TH);
    expect(col).toBe(2);
    expect(row).toBe(3);
  });

  it('snaps slightly offset position to correct tile', () => {
    const { sx, sy } = gridToScreen(2, 3, TW, TH);
    const { col, row } = snapToGrid(sx + 1, sy + 1, TW, TH);
    expect(col).toBe(2);
    expect(row).toBe(3);
  });

  it('snaps origin to (0,0)', () => {
    const { col, row } = snapToGrid(0, 0, TW, TH);
    expect(col).toBe(0);
    expect(row).toBe(0);
  });

  it('snaps negative screen coords correctly', () => {
    const { col, row } = snapToGrid(-32, 16, TW, TH);
    expect(col).toBe(0);
    expect(row).toBe(1);
  });
});
