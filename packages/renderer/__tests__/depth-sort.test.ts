import { describe, it, expect } from 'vitest';
import { depthSortKey } from '../src/sorting/depth-sort';

describe('depthSortKey', () => {
  it('returns col + row for 2D positions', () => {
    expect(depthSortKey(0, 0)).toBe(0);
    expect(depthSortKey(3, 2)).toBe(5);
    expect(depthSortKey(1, 4)).toBe(5);
  });

  it('includes z in the depth key', () => {
    expect(depthSortKey(1, 1, 0)).toBe(2);
    expect(depthSortKey(1, 1, 1)).toBe(3);
  });

  it('produces correct relative ordering', () => {
    // Tile at (0,0) should be in front of (1,0) and (0,1)
    expect(depthSortKey(0, 0)).toBeLessThan(depthSortKey(1, 0));
    expect(depthSortKey(0, 0)).toBeLessThan(depthSortKey(0, 1));
    // Diagonal tiles at same depth
    expect(depthSortKey(2, 0)).toBe(depthSortKey(0, 2));
  });
});
