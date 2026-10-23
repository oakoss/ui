import type { ReactNode } from 'react';
import type { QueuedToast, ToastState } from 'react-aria-components';

import {
  callMessage,
  createTimer,
  resolveContent,
  type ToastBaseOptions,
  type ToastCloseReason,
  type ToastContent,
  type ToastIntent,
  type ToastPromiseState,
  type ToastPromiseStates,
  type ToastShowOptions,
  type ToastTimer,
  toPromiseState,
} from '#/lib/toast/toast-content';

// The region pauses while hovered or focused; the Toaster while the page is hidden.
export type ToastPauseSource = 'hidden' | 'region';

type Entry = {
  content: ToastContent;
  readonly key: string;
  readonly onClose: ((reason: ToastCloseReason) => void) | undefined;
  readonly timer: ToastTimer | undefined;
};

// Toasts newest first. Timers run only while a Toaster is connected and
// nothing pauses them, so a toast sent before the Toaster mounts waits for it.
export class ToastStore implements ToastState<ToastContent> {
  get visibleToasts() {
    return this.#visible;
  }
  #entries: Entry[] = [];
  #hosts = 0;
  #limit = 3;
  #listeners = new Set<() => void>();
  #nextId = 0;
  #pausedBy = new Set<ToastPauseSource>();
  #serverSnapshot: QueuedToast<ToastContent>[] = [];
  #version = 0;

  #visible: QueuedToast<ToastContent>[] = [];

  get #isRunning() {
    return this.#hosts > 0 && this.#pausedBy.size === 0;
  }

  add(content: ToastContent) {
    return this.show(
      content.title,
      {
        ...(content.action
          ? { action: content.action }
          : { duration: content.duration }),
        closeOnAction: content.closeOnAction,
        custom: content.custom,
        description: content.description,
        icon: content.icon,
        priority: content.priority,
      },
      content.intent,
    );
  }

  // ToastState's close, used by the close button: the user closed it.
  close(key: string) {
    const entry = this.#open(key);
    if (entry) this.#close(entry, 'user');
  }

  // Called by a mounted Toaster; the returned function disconnects it.
  connect() {
    this.#hosts += 1;
    this.#syncTimers();
    return () => {
      this.#hosts -= 1;
      if (this.#hosts === 0) {
        // An unmounting region never resumes the toasts it paused.
        this.#pausedBy.delete('region');
        this.#entries = this.#entries.filter(
          (entry) => !entry.content.isExiting,
        );
        this.#emit();
      }
      this.#syncTimers();
    };
  }

  dismiss(key?: string) {
    for (const entry of this.#entries) {
      if (key === undefined || entry.key === key) {
        this.#close(entry, 'programmatic');
      }
    }
  }

  getServerSnapshot = () => this.#serverSnapshot;

  getSnapshot = () => this.#visible;

  pause(source: ToastPauseSource) {
    this.#pausedBy.add(source);
    this.#syncTimers();
  }

  pauseAll() {
    this.pause('region');
  }

  promise<T>(
    input: (() => Promise<T>) | Promise<T>,
    states: ToastPromiseStates<T>,
    options: ToastBaseOptions = {},
  ) {
    const promise = typeof input === 'function' ? input() : input;
    const loading = toPromiseState(states.loading);
    // Captured before an onClose run by this show can reuse the id.
    const own = this.#show(
      loading.title,
      { ...options, ...loading.options },
      'loading',
    );
    const { key } = own;
    const settle = (message: ReactNode | ToastPromiseState, isOk: boolean) => {
      const { options: stateOptions, title } = toPromiseState(message);
      this.show(
        title,
        { ...options, ...stateOptions, id: key },
        isOk ? 'success' : 'destructive',
      );
    };
    const watch = async () => {
      const [result] = await Promise.allSettled([promise]);
      // A toast closed or replaced meanwhile stays that way.
      if (this.#open(key) !== own) return;
      try {
        if (result.status === 'fulfilled') {
          settle(callMessage(states.success, result.value), true);
        } else {
          settle(callMessage(states.error, result.reason), false);
        }
      } catch (error: unknown) {
        // A message that throws mustn't leave the spinner up.
        this.dismiss(key);
        throw error;
      }
    };
    void watch();
    return promise;
  }

  // Takes a closed toast out once its exit has finished.
  remove(key: string) {
    const next = this.#entries.filter(
      (entry) => entry.key !== key || !entry.content.isExiting,
    );
    if (next.length === this.#entries.length) return;
    this.#entries = next;
    this.#emit();
  }

  // Drops every toast without close callbacks, for tests.
  reset() {
    for (const entry of this.#entries) entry.timer?.pause();
    this.#entries = [];
    this.#pausedBy.clear();
    this.#emit();
  }

  resume(source: ToastPauseSource) {
    this.#pausedBy.delete(source);
    this.#syncTimers();
  }

  resumeAll() {
    this.resume('region');
  }

  setLimit(limit: number) {
    if (Number.isNaN(limit)) return;
    this.#limit = Math.max(1, limit);
    this.#evict();
  }

  show(
    title: ReactNode,
    options: ToastShowOptions = {},
    intent: ToastIntent = 'neutral',
  ) {
    return this.#show(title, options, intent).key;
  }

  subscribe = (listener: () => void) => {
    this.#listeners.add(listener);
    return () => {
      this.#listeners.delete(listener);
    };
  };

  #close(entry: Entry, reason: ToastCloseReason) {
    // An onClose that replaced this toast mid-loop has already taken it out.
    if (entry.content.isExiting || !this.#entries.includes(entry)) return;
    entry.timer?.pause();
    entry.content = { ...entry.content, isExiting: true };
    // With no Toaster to play an exit, it goes at once.
    if (this.#hosts === 0) {
      this.#entries = this.#entries.filter((other) => other !== entry);
    }
    this.#emit();
    try {
      entry.onClose?.(reason);
    } catch (error: unknown) {
      // Report it without leaving the store's work half done.
      queueMicrotask(() => {
        throw error;
      });
    }
  }

  #createId() {
    let key: string;
    do key = `toast-${String((this.#nextId += 1))}`;
    while (this.#entries.some((entry) => entry.key === key));
    return key;
  }

  #emit() {
    this.#visible = this.#entries.map((entry) => ({
      content: entry.content,
      key: entry.key,
    }));
    for (const listener of this.#listeners) listener();
  }

  #evict() {
    const open = this.#entries.filter((entry) => !entry.content.isExiting);
    for (const entry of open.slice(this.#limit)) this.#close(entry, 'evicted');
  }

  #open(key: string) {
    return this.#entries.find(
      (entry) => entry.key === key && !entry.content.isExiting,
    );
  }

  #show(title: ReactNode, options: ToastShowOptions, intent: ToastIntent) {
    const key = options.id ?? this.#createId();
    // The same id replaces an open toast in place, with the new call's
    // options. A closing one finishes its exit, and the new toast is new.
    const existing = this.#open(key);
    existing?.timer?.pause();
    const content = resolveContent(
      title,
      options,
      intent,
      (this.#version += 1),
    );
    const entry: Entry = {
      content,
      key,
      onClose: options.onClose,
      timer: Number.isFinite(content.duration)
        ? createTimer(() => {
            this.#close(entry, 'timeout');
          }, content.duration)
        : undefined,
    };
    this.#entries = existing
      ? this.#entries.map((other) => (other === existing ? entry : other))
      : [entry, ...this.#entries.filter((other) => other.key !== key)];
    this.#evict();
    this.#syncTimers();
    this.#emit();
    return entry;
  }

  #syncTimers() {
    for (const entry of this.#entries) {
      if (entry.content.isExiting) continue;
      if (this.#isRunning) entry.timer?.resume();
      else entry.timer?.pause();
    }
  }
}
