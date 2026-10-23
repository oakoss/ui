import type { ToastTimer } from '#/lib/toast/toast-content';

// The region pauses while hovered or focused; the Toaster while the page is hidden.
export type ToastPauseSource = 'hidden' | 'region';

// Runs the open toasts' timers only while a Toaster is connected and nothing
// pauses them, so a toast sent before the Toaster mounts waits for it. The
// store lists the timers, newest first, so equal timers close in that order.
export class ToastClock {
  get hasHost() {
    return this.#hosts > 0;
  }

  get isRunning() {
    return this.#hosts > 0 && this.#pausedBy.size === 0;
  }

  #hosts = 0;
  #pausedBy = new Set<ToastPauseSource>();
  #timers: () => Iterable<ToastTimer>;

  constructor(timers: () => Iterable<ToastTimer>) {
    this.#timers = timers;
  }

  connect() {
    this.#hosts += 1;
    this.sync();
    let isConnected = true;
    return () => {
      if (!isConnected) return;
      isConnected = false;
      this.#hosts -= 1;
      // An unmounting region never resumes the toasts it paused.
      if (this.#hosts === 0) this.#pausedBy.delete('region');
      this.sync();
    };
  }

  pause(source: ToastPauseSource) {
    this.#pausedBy.add(source);
    this.sync();
  }

  reset() {
    this.#pausedBy.clear();
  }

  resume(source: ToastPauseSource) {
    this.#pausedBy.delete(source);
    this.sync();
  }

  // For the store, after the open toasts change.
  sync() {
    for (const timer of this.#timers()) {
      if (this.isRunning) timer.resume();
      else timer.pause();
    }
  }
}
