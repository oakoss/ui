import type { ChartPoint } from '@tanstack/charts';

import { expect, test } from 'vitest';

import { chartTableModel } from '#/lib/chart-table-model';

function point(fields: Partial<ChartPoint>): ChartPoint {
  return {
    color: 'red',
    datum: {},
    datumIndex: 0,
    group: null,
    groupLabel: '',
    key: 'k',
    markId: 'mark',
    x: 0,
    xValue: 0,
    y: 0,
    yValue: 0,
    ...fields,
  };
}

test('points with series pivot to a row per category and a column per series', () => {
  const model = chartTableModel([
    point({ group: 'desktop', xValue: 'Jan', yValue: 1 }),
    point({ group: 'mobile', xValue: 'Jan', yValue: 2 }),
    point({ group: 'desktop', xValue: 'Feb', yValue: 3 }),
  ]);
  expect(model).toMatchObject({
    axis: 'x',
    kind: 'series',
    rows: [{ category: { xValue: 'Jan' } }, { category: { xValue: 'Feb' } }],
    series: ['desktop', 'mobile'],
  });
  expect(model).toHaveProperty('rows.1.cells.size', 1);
});

test('categories match dates by time', () => {
  const model = chartTableModel([
    point({ group: 'a', xValue: new Date(0) }),
    point({ group: 'b', xValue: new Date(0) }),
  ]);
  expect(model).toHaveProperty('rows.length', 1);
});

test('bars measured along x run their categories along y', () => {
  const model = chartTableModel([
    point({ group: 'a', xInterval: 'difference', yValue: 'Jan' }),
  ]);
  expect(model.axis).toBe('y');
});

test('a point without a series gives a row per point', () => {
  const points = [point({ xValue: 'chrome' }), point({ xValue: 'safari' })];
  expect(chartTableModel(points)).toEqual({
    axis: 'x',
    hasSeries: false,
    kind: 'points',
    points,
  });
});

test('two values for one series and category give a row per point, keeping both', () => {
  const points = [
    point({ group: 'a', markId: 'bar', xValue: 'Jan', yValue: 10 }),
    point({ group: 'a', markId: 'line', xValue: 'Jan', yValue: 20 }),
  ];
  expect(chartTableModel(points)).toEqual({
    axis: 'x',
    hasSeries: true,
    kind: 'points',
    points,
  });
});
