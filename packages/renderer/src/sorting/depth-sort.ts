import type { Container } from 'pixi.js';

/**
 * Compute a depth sort key for an isometric grid position.
 * Higher keys render in front of lower ones.
 *
 * @param col - Grid column index.
 * @param row - Grid row index.
 * @param z - Optional elevation offset. Defaults to `0`.
 * @returns A numeric sort key suitable for ordering isometric draw calls.
 *
 * @example
 * ```ts
 * sprite._depthKey = depthSortKey(3, 5);
 * ```
 */
export function depthSortKey(col: number, row: number, z: number = 0): number {
  return col + row + z;
}

/**
 * Sort children of a PixiJS container by their `_depthKey` custom property.
 * Each child must have a `_depthKey` number assigned before calling this function.
 * Children are reordered in-place using `setChildIndex`.
 *
 * @param container - The PixiJS container whose children should be sorted.
 *
 * @example
 * ```ts
 * for (const child of container.children) {
 *   (child as any)._depthKey = depthSortKey(col, row);
 * }
 * depthSortContainer(container);
 * ```
 */
export function depthSortContainer(container: Container): void {
  const children = container.children as (Container & { _depthKey?: number })[];
  children.sort((a, b) => (a._depthKey ?? 0) - (b._depthKey ?? 0));
  // PixiJS v8 requires calling sortChildren or setting sortableChildren
  // We manually reorder by removing and re-adding
  for (let i = 0; i < children.length; i++) {
    container.setChildIndex(children[i], i);
  }
}
