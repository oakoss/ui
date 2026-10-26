import type { ChartPoint, ChartValue } from '@tanstack/charts';

import { createElement } from 'react';
import { expect, test } from 'vitest';

import {
  axisText,
  chartTooltipText,
  configText,
  headingAxis,
  rowText,
} from '#/lib/chart-tooltip';

function point(fields: Partial<ChartPoint>): ChartPoint {
  return {
    color: 'red',
    datum: {},
    datumIndex: 0,
    group: null,
    groupLabel: 'series',
    key: 'k',
    markId: 'mark',
    x: 0,
    xValue: 0,
    y: 0,
    yValue: 0,
    ...fields,
  };
}

const format = String;

function dateAsD(value: ChartValue) {
  return value instanceof Date ? 'D' : String(value);
}

test('points sharing x head with x, and sharing y with y', () => {
  expect(
    headingAxis([
      point({ xValue: 'Jan', yValue: 1 }),
      point({ xValue: 'Jan', yValue: 2 }),
    ]),
  ).toBe('x');
  expect(
    headingAxis([
      point({ xValue: 1, yValue: 'Jan' }),
      point({ xValue: 2, yValue: 'Jan' }),
    ]),
  ).toBe('y');
});

test('shared dates compare by time', () => {
  const first = point({ xValue: 1, yValue: new Date(0) });
  const second = point({ xValue: 2, yValue: new Date(0) });
  expect(headingAxis([first, second])).toBe('y');
  const day = new Date(0);
  const range = point({
    x1Value: day,
    x2Value: new Date(0),
    xInterval: 'range',
    xValue: day,
  });
  expect(axisText(range, 'x', dateAsD)).toBe('D');
});

test('a group sharing neither axis has no heading, and rows show both', () => {
  const first = point({ xValue: 10, yValue: 20 });
  const second = point({ xValue: 30, yValue: 40 });
  expect(headingAxis([first, second])).toBeUndefined();
  expect(rowText(second, undefined, format)).toBe('30 · 40');
});

test('a lone horizontal bar heads with y; a lone rect or line point with x', () => {
  expect(headingAxis([point({ xInterval: 'difference' })])).toBe('y');
  expect(headingAxis([point({ xInterval: 'range', yInterval: 'range' })])).toBe(
    'x',
  );
  expect(headingAxis([point({})])).toBe('x');
});

test('a baseline interval reports its length', () => {
  expect(
    axisText(
      point({
        y1Value: 40,
        y2Value: 100,
        yInterval: 'difference',
        yValue: 100,
      }),
      'y',
      format,
    ),
  ).toBe('60');
});

test('spoken text heads with the shared value and labels rows from the config', () => {
  const config = { desktop: { label: 'Desktop' }, jan: { label: 'January' } };
  expect(
    chartTooltipText(
      [
        point({ group: 'desktop', xValue: 'jan', yValue: 186 }),
        point({
          group: 'mobile',
          groupLabel: 'mobile',
          xValue: 'jan',
          yValue: 80,
        }),
      ],
      config,
      format,
    ),
  ).toEqual({
    rows: [
      { label: 'Desktop', value: '186' },
      { label: 'mobile', value: '80' },
    ],
    title: 'January',
  });
  expect(chartTooltipText([], config, format)).toEqual({ rows: [] });
});

test('a config label that is not text gives way to the fallback', () => {
  expect(
    configText({ a: { label: createElement('b') } }, 'a', 'fallback'),
  ).toBe('fallback');
  expect(configText({ a: { label: 'A' } }, 'a', 'fallback')).toBe('A');
});

test('a range reports both ends, and a point range its value', () => {
  expect(
    axisText(
      point({ x1Value: 10, x2Value: 20, xInterval: 'range' }),
      'x',
      format,
    ),
  ).toBe('10–20');
  expect(
    axisText(
      point({ x1Value: 5, x2Value: 5, xInterval: 'range', xValue: 5 }),
      'x',
      format,
    ),
  ).toBe('5');
});
