import mitt from 'mitt';
import type { GridCoord } from '@dimetric/core';

export type EditorEvents = {
  /** Pointer moved to a new grid cell. */
  'canvas:hover': GridCoord;
  /** Pointer pressed on a grid cell. */
  'canvas:pointerdown': GridCoord & { button: number };
  /** Pointer released. */
  'canvas:pointerup': GridCoord & { button: number };
  /** Pointer dragged to a new cell while button held. */
  'canvas:pointerdrag': GridCoord;
  /** Pointer left the canvas. */
  'canvas:pointerleave': void;
  /** Map was changed (any tile/layer mutation). */
  'map:changed': void;
  /** Start preview mode. */
  'preview:start': void;
  /** Stop preview mode. */
  'preview:stop': void;
  /** Files dropped or selected for import. */
  'import:request': File[];
};

export const editorBus = mitt<EditorEvents>();
