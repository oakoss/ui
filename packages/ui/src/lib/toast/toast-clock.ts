// The region pauses while hovered or focused; the Toaster while the page is hidden.
export type ToastPauseSource = 'hidden' | 'region';

// Toast timers run only while a Toaster is connected and nothing pauses them,
// so a toast sent before the Toaster mounts waits for it.
export class ToastClock {
  get hasHost() {
    return this.#hosts > 0;
  }

  get isRunning() {
    return this.#hosts > 0 && this.#pausedBy.size === 0;
  }

  #hosts = 0;
  #pausedBy = new Set<ToastPauseSource>();

  connect() {
    this.#hosts += 1;
    let isConnected = true;
    return () => {
      if (!isConnected) return;
      isConnected = false;
      this.#hosts -= 1;
      // An unmounting region never resumes the toasts it paused.
      if (this.#hosts === 0) this.#pausedBy.delete('region');
    };
  }

  pause(source: ToastPauseSource) {
    this.#pausedBy.add(source);
  }

  reset() {
    this.#pausedBy.clear();
  }

  resume(source: ToastPauseSource) {
    this.#pausedBy.delete(source);
  }
}
