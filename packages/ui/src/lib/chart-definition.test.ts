import {
  type ChartColorOptions,
  type ChartControl,
  type ChartPositionScaleOptions,
  type ConfiguredScaleLike,
  defaultChartTheme,
  type DomChartDefinition,
} from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { expect, test } from 'vitest';

import { chartFocusRing, withChartDefaults } from '#/lib/chart-definition';

const control: ChartControl = { id: 'test', resolve: () => ({}) };
const color: ChartColorOptions = { domain: ['desktop'] };

function content() {
  return { rows: [] };
}

function tickFormat(value: number) {
  return `#${value}`;
}

const defaults = { color, content, control, tickFormat };

function formatOf(scale: ChartPositionScaleOptions | null | undefined) {
  const own = ticks(scale);
  return own === undefined || own === false ? undefined : own.format;
}

// A D3 time scale's shape: a function whose domain holds dates.
function scaleTime(): ConfiguredScaleLike<Date> {
  const scale: ConfiguredScaleLike<Date> = Object.assign(() => 0, {
    copy: () => scale,
    domain: () => [new Date(0), new Date(1)],
    range: () => scale,
  });
  return scale;
}

function ticks(scale: ChartPositionScaleOptions | null | undefined) {
  const axis = scale?.axis;
  return axis === undefined || axis === false ? undefined : axis.ticks;
}

function withDefaults(
  definition: {
    color?: ChartColorOptions;
    scales?: Record<string, ChartPositionScaleOptions>;
  } & Partial<Pick<DomChartDefinition, 'focusRing' | 'tooltip'>>,
) {
  const result = withChartDefaults(
    { marks: [], scales: {}, ...definition },
    defaults,
  );
  if ('chart' in result) throw new Error('Expected a static definition');
  return result;
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

test("the legend's color fills only a definition without its own", () => {
  expect(withDefaults({}).color).toBe(color);
  const own: ChartColorOptions = { domain: ['mobile'] };
  expect(withDefaults({ color: own }).color).toBe(own);
});

test('numeric axes without a format get the locale format', () => {
  const { scales } = withDefaults({
    scales: {
      instance: { scale: scaleLinear().domain([0, 10]) },
      x: { scale: scaleBand },
      y: { axis: { label: 'Visitors' }, scale: scaleLinear },
    },
  });
  expect(formatOf(scales.y)).toBe(tickFormat);
  expect(scales.y?.axis).toMatchObject({ label: 'Visitors' });
  expect(formatOf(scales.instance)).toBe(tickFormat);
  expect(ticks(scales.x)).toBeUndefined();
});

test("time axes, hidden axes and an axis's own format are left alone", () => {
  const { scales } = withDefaults({
    scales: {
      hidden: { axis: false, scale: scaleLinear },
      noTicks: { axis: { ticks: false }, scale: scaleLinear },
      own: { axis: { ticks: { format: String } }, scale: scaleLinear },
      time: { scale: scaleTime },
      timeInstance: { scale: scaleTime() },
    },
  });
  expect(scales.hidden?.axis).toBe(false);
  expect(ticks(scales.noTicks)).toBe(false);
  expect(formatOf(scales.own)).toBe(String);
  expect(ticks(scales.time)).toBeUndefined();
  expect(ticks(scales.timeInstance)).toBeUndefined();
});

test('a responsive definition gets the defaults in each spec it builds', () => {
  const { controls, spec } = responsiveWithDefaults();
  expect(spec.color).toBe(color);
  expect(formatOf(spec.scales.y)).toBe(tickFormat);
  expect(controls).toEqual([control]);
});

function responsiveWithDefaults() {
  const result = withChartDefaults(
    {
      chart: () => ({ marks: [], scales: { y: { scale: scaleLinear } } }),
      tooltip,
    },
    defaults,
  );
  if (!('chart' in result)) throw new Error('Expected a responsive definition');
  const spec = result.chart({
    defaultTheme: defaultChartTheme,
    height: 100,
    width: 100,
  });
  return { controls: result.controls, spec };
}
