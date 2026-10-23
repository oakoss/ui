import { createElement } from 'react';
import { afterEach, expect, test, vi } from 'vitest';

import { toast, toastStore } from '#/lib/toast/toast';

afterEach(() => {
  toast.reset();
  vi.unstubAllGlobals();
});

const states = { error: 'Failed', loading: 'Saving', success: 'Saved' };

const shown = () =>
  toastStore.visibleToasts
    .filter(({ content }) => !content.isExiting)
    .map(({ content }) => [content.title, content.intent]);

// Lets the store's promise handling run after the caller's await.
const settle = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

test('toast() does nothing during a server render', async () => {
  expect(toast('Saved', { id: 'save' })).toBe('save');
  expect(toast.success('Saved')).toBe('');
  expect(toast.loading('Saving', { id: 'load' })).toBe('load');
  expect(
    toast.custom(() => 'Custom', { id: 'custom', title: 'Custom toast' }),
  ).toBe('custom');
  await expect(toast.promise(Promise.resolve(1), states)).resolves.toBe(1);
  await expect(toast.promise(() => Promise.resolve(2), states)).resolves.toBe(
    2,
  );
  expect(shown()).toEqual([]);
});

test('toast() and its intents reach the shared store', () => {
  vi.stubGlobal('document', {});
  toast.success('Saved');
  toast.destructive('Failed');
  toast.custom(() => 'Custom', { title: 'Custom toast' });
  expect(shown()).toEqual([
    ['Custom toast', 'neutral'],
    ['Failed', 'destructive'],
    ['Saved', 'success'],
  ]);
  toast.dismissAll();
  expect(shown()).toEqual([]);
});

test('a loading toast takes no duration', () => {
  vi.stubGlobal('document', {});
  // @ts-expect-error -- a loading toast stays until it's updated or closed
  toast.loading('Saving', { duration: 8000 });
  expect(toastStore.visibleToasts[0]?.content.duration).toBe(Infinity);
});

test('a promise state can be an element rather than options', async () => {
  vi.stubGlobal('document', {});
  const title = createElement('strong', { title: 'Hint' }, 'Saved');
  await toast.promise(Promise.resolve(), { ...states, success: title });
  await settle();
  expect(toastStore.visibleToasts[0]?.content.title).toBe(title);
});

test('a custom toast renders through its function, replaced by id', () => {
  vi.stubGlobal('document', {});
  toast.custom(() => 'First', { id: 'c', title: 'Custom toast' });
  const key = toast.custom((id) => `Second ${id}`, {
    id: 'c',
    title: 'Custom toast',
  });
  expect(toastStore.visibleToasts).toHaveLength(1);
  expect(toastStore.visibleToasts[0]?.content.custom?.(key)).toBe('Second c');
});
