import { tv } from 'tailwind-variants/lite';
import { describe, expect, test } from 'vitest';

import { cn, cx } from '#/lib/cx';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('cn rejects an uncalled tv slot', () => {
  const styles = tv({ slots: { label: 'font-medium' } })();
  // @ts-expect-error uncalled slot
  const uncalled = cn(styles.label);
  // @ts-expect-error uncalled slot
  const uncalledBase = cx(styles.label);
  // @ts-expect-error uncalled slot
  const nested = cn(['px-2', styles.label]);
  expect([cn(styles.label()), uncalled, uncalledBase, nested]).toHaveLength(4);
});

test('cn accepts clsx object syntax', () => {
  expect(
    cn('px-2', { 'font-bold': true, italic: false }, [{ 'p-4': true }]),
  ).toBe('font-bold p-4');
});

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
