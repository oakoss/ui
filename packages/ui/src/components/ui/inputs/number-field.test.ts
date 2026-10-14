import { expect, test } from 'vitest';

import type { NumberFieldProps } from '#/components/ui/inputs/number-field';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('children and the layout props are exclusive', () => {
  const valid: NumberFieldProps[] = [
    {},
    { label: 'Quantity', size: 'sm', steppers: 'end' },
    { children: 'Custom' },
  ];
  const mixed: NumberFieldProps[] = [
    // @ts-expect-error children replace the layout
    { children: 'Custom', label: 'Quantity' },
    // @ts-expect-error children replace the layout
    { children: 'Custom', steppers: 'none' },
    // @ts-expect-error children replace the layout
    { children: 'Custom', placeholder: '0' },
  ];
  // @ts-expect-error empty children would render no input
  const empty: NumberFieldProps = { children: null };
  expect([...valid, ...mixed, empty]).toHaveLength(7);
});

test('steppers take one of the four layouts', () => {
  const valid: NumberFieldProps[] = [
    { steppers: 'split' },
    { steppers: 'start' },
    { steppers: 'end' },
    { steppers: 'none' },
  ];
  // @ts-expect-error stacked chevrons fail the target size at these heights
  const stacked: NumberFieldProps = { steppers: 'stacked' };
  expect([...valid, stacked]).toHaveLength(5);
});

test('formatOptions replaces start and end text', () => {
  // @ts-expect-error a unit belongs in formatOptions or the label
  const end: NumberFieldProps = { end: 'kg' };
  // @ts-expect-error a currency symbol belongs in formatOptions
  const start: NumberFieldProps = { start: '$' };
  expect([end, start]).toHaveLength(2);
});
