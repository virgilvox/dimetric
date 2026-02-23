/**
 * Keyboard input manager that tracks per-frame key state.
 *
 * Maintains three sets -- currently held, just-pressed this frame, and
 * just-released this frame. Call {@link flush} at the end of each fixed-update
 * tick to clear the transient just-pressed / just-released sets.
 *
 * @example
 * ```ts
 * const input = new InputManager();
 * input.attach();
 *
 * // Inside a system update:
 * if (input.justPressed('Space')) jump();
 * if (input.isDown('ArrowRight')) moveRight(dt);
 *
 * input.flush(); // call at end of tick
 * ```
 */
export class InputManager {
  private keysDown = new Set<string>();
  private keysJustPressed = new Set<string>();
  private keysJustReleased = new Set<string>();
  private onKeyDownBound: (e: KeyboardEvent) => void;
  private onKeyUpBound: (e: KeyboardEvent) => void;

  constructor() {
    this.onKeyDownBound = (e) => this.handleKeyDown(e);
    this.onKeyUpBound = (e) => this.handleKeyUp(e);
  }

  /**
   * Start listening for `keydown` and `keyup` events on `window`.
   */
  attach(): void {
    window.addEventListener('keydown', this.onKeyDownBound);
    window.addEventListener('keyup', this.onKeyUpBound);
  }

  /**
   * Stop listening for keyboard events and clear all internal state.
   */
  detach(): void {
    window.removeEventListener('keydown', this.onKeyDownBound);
    window.removeEventListener('keyup', this.onKeyUpBound);
    this.keysDown.clear();
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
  }

  /**
   * Check whether a key is currently held down.
   *
   * @param key - The `KeyboardEvent.key` value (e.g. `'ArrowUp'`, `'a'`).
   * @returns `true` if the key is pressed.
   */
  isDown(key: string): boolean {
    return this.keysDown.has(key);
  }

  /**
   * Check whether a key was pressed during the current frame (before
   * {@link flush} is called).
   *
   * @param key - The `KeyboardEvent.key` value.
   * @returns `true` if the key transitioned from up to down this frame.
   */
  justPressed(key: string): boolean {
    return this.keysJustPressed.has(key);
  }

  /**
   * Check whether a key was released during the current frame (before
   * {@link flush} is called).
   *
   * @param key - The `KeyboardEvent.key` value.
   * @returns `true` if the key transitioned from down to up this frame.
   */
  justReleased(key: string): boolean {
    return this.keysJustReleased.has(key);
  }

  /**
   * Clear per-frame transient state. Must be called at the end of each
   * fixed-update tick so that `justPressed` and `justReleased` only report
   * events for a single frame.
   */
  flush(): void {
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.keysDown.has(e.key)) {
      this.keysJustPressed.add(e.key);
    }
    this.keysDown.add(e.key);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keysDown.delete(e.key);
    this.keysJustReleased.add(e.key);
  }
}
