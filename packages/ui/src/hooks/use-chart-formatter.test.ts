import { expect, test } from 'vitest';

import { withTickPrecision } from '#/hooks/use-chart-formatter';

function tick(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('en-US', withTickPrecision(options)).format(
    value,
  );
}

test('ticks keep the decimals their values have', () => {
  expect([1e-5, 2e-5, 3e-5].map((value) => tick(value))).toEqual([
    '0.00001',
    '0.00002',
    '0.00003',
  ]);
  expect(tick(1450)).toBe('1,450');
});

test('options that cap the digits themselves are kept', () => {
  expect(tick(0.1234, { maximumFractionDigits: 1 })).toBe('0.1');
  expect(tick(0.1234, { maximumSignificantDigits: 2 })).toBe('0.12');
});
