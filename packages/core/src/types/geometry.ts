/** A 2D point with floating-point coordinates. */
export interface Point {
  x: number;
  y: number;
}

/** Width and height dimensions. */
export interface Size {
  width: number;
  height: number;
}

/** Axis-aligned bounding rectangle. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Grid coordinate (column, row) in tile space. */
export interface GridCoord {
  col: number;
  row: number;
}

/** Screen-space pixel coordinate. */
export interface ScreenCoord {
  sx: number;
  sy: number;
}

/** World-space coordinate (pre-camera transform). */
export interface WorldCoord {
  wx: number;
  wy: number;
}
