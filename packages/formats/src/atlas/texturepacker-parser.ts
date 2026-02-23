/** A single sprite frame from a TexturePacker JSON atlas, with atlas coordinates and trim data. */
export interface TpFrame {
  /** Filename/key of the sprite. */
  filename: string;
  /** Source rectangle in the atlas. */
  frame: { x: number; y: number; w: number; h: number };
  /** Whether the frame is rotated 90° CW in the atlas. */
  rotated: boolean;
  /** Whether the frame was trimmed. */
  trimmed: boolean;
  /** Trimmed region relative to original. */
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  /** Original sprite dimensions. */
  sourceSize: { w: number; h: number };
  /** Pivot point (0-1 normalized). */
  pivot: { x: number; y: number };
}

/** Complete parsed result of a TexturePacker JSON atlas, including all frames and metadata. */
export interface TpAtlasResult {
  /** Atlas image filename. */
  image: string;
  /** Atlas dimensions. */
  size: { w: number; h: number };
  /** Scale factor. */
  scale: number;
  /** All frames. */
  frames: TpFrame[];
}

/**
 * Parse a TexturePacker JSON atlas into a structured result.
 *
 * Supports both array and hash (object-keyed) frame formats.
 *
 * @param json - The parsed JSON object from a TexturePacker export.
 * @returns A structured atlas result with frames, image path, size, and scale.
 */
export function parseTexturePackerJson(json: any): TpAtlasResult {
  const meta = json.meta ?? {};
  const frames = parseFrames(json.frames);

  return {
    image: meta.image ?? '',
    size: meta.size ?? { w: 0, h: 0 },
    scale: parseFloat(meta.scale ?? '1'),
    frames,
  };
}

function parseFrames(framesData: any): TpFrame[] {
  if (Array.isArray(framesData)) {
    return framesData.map(parseFrame);
  }

  // Hash format
  return Object.entries(framesData).map(([filename, f]: [string, any]) => ({
    ...parseFrameData(f),
    filename,
  }));
}

function parseFrame(f: any): TpFrame {
  return {
    filename: f.filename ?? '',
    ...parseFrameData(f),
  };
}

function parseFrameData(f: any): Omit<TpFrame, 'filename'> {
  return {
    frame: f.frame,
    rotated: f.rotated ?? false,
    trimmed: f.trimmed ?? false,
    spriteSourceSize: f.spriteSourceSize ?? { x: 0, y: 0, w: f.frame.w, h: f.frame.h },
    sourceSize: f.sourceSize ?? { w: f.frame.w, h: f.frame.h },
    pivot: f.pivot ?? { x: 0.5, y: 0.5 },
  };
}
