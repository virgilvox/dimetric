import { describe, it, expect } from 'vitest';
import { intersects, contains, containsPoint, expandToContain } from '../src/math/rect';

describe('intersects', () => {
  it('returns true for overlapping rectangles', () => {
    expect(intersects(
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 5, y: 5, width: 10, height: 10 },
    )).toBe(true);
  });

  it('returns false for non-overlapping rectangles', () => {
    expect(intersects(
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 20, y: 20, width: 10, height: 10 },
    )).toBe(false);
  });

  it('returns false for edge-touching rectangles', () => {
    expect(intersects(
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 10, y: 0, width: 10, height: 10 },
    )).toBe(false);
  });

  it('handles nested rectangles', () => {
    expect(intersects(
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 10, y: 10, width: 5, height: 5 },
    )).toBe(true);
  });
});

describe('contains', () => {
  it('returns true when outer contains inner', () => {
    expect(contains(
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 10, y: 10, width: 20, height: 20 },
    )).toBe(true);
  });

  it('returns false when inner extends outside', () => {
    expect(contains(
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 5, y: 5, width: 10, height: 10 },
    )).toBe(false);
  });

  it('returns true for identical rectangles', () => {
    const r = { x: 5, y: 5, width: 10, height: 10 };
    expect(contains(r, r)).toBe(true);
  });
});

describe('containsPoint', () => {
  const rect = { x: 10, y: 10, width: 20, height: 20 };

  it('returns true for point inside', () => {
    expect(containsPoint(rect, 15, 15)).toBe(true);
  });

  it('returns true for point on lower-left edge (inclusive)', () => {
    expect(containsPoint(rect, 10, 10)).toBe(true);
  });

  it('returns false for point on upper-right edge (exclusive)', () => {
    expect(containsPoint(rect, 30, 30)).toBe(false);
  });

  it('returns false for point just past right edge', () => {
    expect(containsPoint(rect, 30, 15)).toBe(false);
  });

  it('returns true for point just before right edge', () => {
    expect(containsPoint(rect, 29, 15)).toBe(true);
  });

  it('returns false for point outside', () => {
    expect(containsPoint(rect, 5, 5)).toBe(false);
  });
});

describe('expandToContain', () => {
  it('returns union of two rectangles', () => {
    const result = expandToContain(
      { x: 0, y: 0, width: 10, height: 10 },
      { x: 5, y: 5, width: 10, height: 10 },
    );
    expect(result).toEqual({ x: 0, y: 0, width: 15, height: 15 });
  });

  it('returns outer when it already contains inner', () => {
    const outer = { x: 0, y: 0, width: 100, height: 100 };
    const inner = { x: 10, y: 10, width: 5, height: 5 };
    expect(expandToContain(outer, inner)).toEqual(outer);
  });

  it('handles negative coordinates', () => {
    const result = expandToContain(
      { x: -10, y: -10, width: 5, height: 5 },
      { x: 5, y: 5, width: 10, height: 10 },
    );
    expect(result).toEqual({ x: -10, y: -10, width: 25, height: 25 });
  });
});
