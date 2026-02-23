/**
 * Tiled uses the top 3 bits of the 32-bit GID for tile flip flags.
 * Bit 31: horizontal flip
 * Bit 30: vertical flip
 * Bit 29: diagonal flip (anti-diagonal)
 */

const FLIPPED_HORIZONTALLY = 0x80000000;
const FLIPPED_VERTICALLY = 0x40000000;
const FLIPPED_DIAGONALLY = 0x20000000;
const GID_MASK = 0x1FFFFFFF;

export interface FlipFlags {
  horizontal: boolean;
  vertical: boolean;
  diagonal: boolean;
}

/** Extract the actual tile GID (strip flip flags). */
export function extractGid(raw: number): number {
  return (raw & GID_MASK) >>> 0;
}

/** Extract the flip flags from a raw GID value. */
export function extractFlipFlags(raw: number): FlipFlags {
  return {
    horizontal: (raw & FLIPPED_HORIZONTALLY) !== 0,
    vertical: (raw & FLIPPED_VERTICALLY) !== 0,
    diagonal: (raw & FLIPPED_DIAGONALLY) !== 0,
  };
}

/** Compose a GID with flip flags into a single 32-bit value. */
export function composeGid(gid: number, flags?: Partial<FlipFlags>): number {
  let result = gid & GID_MASK;
  if (flags?.horizontal) result |= FLIPPED_HORIZONTALLY;
  if (flags?.vertical) result |= FLIPPED_VERTICALLY;
  if (flags?.diagonal) result |= FLIPPED_DIAGONALLY;
  return result >>> 0;
}

/** Bit mask constants for external use. */
export const FLIP_FLAGS = {
  HORIZONTAL: FLIPPED_HORIZONTALLY,
  VERTICAL: FLIPPED_VERTICALLY,
  DIAGONAL: FLIPPED_DIAGONALLY,
  GID_MASK,
} as const;
