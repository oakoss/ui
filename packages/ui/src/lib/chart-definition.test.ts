import type { ChartControl, DomChartDefinition } from '@tanstack/charts';

import { tooltip } from '@tanstack/charts/tooltip';
import { expect, test } from 'vitest';

import { chartFocusRing, withChartDefaults } from '#/lib/chart-definition';

const control: ChartControl = { id: 'test', resolve: () => ({}) };

function content() {
  return { rows: [] };
}

function withDefaults(
  definition: Pick<DomChartDefinition, 'focusRing' | 'tooltip'>,
) {
  return withChartDefaults(
    { marks: [], scales: {}, ...definition },
    control,
    content,
  );
}

test('a bare tooltip gets the spoken content, and the ring its default', () => {
  const result = withDefaults({ tooltip });
  expect(result.tooltip).toEqual({ content, use: tooltip });
  expect(result.focusRing).toBe(chartFocusRing);
  expect(result.controls).toEqual([control]);
});

test("a tooltip's own text options and a set ring are kept as given", () => {
  for (const options of [
    { format: () => 'f' },
    { formatGroup: () => 'g' },
    { content: () => ({ rows: [] }) },
    { items: [{ channel: 'y' as const }] },
  ]) {
    const own = { ...options, use: tooltip };
    expect(withDefaults({ tooltip: own }).tooltip).toBe(own);
  }
  expect(withDefaults({ focusRing: false }).focusRing).toBe(false);
});

test('a tooltip with options but no text gets the spoken content', () => {
  expect(
    withDefaults({ tooltip: { sticky: true, use: tooltip } }).tooltip,
  ).toEqual({ content, sticky: true, use: tooltip });
});

test('no tooltip stays none', () => {
  expect(withDefaults({ tooltip: false }).tooltip).toBe(false);
  expect(withDefaults({}).tooltip).toBeUndefined();
});
