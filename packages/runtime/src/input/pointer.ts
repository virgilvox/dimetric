import { snapToGrid, type GridCoord } from '@dimetric/core';

/**
 * Pointer (mouse / touch) state tracker.
 *
 * Attaches to an HTML element and records screen-space coordinates plus
 * primary-button press state. Like {@link InputManager}, call {@link flush} at
 * the end of each fixed-update tick to reset the `justClicked` flag.
 *
 * @example
 * ```ts
 * const pointer = new Pointer();
 * pointer.attach(canvas);
 *
 * // Inside a system update:
 * if (pointer.justClicked) {
 *   const cell = pointer.toGrid(worldX, worldY, tw, th);
 * }
 * pointer.flush();
 * ```
 */
export class Pointer {
  /** Screen-space X coordinate. */
  screenX: number = 0;
  /** Screen-space Y coordinate. */
  screenY: number = 0;
  /** Whether the primary button is currently pressed. */
  isDown: boolean = false;
  /** Whether the primary button was clicked this frame (before flush). */
  justClicked: boolean = false;

  private target: HTMLElement | null = null;
  private onPointerMoveBound: (e: PointerEvent) => void;
  private onPointerDownBound: (e: PointerEvent) => void;
  private onPointerUpBound: (e: PointerEvent) => void;

  constructor() {
    this.onPointerMoveBound = (e) => this.handleMove(e);
    this.onPointerDownBound = (e) => this.handleDown(e);
    this.onPointerUpBound = (e) => this.handleUp(e);
  }

  /**
   * Begin listening for pointer events on the given element.
   *
   * @param el - The HTML element to observe (typically a `<canvas>`).
   */
  attach(el: HTMLElement): void {
    this.target = el;
    el.addEventListener('pointermove', this.onPointerMoveBound);
    el.addEventListener('pointerdown', this.onPointerDownBound);
    el.addEventListener('pointerup', this.onPointerUpBound);
  }

  /**
   * Remove event listeners and release the reference to the target element.
   */
  detach(): void {
    if (this.target) {
      this.target.removeEventListener('pointermove', this.onPointerMoveBound);
      this.target.removeEventListener('pointerdown', this.onPointerDownBound);
      this.target.removeEventListener('pointerup', this.onPointerUpBound);
      this.target = null;
    }
  }

  /**
   * Convert a world-space position to the nearest grid coordinate using the
   * isometric snap-to-grid algorithm.
   *
   * @param worldX - World-space X (typically derived via a camera transform).
   * @param worldY - World-space Y.
   * @param tileWidth - Map tile width in pixels.
   * @param tileHeight - Map tile height in pixels.
   * @returns The snapped {@link GridCoord}.
   */
  toGrid(
    worldX: number,
    worldY: number,
    tileWidth: number,
    tileHeight: number,
  ): GridCoord {
    return snapToGrid(worldX, worldY, tileWidth, tileHeight);
  }

  /**
   * Clear per-frame transient state. Must be called at the end of each
   * fixed-update tick so that `justClicked` only reports for a single frame.
   */
  flush(): void {
    this.justClicked = false;
  }

  private handleMove(e: PointerEvent): void {
    this.screenX = e.clientX;
    this.screenY = e.clientY;
  }

  private handleDown(e: PointerEvent): void {
    if (e.button === 0) {
      this.isDown = true;
      this.justClicked = true;
    }
  }

  private handleUp(e: PointerEvent): void {
    if (e.button === 0) {
      this.isDown = false;
    }
  }
}
