/**
 * Fixed-timestep game loop driven by `requestAnimationFrame`.
 *
 * Calls a fixed-update callback at a deterministic rate (default 60 Hz) and a
 * render callback every frame with an interpolation alpha. Includes
 * spiral-of-death protection via a configurable max frame time cap.
 *
 * @example
 * ```ts
 * const loop = new GameLoop({ fixedDt: 1 / 60 });
 * loop.setFixedUpdate((dt) => simulate(dt));
 * loop.setRender((alpha) => draw(alpha));
 * loop.start();
 * ```
 */
export class GameLoop {
  /** Fixed timestep in seconds (default 1/60). */
  readonly fixedDt: number;
  /** Max frame time in seconds to prevent spiral of death (default 0.25s). */
  readonly maxFrameTime: number;

  private rafId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private running: boolean = false;

  private onFixedUpdate: ((dt: number) => void) | null = null;
  private onRender: ((alpha: number) => void) | null = null;

  /**
   * Create a new game loop.
   *
   * @param options - Optional configuration.
   * @param options.fixedDt - Fixed timestep in seconds. Defaults to `1/60`.
   * @param options.maxFrameTime - Maximum frame duration in seconds before
   *   clamping (spiral-of-death guard). Defaults to `0.25`.
   */
  constructor(options?: { fixedDt?: number; maxFrameTime?: number }) {
    this.fixedDt = options?.fixedDt ?? 1 / 60;
    this.maxFrameTime = options?.maxFrameTime ?? 0.25;
  }

  /**
   * Set the fixed-update callback, invoked once per accumulated timestep.
   *
   * @param fn - Callback receiving `dt` (fixed timestep) in seconds.
   */
  setFixedUpdate(fn: (dt: number) => void): void {
    this.onFixedUpdate = fn;
  }

  /**
   * Set the render callback, invoked once per animation frame.
   *
   * @param fn - Callback receiving an interpolation alpha between 0 and 1,
   *   representing how far between the last two fixed updates the current
   *   frame falls.
   */
  setRender(fn: (alpha: number) => void): void {
    this.onRender = fn;
  }

  /**
   * Start the game loop. If already running, this is a no-op.
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now() / 1000;
    this.accumulator = 0;
    this.rafId = requestAnimationFrame((ts) => this.frame(ts));
  }

  /**
   * Stop the game loop and cancel the pending animation frame.
   */
  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Whether the loop is currently running.
   *
   * @returns `true` if the loop has been started and not yet stopped.
   */
  get isRunning(): boolean {
    return this.running;
  }

  private frame(timestamp: number): void {
    if (!this.running) return;

    const currentTime = timestamp / 1000;
    let frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Spiral of death protection
    if (frameTime > this.maxFrameTime) {
      frameTime = this.maxFrameTime;
    }

    this.accumulator += frameTime;

    // Fixed timestep updates
    while (this.accumulator >= this.fixedDt) {
      this.onFixedUpdate?.(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    // Render with interpolation alpha
    const alpha = this.accumulator / this.fixedDt;
    this.onRender?.(alpha);

    this.rafId = requestAnimationFrame((ts) => this.frame(ts));
  }
}
