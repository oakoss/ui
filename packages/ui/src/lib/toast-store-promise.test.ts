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

const open = (store: ToastStore) =>
  store.visibleToasts
    .filter((item) => !item.content.isExiting)
    .map((item) => item.content.title);

const loadingStates = { error: 'Failed', loading: 'Saving', success: 'Saved' };

// Lets the store's promise handling run after the caller's await.
const settle = () => vi.advanceTimersByTimeAsync(0);

test('a promise shows loading, then success with the value', async () => {
  const store = connected();
  const result = store.promise(Promise.resolve(3), {
    error: 'Failed',
    loading: 'Saving',
    success: (count) => ({
      description: 'Synced',
      title: `${String(count)} saved`,
    }),
  });
  expect(store.visibleToasts[0]?.content).toMatchObject({
    duration: Infinity,
    intent: 'loading',
  });
  await expect(result).resolves.toBe(3);
  await settle();
  expect(store.visibleToasts[0]?.content).toMatchObject({
    description: 'Synced',
    intent: 'success',
    title: '3 saved',
  });
});

test('a rejected promise shows the error and is returned to the caller', async () => {
  const store = connected();
  const failure = new Error('offline');
  const result = store.promise(() => Promise.reject(failure), {
    ...loadingStates,
    error: (error) => `Failed: ${String(error)}`,
  });
  await expect(result).rejects.toBe(failure);
  await settle();
  expect(store.visibleToasts[0]?.content).toMatchObject({
    intent: 'destructive',
    title: 'Failed: Error: offline',
  });
});

test('shared promise options reach each state, and a state’s own win', async () => {
  const store = connected();
  const onClose = vi.fn<(reason: ToastCloseReason) => void>();
  const key = store.promise(
    Promise.resolve(),
    {
      ...loadingStates,
      success: { description: 'From the state', title: 'Saved' },
    },
    { description: 'Shared', icon: 'icon', id: 'p', onClose },
  );
  expect(store.visibleToasts[0]).toMatchObject({
    content: { description: 'Shared', icon: 'icon' },
    key: 'p',
  });
  await key;
  await settle();
  expect(store.visibleToasts[0]?.content).toMatchObject({
    description: 'From the state',
    icon: 'icon',
  });
  store.dismiss();
  expect(onClose).toHaveBeenCalledExactlyOnceWith('programmatic');
});

test('a loading toast closed before its promise settles stays closed', async () => {
  const store = connected();
  const onClose = vi.fn<(reason: ToastCloseReason) => void>();
  const result = store.promise(Promise.resolve(), loadingStates, {
    id: 'p',
    onClose,
  });
  store.close('p');
  await result;
  await settle();
  expect(open(store)).toEqual([]);
  expect(onClose).toHaveBeenCalledExactlyOnceWith('user');
});

test('a promise settles only its own toast when another reuses its id', async () => {
  const store = connected();
  const first = Promise.withResolvers<string>();
  const second = Promise.withResolvers<string>();
  const firstOnClose = vi.fn<(reason: ToastCloseReason) => void>();
  const messages = {
    error: (error: unknown) => `Failed: ${String(error)}`,
    loading: 'Saving',
    success: (value: string) => value,
  };
  void store.promise(first.promise, messages, {
    id: 'save',
    onClose: firstOnClose,
  });
  const result = store.promise(second.promise, messages, { id: 'save' });
  first.resolve('First saved');
  await settle();
  expect(open(store)).toEqual(['Saving']);
  second.reject(new Error('offline'));
  await expect(result).rejects.toThrow('offline');
  await settle();
  expect(open(store)).toEqual(['Failed: Error: offline']);
  expect(firstOnClose).not.toHaveBeenCalled();
});

test('a promise settles nothing when an eviction reused its id at once', async () => {
  const store = connected();
  store.setLimit(1);
  store.show('Old', {
    onClose: () => {
      store.dismiss('a');
      store.show('Mine', { id: 'a' });
    },
  });
  const result = store.promise(Promise.resolve(), loadingStates, { id: 'a' });
  await result;
  await settle();
  expect(open(store)).toEqual(['Mine']);
});

test('a promise pending across reset shows nothing when it settles', async () => {
  const store = connected();
  const result = store.promise(Promise.resolve(), loadingStates);
  store.reset();
  await result;
  await settle();
  expect(store.visibleToasts).toHaveLength(0);
});

test('a message that throws closes the loading toast and is reported', async () => {
  const store = connected();
  const failure = new Error('message failed');
  const rejections: unknown[] = [];
  const onRejection = (reason: unknown) => {
    rejections.push(reason);
  };
  process.on('unhandledRejection', onRejection);
  const result = store.promise(Promise.resolve(), {
    ...loadingStates,
    success: () => {
      throw failure;
    },
  });
  await result;
  await settle();
  await vi.waitFor(() => {
    expect(rejections).toEqual([failure]);
  });
  process.off('unhandledRejection', onRejection);
  expect(open(store)).toEqual([]);
});

test('a loading toast never times out', () => {
  const store = connected();
  void store.promise(Promise.withResolvers<undefined>().promise, loadingStates);
  vi.advanceTimersByTime(defaultToastDuration * 10);
  expect(open(store)).toEqual(['Saving']);
});
