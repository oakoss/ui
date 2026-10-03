import { describe, expect, test } from 'vitest';

import { cx } from '#/lib/cx';

describe('cx', () => {
  test('returns the base classes when no className is given', () => {
    expect(cx('bg-primary px-2')({})).toBe('bg-primary px-2');
  });

  test('accepts an array base', () => {
    expect(cx(['bg-primary', 'px-2'])({})).toBe('bg-primary px-2');
  });

  test('lets a string className override a conflicting base class', () => {
    expect(cx('bg-primary px-2', 'bg-emerald-500')({})).toBe(
      'px-2 bg-emerald-500',
    );
  });

  test.each([
    ['h-control', 'h-9', 'h-9'],
    ['px-control-x', 'px-4', 'px-4'],
    ['font-heading', 'font-mono', 'font-mono'],
    ['rounded-control', 'rounded-none', 'rounded-none'],
    ['text-ui', 'text-sm', 'text-sm'],
    ['text-ui', 'text-foreground', 'text-ui text-foreground'],
  ])('merges token class %s with %s', (base, className, expected) => {
    expect(cx(base, className)({})).toBe(expected);
  });

  test('resolves a render-prop className against the render values', () => {
    const className = cx<{ tone: string }>('bg-primary px-2', (v) => v.tone);

    expect(className({ tone: 'bg-emerald-500' })).toBe('px-2 bg-emerald-500');
    expect(className({ tone: '' })).toBe('bg-primary px-2');
  });
});
