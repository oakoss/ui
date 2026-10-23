import { expect, test } from 'vitest';

import { ToastClock } from '#/lib/toast/toast-clock';

test('runs only with a host and no pause', () => {
  const clock = new ToastClock();
  expect(clock.isRunning).toBe(false);
  const disconnect = clock.connect();
  expect(clock.isRunning).toBe(true);
  clock.pause('hidden');
  expect(clock.isRunning).toBe(false);
  clock.resume('hidden');
  expect(clock.isRunning).toBe(true);
  disconnect();
  expect(clock.isRunning).toBe(false);
});

test('a second disconnect from the same host does nothing', () => {
  const clock = new ToastClock();
  const first = clock.connect();
  clock.connect();
  first();
  first();
  expect(clock.hasHost).toBe(true);
  expect(clock.isRunning).toBe(true);
});

test('the region pause holds until the last host leaves', () => {
  const clock = new ToastClock();
  const first = clock.connect();
  const second = clock.connect();
  clock.pause('region');
  first();
  expect(clock.isRunning).toBe(false);
  second();
  clock.connect();
  expect(clock.isRunning).toBe(true);
});

test('reset clears every pause', () => {
  const clock = new ToastClock();
  clock.connect();
  clock.pause('hidden');
  clock.pause('region');
  clock.reset();
  expect(clock.isRunning).toBe(true);
});
