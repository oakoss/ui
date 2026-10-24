import { expect, test } from 'vitest';

import {
  closedStack,
  nextStackOpen,
  type StackOpenEvent,
  stackOpenView,
} from '#/lib/toast/toast-stack-open';

function after(...events: StackOpenEvent[]) {
  let state = closedStack;
  for (const event of events) state = nextStackOpen(state, event);
  return stackOpenView(state);
}

test('closed until hovered, focused or tapped', () => {
  expect(after()).toEqual({
    isOpen: false,
    pausesTimers: false,
    showsAll: false,
  });
  expect(after('hover').isOpen).toBe(true);
  expect(after('focus').isOpen).toBe(true);
  expect(after('tap').isOpen).toBe(true);
});

test('only a tap pauses the timers itself', () => {
  expect(after('hover').pausesTimers).toBe(false);
  expect(after('focus').pausesTimers).toBe(false);
  expect(after('tap').pausesTimers).toBe(true);
  expect(after('tap', 'tapOutside').pausesTimers).toBe(false);
});

test('Escape closes it, and a tap with it', () => {
  expect(after('hover', 'escape').isOpen).toBe(false);
  expect(after('focus', 'escape').isOpen).toBe(false);
  expect(after('tap', 'escape')).toEqual({
    isOpen: false,
    pausesTimers: false,
    showsAll: false,
  });
});

test('leaving, blurring or focusing a toast lets it open again', () => {
  expect(after('hover', 'escape', 'unhover', 'hover').isOpen).toBe(true);
  expect(after('focus', 'escape', 'blur', 'focus').isOpen).toBe(true);
  expect(after('focus', 'escape', 'focusToast').isOpen).toBe(true);
});

test('everything shows while focus is inside, until Escape', () => {
  expect(after('focus').showsAll).toBe(true);
  expect(after('hover').showsAll).toBe(false);
  expect(after('focus', 'escape').showsAll).toBe(false);
  expect(after('focus', 'blur').showsAll).toBe(false);
});
