import pako from 'pako';

/**
 * Decode Tiled tile layer data from its encoded form to a Uint32Array.
 *
 * Supports CSV and base64 encodings, with optional zlib/gzip compression
 * for base64-encoded data.
 *
 * @param data - The raw data string (CSV text or base64-encoded binary).
 * @param encoding - The encoding format: `'csv'` or `'base64'`. Defaults to CSV if undefined.
 * @param compression - Compression algorithm: `'zlib'`, `'gzip'`, or undefined. Only applies to base64.
 * @param expectedLength - Expected number of tiles (width * height) for validation.
 * @returns A Uint32Array of tile GIDs (including flip flags in upper bits).
 * @throws If the encoding is unsupported or the decoded length does not match.
 */
export function decodeTileData(
  data: string,
  encoding?: string,
  compression?: string,
  expectedLength?: number,
): Uint32Array {
  if (!encoding || encoding === 'csv') {
    return decodeCsv(data, expectedLength);
  }
  if (encoding === 'base64') {
    return decodeBase64(data, compression, expectedLength);
  }
  throw new Error(`Unsupported tile data encoding: ${encoding}`);
}

/**
 * Encode a Uint32Array of tile GIDs back to a tile data string.
 *
 * Produces CSV or base64 output, with optional zlib/gzip compression
 * for the base64 encoding.
 *
 * @param data - The tile data array to encode.
 * @param encoding - The encoding format: `'csv'` or `'base64'`. Defaults to CSV if undefined.
 * @param compression - Compression algorithm: `'zlib'`, `'gzip'`, or undefined. Only applies to base64.
 * @returns The encoded tile data string.
 * @throws If the encoding or compression is unsupported.
 */
export function encodeTileData(
  data: Uint32Array,
  encoding?: string,
  compression?: string,
): string {
  if (!encoding || encoding === 'csv') {
    return encodeCsv(data);
  }
  if (encoding === 'base64') {
    return encodeBase64(data, compression);
  }
  throw new Error(`Unsupported tile data encoding: ${encoding}`);
}

function decodeCsv(data: string, expectedLength?: number): Uint32Array {
  const values = data
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((s) => parseInt(s, 10) >>> 0);
  if (expectedLength !== undefined && values.length !== expectedLength) {
    throw new Error(`CSV tile data length mismatch: expected ${expectedLength}, got ${values.length}`);
  }
  return new Uint32Array(values);
}

function encodeCsv(data: Uint32Array): string {
  return Array.from(data).join(',');
}

function decodeBase64(data: string, compression?: string, expectedLength?: number): Uint32Array {
  const raw = base64ToBytes(data.trim());
  let bytes: Uint8Array;

  if (!compression) {
    bytes = raw;
  } else if (compression === 'zlib') {
    bytes = pako.inflate(raw);
  } else if (compression === 'gzip') {
    bytes = pako.ungzip(raw);
  } else {
    throw new Error(`Unsupported compression: ${compression}`);
  }

  // Convert bytes to Uint32Array (little-endian)
  if (bytes.length % 4 !== 0) {
    throw new Error(`Invalid tile data byte length: ${bytes.length} (must be multiple of 4)`);
  }
  const result = new Uint32Array(bytes.length / 4);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < result.length; i++) {
    result[i] = view.getUint32(i * 4, true); // little-endian
  }

  if (expectedLength !== undefined && result.length !== expectedLength) {
    throw new Error(`Tile data length mismatch: expected ${expectedLength}, got ${result.length}`);
  }
  return result;
}

function encodeBase64(data: Uint32Array, compression?: string): string {
  // Convert to bytes (little-endian)
  const bytes = new Uint8Array(data.length * 4);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < data.length; i++) {
    view.setUint32(i * 4, data[i], true);
  }

  let output: Uint8Array;
  if (!compression) {
    output = bytes;
  } else if (compression === 'zlib') {
    output = pako.deflate(bytes);
  } else if (compression === 'gzip') {
    output = pako.gzip(bytes);
  } else {
    throw new Error(`Unsupported compression: ${compression}`);
  }

  return bytesToBase64(output);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
