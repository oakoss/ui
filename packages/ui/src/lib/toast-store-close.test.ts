import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ToastCloseReason } from '#/lib/toast-content';

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

const open = (store: ToastStore) =>
  store.visibleToasts
    .filter((item) => !item.content.isExiting)
    .map((item) => item.content.title);

test('an id reused while its toast closes makes a new toast, which removal keeps', () => {
  const store = connected();
  const onClose = vi.fn<(reason: ToastCloseReason) => void>();
  store.show('Old', { id: 'a' });
  store.show('Newer');
  store.dismiss('a');
  store.show('New', { id: 'a', onClose });
  expect(open(store)).toEqual(['New', 'Newer']);
  expect(store.visibleToasts.map((item) => item.key)).toEqual(['a', 'toast-1']);
  store.remove('a');
  expect(open(store)).toEqual(['New', 'Newer']);
  expect(onClose).not.toHaveBeenCalled();
});

test('an evicted id shown again is not evicted at once', () => {
  const store = connected();
  store.setLimit(1);
  store.show('Old', { id: 'a' });
  store.show('Newer');
  store.show('New', { id: 'a' });
  expect(open(store)).toEqual(['New']);
});

test('an upsert stops the replaced timer', () => {
  const store = connected();
  const onClose = vi.fn<(reason: ToastCloseReason) => void>();
  store.show('Saving', { id: 's', onClose });
  vi.advanceTimersByTime(4000);
  store.show('Saved', { id: 's' });
  vi.advanceTimersByTime(1500);
  expect(onClose).not.toHaveBeenCalled();
});

test('a generated id never takes over a chosen one', () => {
  const store = connected();
  store.show('Chosen', { id: 'toast-1' });
  store.show('Generated');
  expect(open(store)).toEqual(['Generated', 'Chosen']);
});

test('eviction counts only open toasts', () => {
  const store = connected();
  store.show('One');
  store.show('Two');
  const three = store.show('Three');
  store.dismiss(three);
  store.show('Four');
  expect(open(store)).toEqual(['Four', 'Two', 'One']);
});

test('setLimit keeps at least one toast and ignores NaN', () => {
  const store = connected();
  store.show('One');
  store.show('Two');
  store.setLimit(NaN);
  expect(open(store)).toEqual(['Two', 'One']);
  store.setLimit(0);
  expect(open(store)).toEqual(['Two']);
});

test('the server snapshot stays empty and stable', () => {
  const store = new ToastStore();
  const other = new ToastStore();
  store.show('Saved');
  expect(other.visibleToasts).toHaveLength(0);
  expect(store.getServerSnapshot()).toEqual([]);
  expect(store.getServerSnapshot()).toBe(store.getServerSnapshot());
});

test('a closing toast stays while another Toaster is still connected', () => {
  const store = new ToastStore();
  store.connect();
  const disconnect = store.connect();
  store.dismiss(store.show('Saved'));
  disconnect();
  expect(store.visibleToasts).toHaveLength(1);
});

test('removing a toast that is not there changes nothing', () => {
  const store = connected();
  const listener = vi.fn<() => void>();
  const key = store.show('Saved');
  const snapshot = store.getSnapshot();
  store.subscribe(listener);
  store.remove('missing');
  store.remove(key);
  expect(listener).not.toHaveBeenCalled();
  expect(store.getSnapshot()).toBe(snapshot);
});

test('a throwing onClose is reported and the rest still close', () => {
  const store = connected();
  const failure = new Error('onClose failed');
  const reported = vi.fn<(error: unknown) => void>();
  vi.spyOn(globalThis, 'queueMicrotask').mockImplementation((task) => {
    try {
      task();
    } catch (error: unknown) {
      reported(error);
    }
  });
  const onClose = vi.fn<(reason: ToastCloseReason) => void>();
  store.show('One', { onClose });
  // Newest first, so the throwing toast closes before One.
  store.show('Two', {
    onClose: () => {
      throw failure;
    },
  });
  store.dismiss();
  expect(open(store)).toEqual([]);
  expect(onClose).toHaveBeenCalledExactlyOnceWith('programmatic');
  expect(reported).toHaveBeenCalledExactlyOnceWith(failure);
});

test('a toast an onClose replaced mid-dismiss keeps the new one open', () => {
  const store = connected();
  const replacedOnClose = vi.fn<(reason: ToastCloseReason) => void>();
  store.show('Old', { id: 'c', onClose: replacedOnClose });
  store.show('Other', {
    onClose: () => {
      store.show('New', { id: 'c' });
    },
  });
  store.dismiss();
  expect(open(store)).toEqual(['New']);
  expect(replacedOnClose).not.toHaveBeenCalled();
});

test('reset drops every toast without close callbacks', () => {
  const store = connected();
  const onClose = vi.fn<(reason: ToastCloseReason) => void>();
  store.show('Saved', { onClose });
  store.reset();
  expect(store.visibleToasts).toHaveLength(0);
  expect(onClose).not.toHaveBeenCalled();
});
