import { describe, expect, test } from 'vitest';

import {
  endSwipe,
  exitTransform,
  moveSwipe,
  startSwipe,
  type SwipeDirection,
  swipeDirections,
  swipeDistance,
} from '#/lib/toast/toast-swipe';

const bottomEnd: readonly SwipeDirection[] = ['down', 'right'];

function at(align: 'center' | 'end' | 'start', isRtl = false) {
  return swipeDirections({ align, isRtl, side: 'bottom' });
}

function swipe(points: readonly (readonly [number, number])[], ms = 1000) {
  let state = startSwipe({ x: 0, y: 0 }, 0);
  for (const [x, y] of points) state = moveSwipe(state, { x, y }, bottomEnd);
  return { out: endSwipe(state, ms, bottomEnd), state };
}

describe('swipeDirections', () => {
  test('the side and the aligned edge', () => {
    expect(at('end')).toEqual(['down', 'right']);
    expect(at('start')).toEqual(['down', 'left']);
    expect(at('end', true)).toEqual(['down', 'left']);
    expect(at('start', true)).toEqual(['down', 'right']);
    expect(at('center')).toEqual(['down']);
    expect(
      swipeDirections({ align: 'end', isRtl: false, side: 'top' }),
    ).toEqual(['up', 'right']);
  });
});

describe('moveSwipe', () => {
  test('locks to the first axis it moves along', () => {
    const { state } = swipe([
      [5, 2],
      [20, 40],
    ]);
    expect(state.axis).toBe('x');
    expect(state.offset).toEqual({ x: 20, y: 0 });
  });

  test('follows the pointer toward an allowed edge', () => {
    expect(swipe([[0, 30]]).state.offset).toEqual({ x: 0, y: 30 });
  });

  test('resists a pull away from the allowed edges, more as it goes', () => {
    const short = swipe([[-10, 0]]).state.offset.x;
    const long = swipe([[-100, 0]]).state.offset.x;
    expect(short).toBeLessThan(0);
    expect(short).toBeGreaterThan(-10);
    expect(long).toBeGreaterThan(-100 / 6);
    expect(Math.abs(long)).toBeGreaterThan(Math.abs(short));
  });

  test('waits for movement before choosing an axis', () => {
    expect(swipe([[0, 0]]).state.axis).toBeUndefined();
  });
});

describe('endSwipe', () => {
  test('closes past the distance toward an allowed edge', () => {
    expect(swipe([[0, swipeDistance]]).out).toBe('down');
    expect(swipe([[swipeDistance, 0]]).out).toBe('right');
    expect(swipe([[0, swipeDistance - 1]]).out).toBeUndefined();
  });

  test('never closes toward an edge it may not leave by', () => {
    expect(swipe([[0, -200]], 10).out).toBeUndefined();
    expect(swipe([[-200, 0]], 10).out).toBeUndefined();
  });

  test('a quick flick closes short of the distance', () => {
    expect(swipe([[0, 20]], 100).out).toBe('down');
    expect(swipe([[0, 20]], 1000).out).toBeUndefined();
  });

  test('a tap that jitters stays', () => {
    expect(swipe([[0, 4]], 10).out).toBeUndefined();
    expect(swipe([], 10).out).toBeUndefined();
  });
});

describe('exitTransform', () => {
  test('carries on from the offset, off the edge', () => {
    expect(exitTransform('down', { x: 0, y: 180 })).toBe(
      'translate(0, calc(180px + 100%))',
    );
    expect(exitTransform('up', { x: 0, y: -50 })).toBe(
      'translate(0, calc(-50px - 100%))',
    );
    expect(exitTransform('left', { x: -50, y: 0 })).toBe(
      'translate(calc(-50px - 100%), 0)',
    );
    expect(exitTransform('right', { x: 60, y: 0 })).toBe(
      'translate(calc(60px + 100%), 0)',
    );
  });
});
