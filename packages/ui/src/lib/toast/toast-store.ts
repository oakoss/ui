import type { ReactNode } from 'react';
import type { QueuedToast, ToastState } from 'react-aria-components';

import { ToastClock, type ToastPauseSource } from '#/lib/toast/toast-clock';
import {
  createTimer,
  defaultToastDuration,
  defaultToastLimit,
  resolveContent,
  type ToastBaseOptions,
  type ToastCloseReason,
  type ToastContent,
  type ToastIntent,
  type ToastPromiseStates,
  type ToastShowOptions,
  type ToastTimer,
} from '#/lib/toast/toast-content';
import { type ToastPromiseHost, trackPromise } from '#/lib/toast/toast-promise';

// The store's bookkeeping beside what the caller passed.
export type ToastItem = Readonly<
  {
    // Identifies one toast's lifetime across every store: kept by an update in
    // place, new for each new toast, even over an exiting one with its id.
    instance: number;
    isExiting: boolean;
    // Changes whenever the content does, so the Toaster announces it again.
    version: number;
  } & QueuedToast<ToastContent>
>;

type Entry = {
  readonly content: ToastContent;
  readonly instance: number;
  isExiting: boolean;
  readonly key: string;
  readonly onClose: ((reason: ToastCloseReason) => void) | undefined;
  readonly timer: ToastTimer | undefined;
  readonly version: number;
};

// Toasts newest first; ToastClock decides when their timers run.
export class ToastStore implements ToastState<ToastContent> {
  static #version = 0;
  get visibleToasts() {
    return this.#visible;
  }
  #clock = new ToastClock();
  #duration = defaultToastDuration;
  #entries: Entry[] = [];
  #limit = defaultToastLimit;
  #listeners = new Set<() => void>();
  #nextId = 0;
  #serverSnapshot: ToastItem[] = [];

  #visible: ToastItem[] = [];

  add(content: ToastContent) {
    const { action, duration, intent, title, ...rest } = content;
    const timing = action ? { action } : { duration };
    return this.show(title, { ...rest, ...timing }, intent);
  }

  // ToastState's close: the user closed it. A version closes only that
  // version, so a late action leaves its replacement open.
  close(key: string, version?: number) {
    const entry = this.#open(key);
    if (!entry || (version !== undefined && entry.version !== version)) return;
    this.#close(entry, 'user');
  }

  // Called by a mounted Toaster; the returned function disconnects it.
  connect() {
    const disconnect = this.#clock.connect();
    this.#syncTimers();
    return () => {
      disconnect();
      if (!this.#clock.hasHost) {
        this.#sweep();
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
    this.#clock.pause(source);
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
    const host: ToastPromiseHost<Entry> = {
      dismiss: (key) => {
        this.dismiss(key);
      },
      isOpen: (entry) => this.#open(entry.key) === entry,
      show: (title, showOptions, intent) =>
        this.#show(title, showOptions, intent),
    };
    return trackPromise(host, input, states, options);
  }

  // Takes a closed toast out once its exit has finished.
  remove(key: string) {
    const next = this.#entries.filter(
      (entry) => entry.key !== key || !entry.isExiting,
    );
    if (next.length === this.#entries.length) return;
    this.#entries = next;
    this.#emit();
  }

  // Drops every toast without close callbacks and restores defaults, for tests.
  reset() {
    for (const entry of this.#entries) entry.timer?.pause();
    this.#duration = defaultToastDuration;
    this.#entries = [];
    this.#limit = defaultToastLimit;
    this.#clock.reset();
    this.#emit();
  }

  resume(source: ToastPauseSource) {
    this.#clock.resume(source);
    this.#syncTimers();
  }

  resumeAll() {
    this.resume('region');
  }

  // The duration of toasts shown from now on that don't set their own;
  // resolveContent floors it.
  setDuration(duration: number) {
    this.#duration = duration;
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
    if (entry.isExiting || !this.#entries.includes(entry)) return;
    entry.timer?.pause();
    entry.isExiting = true;
    this.#sweep();
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
      instance: entry.instance,
      isExiting: entry.isExiting,
      key: entry.key,
      version: entry.version,
    }));
    for (const listener of this.#listeners) listener();
  }

  #evict() {
    const open = this.#entries.filter((entry) => !entry.isExiting);
    for (const entry of open.slice(this.#limit)) this.#close(entry, 'evicted');
  }

  #open(key: string) {
    return this.#entries.find((entry) => entry.key === key && !entry.isExiting);
  }

  #show(title: ReactNode, options: ToastShowOptions, intent: ToastIntent) {
    const key = options.id ?? this.#createId();
    // The same id replaces an open toast in place, with the new call's
    // options. A closing one is dropped at once, and the new toast is new.
    const existing = this.#open(key);
    existing?.timer?.pause();
    const content = resolveContent(title, options, intent, this.#duration);
    const version = (ToastStore.#version += 1);
    const entry: Entry = {
      content,
      instance: existing?.instance ?? version,
      isExiting: false,
      key,
      onClose: options.onClose,
      timer: Number.isFinite(content.duration)
        ? createTimer(() => {
            this.#close(entry, 'timeout');
          }, content.duration)
        : undefined,
      version,
    };
    this.#entries = existing
      ? this.#entries.map((other) => (other === existing ? entry : other))
      : [entry, ...this.#entries.filter((other) => other.key !== key)];
    this.#evict();
    this.#syncTimers();
    this.#emit();
    return entry;
  }

  // Closing toasts wait for a Toaster to play their exit; with none, they go.
  #sweep() {
    if (this.#clock.hasHost) return;
    this.#entries = this.#entries.filter((entry) => !entry.isExiting);
  }

  #syncTimers() {
    for (const entry of this.#entries) {
      if (entry.isExiting) continue;
      if (this.#clock.isRunning) entry.timer?.resume();
      else entry.timer?.pause();
    }
  }
}
