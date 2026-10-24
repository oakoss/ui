import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { defaultToastDuration } from '#/lib/toast/toast-content';
import { ToastStore } from '#/lib/toast/toast-store';

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
    .filter((item) => !item.isExiting)
    .map((item) => item.content.title);

test('a closed or replaced toast leaves no timer running', () => {
  const store = connected();
  const key = store.show('Saving', { id: 'a' });
  store.show('Saved', { id: 'a' });
  expect(vi.getTimerCount()).toBe(1);
  store.close(key);
  expect(vi.getTimerCount()).toBe(0);
});

test('a toast an eviction callback closes or replaces leaves no stray timer', () => {
  const store = connected();
  store.setLimit(1);
  store.show('Old', {
    onClose: () => {
      store.dismiss();
    },
  });
  store.show('New');
  expect(open(store)).toEqual([]);
  expect(vi.getTimerCount()).toBe(0);
  store.show('Older', {
    onClose: () => {
      store.show('Replacement', { id: 'n' });
    },
  });
  store.show('Newer', { id: 'n' });
  expect(open(store)).toEqual(['Replacement']);
  expect(vi.getTimerCount()).toBe(1);
});

test('toasts with the same time left close newest first', () => {
  const store = new ToastStore();
  const closed: string[] = [];
  for (const title of ['A', 'B']) {
    store.show(title, {
      onClose: () => {
        closed.push(title);
      },
    });
  }
  store.connect();
  vi.advanceTimersByTime(defaultToastDuration);
  expect(closed).toEqual(['B', 'A']);
});

test('a toast past the visible count holds its time until it moves up', () => {
  const store = connected();
  for (const title of ['Oldest', 'B', 'C']) {
    store.show(title, { duration: 5000 });
  }
  const newest = store.show('Newest', { duration: 5000 });
  vi.advanceTimersByTime(4000);
  store.close(newest);
  vi.advanceTimersByTime(1000);
  expect(open(store)).toEqual(['Oldest']);
  vi.advanceTimersByTime(3999);
  expect(open(store)).toEqual(['Oldest']);
  vi.advanceTimersByTime(1);
  expect(open(store)).toEqual([]);
});

test('setVisible runs the timers it reaches and holds the rest', () => {
  const store = connected();
  store.setVisible(1);
  store.show('Older', { duration: 5000 });
  store.show('Newer', { duration: Infinity });
  vi.advanceTimersByTime(6000);
  expect(open(store)).toEqual(['Newer', 'Older']);
  store.setVisible(2);
  vi.advanceTimersByTime(5000);
  expect(open(store)).toEqual(['Newer']);
});

test('setVisible keeps at least one', () => {
  const store = connected();
  store.setVisible(0);
  store.show('Older', { duration: 5000 });
  store.show('Newer', { duration: 5000 });
  vi.advanceTimersByTime(5000);
  expect(open(store)).toEqual(['Older']);
});

test('a fractional count runs the timers of the toasts the stack shows', () => {
  const store = connected();
  store.setVisible(2.5);
  for (const title of ['Oldest', 'Middle', 'Newest']) {
    store.show(title, { duration: 5000 });
  }
  vi.advanceTimersByTime(5000);
  expect(open(store)).toEqual(['Oldest']);
});
