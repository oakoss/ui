import { expect, test } from 'vitest';

import { chartColor, chartSeriesKeys } from '#/lib/chart-series';

const config = {
  desktop: { color: 'red', label: 'Desktop' },
  mobile: { color: 'blue', label: 'Mobile' },
  other: { label: 'Other' },
};

test('a config entry with a color is a series, in config order', () => {
  expect(chartSeriesKeys(config)).toEqual(['desktop', 'mobile']);
  expect(chartColor(config)).toMatchObject({
    domain: ['desktop', 'mobile'],
    range: ['red', 'blue'],
  });
});

test('the hidden series fail the legend visibility test', () => {
  const legend = chartColor(config, ['mobile'])?.legend;
  expect(legend?.seriesVisible?.('desktop')).toBe(true);
  expect(legend?.seriesVisible?.('mobile')).toBe(false);
});

test('a config without series sets no color scale', () => {
  expect(chartColor({ other: { label: 'Other' } })).toBeUndefined();
});
