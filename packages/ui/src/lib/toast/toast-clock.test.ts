import { expect, test } from 'vitest';

import { ToastClock } from '#/lib/toast/toast-clock';

function timer() {
  const calls: string[] = [];
  return {
    calls,
    pause: () => {
      calls.push('pause');
    },
    resume: () => {
      calls.push('resume');
    },
  };
}

const noTimers = () => [];

test('runs only with a host and no pause', () => {
  const clock = new ToastClock(noTimers);
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
  const clock = new ToastClock(noTimers);
  const first = clock.connect();
  clock.connect();
  first();
  first();
  expect(clock.hasHost).toBe(true);
  expect(clock.isRunning).toBe(true);
});

test.each(['region', 'tap'] as const)(
  'the %s pause holds until the last host leaves',
  (source) => {
    const clock = new ToastClock(noTimers);
    const first = clock.connect();
    const second = clock.connect();
    clock.pause(source);
    first();
    expect(clock.isRunning).toBe(false);
    second();
    clock.connect();
    expect(clock.isRunning).toBe(true);
  },
);

test('the hidden pause outlives the hosts', () => {
  const clock = new ToastClock(noTimers);
  const disconnect = clock.connect();
  clock.pause('hidden');
  disconnect();
  clock.connect();
  expect(clock.isRunning).toBe(false);
});

test('reset clears every pause', () => {
  const clock = new ToastClock(noTimers);
  clock.connect();
  clock.pause('hidden');
  clock.pause('region');
  clock.reset();
  expect(clock.isRunning).toBe(true);
});

test('each change runs or stops the listed timers', () => {
  const listed = timer();
  const clock = new ToastClock(() => [listed]);
  const disconnect = clock.connect();
  expect(listed.calls.at(-1)).toBe('resume');
  clock.pause('region');
  expect(listed.calls.at(-1)).toBe('pause');
  clock.resume('region');
  expect(listed.calls.at(-1)).toBe('resume');
  disconnect();
  expect(listed.calls.at(-1)).toBe('pause');
});

test('a timer the store stops listing is left alone', () => {
  const listed = timer();
  let timers = [listed];
  const clock = new ToastClock(() => timers);
  clock.connect();
  timers = [];
  clock.pause('hidden');
  clock.resume('hidden');
  expect(listed.calls).toEqual(['resume']);
});
