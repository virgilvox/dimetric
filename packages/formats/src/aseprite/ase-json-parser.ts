/** A single frame from an Aseprite JSON export, with atlas coordinates and timing. */
export interface AseFrame {
  /** Frame index (0-based). */
  index: number;
  /** Filename/key from the export. */
  filename: string;
  /** Source rectangle in the atlas. */
  frame: { x: number; y: number; w: number; h: number };
  /** Whether the frame is rotated 90° CW in the atlas. */
  rotated: boolean;
  /** Whether the frame is trimmed. */
  trimmed: boolean;
  /** Trimmed sprite region relative to source. */
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  /** Original sprite dimensions. */
  sourceSize: { w: number; h: number };
  /** Duration of this frame in milliseconds. */
  duration: number;
}

/** An animation tag defining a named range of frames with a playback direction. */
export interface AseFrameTag {
  name: string;
  from: number;
  to: number;
  direction: 'forward' | 'reverse' | 'pingpong' | 'pingpong_reverse';
}

/** A slice key defining bounds (and optional pivot) for a specific frame. */
export interface AseSliceKey {
  frame: number;
  bounds: { x: number; y: number; w: number; h: number };
  pivot?: { x: number; y: number };
}

/** A named slice region (hitbox, anchor, etc.) with per-frame key data. */
export interface AseSlice {
  name: string;
  color: string;
  keys: AseSliceKey[];
}

/** Complete parsed result of an Aseprite JSON export, including frames, tags, and slices. */
export interface AseJsonResult {
  /** Image filename from meta. */
  image: string;
  /** Atlas dimensions. */
  size: { w: number; h: number };
  /** All frames in order. */
  frames: AseFrame[];
  /** Animation tags (named frame ranges). */
  frameTags: AseFrameTag[];
  /** Slices (hitboxes, anchors). */
  slices: AseSlice[];
}

/**
 * Parse an Aseprite JSON export into a structured result.
 *
 * Supports both array (`--list`) and hash (object-keyed) frame formats.
 *
 * @param json - The parsed JSON object from an Aseprite export.
 * @returns A structured result with frames, animation tags, and slices.
 */
export function parseAseJson(json: any): AseJsonResult {
  const meta = json.meta ?? {};
  const frames = parseFrames(json.frames);
  const frameTags: AseFrameTag[] = (meta.frameTags ?? []).map((ft: any) => ({
    name: ft.name,
    from: ft.from,
    to: ft.to,
    direction: ft.direction ?? 'forward',
  }));
  const slices: AseSlice[] = (meta.slices ?? []).map((s: any) => ({
    name: s.name,
    color: s.color ?? '#0000ffff',
    keys: (s.keys ?? []).map((k: any) => ({
      frame: k.frame,
      bounds: k.bounds,
      ...(k.pivot ? { pivot: k.pivot } : {}),
    })),
  }));

  return {
    image: meta.image ?? '',
    size: meta.size ?? { w: 0, h: 0 },
    frames,
    frameTags,
    slices,
  };
}

function parseFrames(framesData: any): AseFrame[] {
  if (Array.isArray(framesData)) {
    // Array format (--list)
    return framesData.map((f: any, i: number) => ({
      index: i,
      filename: f.filename ?? '',
      frame: f.frame,
      rotated: f.rotated ?? false,
      trimmed: f.trimmed ?? false,
      spriteSourceSize: f.spriteSourceSize ?? { x: 0, y: 0, w: f.frame.w, h: f.frame.h },
      sourceSize: f.sourceSize ?? { w: f.frame.w, h: f.frame.h },
      duration: f.duration ?? 100,
    }));
  }

  // Hash format (object keyed by filename)
  const entries = Object.entries(framesData);
  return entries.map(([filename, f]: [string, any], i: number) => ({
    index: i,
    filename,
    frame: f.frame,
    rotated: f.rotated ?? false,
    trimmed: f.trimmed ?? false,
    spriteSourceSize: f.spriteSourceSize ?? { x: 0, y: 0, w: f.frame.w, h: f.frame.h },
    sourceSize: f.sourceSize ?? { w: f.frame.w, h: f.frame.h },
    duration: f.duration ?? 100,
  }));
}
