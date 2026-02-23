import { describe, it, expect } from 'vitest';
import { decodeTileData, encodeTileData } from '../src/tmx/compression';

describe('CSV encoding', () => {
  it('decodes CSV tile data', () => {
    const result = decodeTileData('1,2,3,0,5,6', 'csv');
    expect(Array.from(result)).toEqual([1, 2, 3, 0, 5, 6]);
  });

  it('encodes tile data to CSV', () => {
    const data = new Uint32Array([1, 2, 3, 0]);
    expect(encodeTileData(data, 'csv')).toBe('1,2,3,0');
  });

  it('handles whitespace in CSV', () => {
    const result = decodeTileData(' 1 , 2 , 3 ', 'csv');
    expect(Array.from(result)).toEqual([1, 2, 3]);
  });
});

describe('base64 encoding', () => {
  it('round-trips through raw base64', () => {
    const original = new Uint32Array([1, 0, 42, 0x80000001]);
    const encoded = encodeTileData(original, 'base64');
    const decoded = decodeTileData(encoded, 'base64');
    expect(Array.from(decoded)).toEqual(Array.from(original));
  });

  it('round-trips through base64+zlib', () => {
    const original = new Uint32Array([10, 20, 30, 40, 50, 60]);
    const encoded = encodeTileData(original, 'base64', 'zlib');
    const decoded = decodeTileData(encoded, 'base64', 'zlib');
    expect(Array.from(decoded)).toEqual(Array.from(original));
  });

  it('round-trips through base64+gzip', () => {
    const original = new Uint32Array([100, 200, 300]);
    const encoded = encodeTileData(original, 'base64', 'gzip');
    const decoded = decodeTileData(encoded, 'base64', 'gzip');
    expect(Array.from(decoded)).toEqual(Array.from(original));
  });
});

describe('error handling', () => {
  it('throws on unsupported encoding', () => {
    expect(() => decodeTileData('data', 'xml' as any)).toThrow('Unsupported');
  });

  it('throws on unsupported compression', () => {
    expect(() => decodeTileData(btoa('data'), 'base64', 'zstd')).toThrow('Unsupported');
  });
});
