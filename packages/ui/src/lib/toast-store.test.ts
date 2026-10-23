import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  defaultToastDuration,
  type ToastCloseReason,
} from '#/lib/toast-content';
import { ToastStore } from '#/lib/toast-store';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function connected() {
  const store = new ToastStore();
  store.connect();
  return store;
}

const titles = (store: ToastStore) =>
  store.visibleToasts.map((item) => item.content.title);

function newest(store: ToastStore) {
  const [first] = store.visibleToasts;
  if (!first) throw new Error('No toast');
  return first.content;
}

const isOpen = (store: ToastStore, key: string) =>
  store.visibleToasts.some(
    (item) => item.key === key && !item.content.isExiting,
  );

test('a toast closes after the default duration, with reason timeout', () => {
  const store = connected();
  const onClose = vi.fn<(reason: ToastCloseReason) => void>();
  const key = store.show('Saved', { onClose });
  vi.advanceTimersByTime(defaultToastDuration - 1);
  expect(isOpen(store, key)).toBe(true);
  vi.advanceTimersByTime(1);
  expect(isOpen(store, key)).toBe(false);
  expect(onClose).toHaveBeenCalledExactlyOnceWith('timeout');
});

test('a shorter duration is raised to the minimum', () => {
  const store = connected();
  const key = store.show('Saved', { duration: 1000 });
  vi.advanceTimersByTime(1000);
  expect(isOpen(store, key)).toBe(true);
  vi.advanceTimersByTime(defaultToastDuration - 1000);
  expect(isOpen(store, key)).toBe(false);
});

test('a longer duration is kept', () => {
  const store = connected();
  const key = store.show('Saved', { duration: 8000 });
  vi.advanceTimersByTime(7999);
  expect(isOpen(store, key)).toBe(true);
  vi.advanceTimersByTime(1);
  expect(isOpen(store, key)).toBe(false);
});

test('a toast with an action, or loading, never times out', () => {
  const store = connected();
  const withAction = store.show('Deleted', {
    action: { label: 'Undo', onPress: vi.fn() },
  });
  const loading = store.show('Saving', {}, 'loading');
  const forever = store.show('Pinned', { duration: Infinity });
  vi.advanceTimersByTime(60_000);
  expect(isOpen(store, withAction)).toBe(true);
  expect(isOpen(store, loading)).toBe(true);
  expect(isOpen(store, forever)).toBe(true);
});

test('a toast with an action takes no duration', () => {
  const store = new ToastStore();
  const action = { label: 'Undo', onPress: vi.fn() };
  // @ts-expect-error -- an action keeps the toast until it's closed
  store.show('Deleted', { action, duration: 8000 });
  expect(newest(store).duration).toBe(Infinity);
});

test('pausing keeps the remaining time', () => {
  const store = connected();
  const key = store.show('Saved');
  vi.advanceTimersByTime(3000);
  store.pauseAll();
  vi.advanceTimersByTime(60_000);
  expect(isOpen(store, key)).toBe(true);
  store.resumeAll();
  vi.advanceTimersByTime(defaultToastDuration - 3000 - 1);
  expect(isOpen(store, key)).toBe(true);
  vi.advanceTimersByTime(1);
  expect(isOpen(store, key)).toBe(false);
});

test('timers wait until every pause source resumes', () => {
  const store = connected();
  const key = store.show('Saved');
  store.pause('hidden');
  store.pauseAll();
  store.resumeAll();
  vi.advanceTimersByTime(60_000);
  expect(isOpen(store, key)).toBe(true);
  store.resume('hidden');
  vi.advanceTimersByTime(defaultToastDuration);
  expect(isOpen(store, key)).toBe(false);
});

test('a toast sent before a Toaster connects waits for it', () => {
  const store = new ToastStore();
  const key = store.show('Saved');
  vi.advanceTimersByTime(60_000);
  expect(isOpen(store, key)).toBe(true);
  store.connect();
  vi.advanceTimersByTime(defaultToastDuration);
  expect(isOpen(store, key)).toBe(false);
});

test('the same id replaces the toast in place and restarts its timer', () => {
  const store = connected();
  store.show('First');
  const key = store.show('Saving', { id: 'save' });
  const { version } = newest(store);
  vi.advanceTimersByTime(4000);
  store.show('Saved', { description: 'All changes', id: 'save' }, 'success');
  expect(titles(store)).toEqual(['Saved', 'First']);
  const updated = newest(store);
  expect(updated).toMatchObject({
    description: 'All changes',
    intent: 'success',
  });
  expect(updated.version).toBeGreaterThan(version);
  vi.advanceTimersByTime(defaultToastDuration - 1);
  expect(isOpen(store, key)).toBe(true);
});

test('past the limit the oldest is evicted', () => {
  const store = connected();
  const onClose = vi.fn<(reason: ToastCloseReason) => void>();
  const oldest = store.show('One', { onClose });
  store.show('Two');
  store.show('Three');
  store.show('Four');
  expect(isOpen(store, oldest)).toBe(false);
  expect(onClose).toHaveBeenCalledExactlyOnceWith('evicted');
  store.setLimit(1);
  expect(
    store.visibleToasts.filter((item) => !item.content.isExiting),
  ).toHaveLength(1);
});

test('close reasons: the close button, dismiss and dismiss all', () => {
  const store = connected();
  const reasons: ToastCloseReason[] = [];
  const onClose = (reason: ToastCloseReason) => {
    reasons.push(reason);
  };
  const first = store.show('One', { onClose });
  store.show('Two', { onClose });
  store.show('Three', { onClose });
  store.close(first);
  store.close(first);
  store.dismiss();
  expect(reasons).toEqual(['user', 'programmatic', 'programmatic']);
});

test('a closed toast stays for its exit until removed', () => {
  const store = connected();
  const key = store.show('Saved');
  store.dismiss(key);
  expect(store.visibleToasts).toHaveLength(1);
  expect(newest(store).isExiting).toBe(true);
  store.remove(key);
  expect(store.visibleToasts).toHaveLength(0);
});

test('with no Toaster connected a closed toast goes at once', () => {
  const store = new ToastStore();
  const key = store.show('Saved');
  store.dismiss(key);
  expect(store.visibleToasts).toHaveLength(0);
});

test('a closed toast that never finished its exit goes when the Toaster leaves', () => {
  const store = new ToastStore();
  const disconnect = store.connect();
  store.dismiss(store.show('Saved'));
  disconnect();
  expect(store.visibleToasts).toHaveLength(0);
});

test('the snapshot changes only when the toasts do', () => {
  const store = connected();
  const listener = vi.fn<() => void>();
  store.subscribe(listener);
  store.show('Saved');
  const snapshot = store.getSnapshot();
  store.pauseAll();
  store.resumeAll();
  expect(store.getSnapshot()).toBe(snapshot);
  expect(listener).toHaveBeenCalledOnce();
});

test('a destructive toast is always high priority', () => {
  const store = connected();
  store.show('Failed', {}, 'destructive');
  store.show('Failed quietly', { priority: 'normal' }, 'destructive');
  store.show('Saved', {}, 'success');
  store.show('Urgent', { priority: 'high' }, 'info');
  expect(store.visibleToasts.map((item) => item.content.priority)).toEqual([
    'high',
    'normal',
    'high',
    'high',
  ]);
});

test('a toast closes on its action unless told otherwise', () => {
  const store = connected();
  const action = { label: 'Undo', onPress: vi.fn() };
  store.show('Kept', { action, closeOnAction: false });
  store.show('Closes', { action });
  expect(store.visibleToasts.map((item) => item.content.closeOnAction)).toEqual(
    [true, false],
  );
});

test('add() keeps the content it is given', () => {
  const store = connected();
  const action = { label: 'Undo', onPress: vi.fn() };
  store.show('Template', { action, closeOnAction: false }, 'warning');
  store.add(newest(store));
  expect(newest(store)).toMatchObject({
    action,
    closeOnAction: false,
    duration: Infinity,
    intent: 'warning',
    title: 'Template',
  });
});

test('a timer runs once even when other toasts resync it', () => {
  const store = connected();
  const first = store.show('First');
  vi.advanceTimersByTime(3000);
  store.show('Second');
  store.pauseAll();
  vi.advanceTimersByTime(60_000);
  expect(isOpen(store, first)).toBe(true);
  store.resumeAll();
  vi.advanceTimersByTime(defaultToastDuration - 3000 - 1);
  expect(isOpen(store, first)).toBe(true);
  vi.advanceTimersByTime(1);
  expect(isOpen(store, first)).toBe(false);
});

test('timers stop when the last Toaster disconnects', () => {
  const store = new ToastStore();
  const disconnect = store.connect();
  const key = store.show('Saved');
  vi.advanceTimersByTime(1000);
  disconnect();
  vi.advanceTimersByTime(60_000);
  expect(isOpen(store, key)).toBe(true);
});

test('a region paused when its Toaster unmounted no longer pauses', () => {
  const store = new ToastStore();
  const disconnect = store.connect();
  store.pauseAll();
  disconnect();
  store.connect();
  const key = store.show('Saved');
  vi.advanceTimersByTime(defaultToastDuration);
  expect(isOpen(store, key)).toBe(false);
});

test('a NaN duration falls back to the default', () => {
  const store = connected();
  const key = store.show('Saved', { duration: NaN });
  vi.advanceTimersByTime(defaultToastDuration);
  expect(isOpen(store, key)).toBe(false);
});
