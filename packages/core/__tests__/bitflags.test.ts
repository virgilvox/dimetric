import { describe, it, expect } from 'vitest';
import { extractGid, extractFlipFlags, composeGid, FLIP_FLAGS } from '../src/math/bitflags';

describe('extractGid', () => {
  it('returns the GID when no flags are set', () => {
    expect(extractGid(42)).toBe(42);
  });

  it('strips horizontal flip flag', () => {
    const raw = 42 | FLIP_FLAGS.HORIZONTAL;
    expect(extractGid(raw)).toBe(42);
  });

  it('strips all flip flags', () => {
    const raw = 100 | FLIP_FLAGS.HORIZONTAL | FLIP_FLAGS.VERTICAL | FLIP_FLAGS.DIAGONAL;
    expect(extractGid(raw)).toBe(100);
  });

  it('handles GID 0 (empty tile)', () => {
    expect(extractGid(0)).toBe(0);
  });

  it('handles max 29-bit GID', () => {
    const maxGid = FLIP_FLAGS.GID_MASK;
    expect(extractGid(maxGid)).toBe(maxGid);
  });
});

describe('extractFlipFlags', () => {
  it('returns all false for plain GID', () => {
    const flags = extractFlipFlags(42);
    expect(flags.horizontal).toBe(false);
    expect(flags.vertical).toBe(false);
    expect(flags.diagonal).toBe(false);
  });

  it('detects horizontal flip', () => {
    const flags = extractFlipFlags(42 | FLIP_FLAGS.HORIZONTAL);
    expect(flags.horizontal).toBe(true);
    expect(flags.vertical).toBe(false);
    expect(flags.diagonal).toBe(false);
  });

  it('detects all flags', () => {
    const raw = 1 | FLIP_FLAGS.HORIZONTAL | FLIP_FLAGS.VERTICAL | FLIP_FLAGS.DIAGONAL;
    const flags = extractFlipFlags(raw);
    expect(flags.horizontal).toBe(true);
    expect(flags.vertical).toBe(true);
    expect(flags.diagonal).toBe(true);
  });
});

describe('composeGid', () => {
  it('returns plain GID when no flags specified', () => {
    expect(composeGid(42)).toBe(42);
  });

  it('sets horizontal flip flag', () => {
    const composed = composeGid(42, { horizontal: true });
    expect(extractGid(composed)).toBe(42);
    expect(extractFlipFlags(composed).horizontal).toBe(true);
  });

  it('round-trips through extract', () => {
    const original = 123;
    const flags = { horizontal: true, vertical: false, diagonal: true };
    const composed = composeGid(original, flags);
    expect(extractGid(composed)).toBe(original);
    const extracted = extractFlipFlags(composed);
    expect(extracted.horizontal).toBe(true);
    expect(extracted.vertical).toBe(false);
    expect(extracted.diagonal).toBe(true);
  });

  it('masks off bits above 29', () => {
    const composed = composeGid(FLIP_FLAGS.GID_MASK + 1);
    expect(composed).toBe(0);
  });
});
