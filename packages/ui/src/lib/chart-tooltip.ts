import type {
  ChartPoint,
  ChartTooltipContent,
  ChartValue,
} from '@tanstack/charts';

import type { ChartConfig } from '#/hooks/use-chart';

export type ChartAxis = 'x' | 'y';

// A point's text along an axis, as TanStack's tooltip reports it: a bar or
// area with a baseline gives its length, a range its two ends.
export function axisText(
  point: ChartPoint,
  axis: ChartAxis,
  format: (value: ChartValue) => string,
): string {
  const [start, end, interval] =
    axis === 'x'
      ? [point.x1Value, point.x2Value, point.xInterval]
      : [point.y1Value, point.y2Value, point.yInterval];
  if (
    interval === 'difference' &&
    typeof start === 'number' &&
    typeof end === 'number'
  ) {
    return format(end - start);
  }
  if (
    interval === 'range' &&
    start !== undefined &&
    end !== undefined &&
    !isSameValue(start, end)
  ) {
    return `${format(start)}–${format(end)}`;
  }
  return format(axisValue(point, axis));
}

export function axisValue<
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>(
  point: ChartPoint<unknown, TXValue, TYValue>,
  axis: ChartAxis,
): TXValue | TYValue {
  return axis === 'x' ? point.xValue : point.yValue;
}

// A point's category along an axis as text: a category named in the config
// reads as its label.
export function categoryText(
  point: ChartPoint,
  axis: ChartAxis,
  config: ChartConfig,
  format: (value: ChartValue) => string,
): string {
  const value = axisValue(point, axis);
  return typeof value === 'string'
    ? configText(config, value, value)
    : axisText(point, axis, format);
}

// The focused points as text, labeled from the config as the tooltip is: what
// TanStack's status region announces, and a chart without a tooltip too.
export function chartTooltipText(
  points: readonly ChartPoint[],
  config: ChartConfig,
  format: (value: ChartValue) => string,
): ChartTooltipContent {
  const [first] = points;
  if (!first) return { rows: [] };
  const heading = headingAxis(points);
  return {
    rows: points.map((point) => ({
      label: seriesText(point, config),
      value: rowText(point, heading, format),
    })),
    title:
      heading === undefined
        ? undefined
        : categoryText(first, heading, config, format),
  };
}

// A config label as text; a label that isn't text gives way to the fallback.
export function configText(
  config: ChartConfig,
  key: string,
  fallback: string,
): string {
  const label = config[key]?.label;
  return typeof label === 'string' || typeof label === 'number'
    ? String(label)
    : fallback;
}

// The axis the tooltip's heading reads, as TanStack's own tooltip picks it:
// the one every focused point shares, none when a group shares neither, or
// y for a lone bar measured along x.
export function headingAxis(
  points: readonly ChartPoint[],
): ChartAxis | undefined {
  const [first, ...rest] = points;
  if (!first) return undefined;
  if (rest.length === 0) return isMeasuredAlongX(first) ? 'y' : 'x';
  if (rest.every((point) => isSameValue(point.xValue, first.xValue))) {
    return 'x';
  }
  if (rest.every((point) => isSameValue(point.yValue, first.yValue))) {
    return 'y';
  }
  return undefined;
}

// A bar measured along x, whose category is its y value.
export function isMeasuredAlongX(point: ChartPoint) {
  return point.xInterval === 'difference' && point.yInterval === undefined;
}

export function isSameValue(a: ChartValue, b: ChartValue) {
  return a instanceof Date && b instanceof Date
    ? Object.is(a.getTime(), b.getTime())
    : Object.is(a, b);
}

// A row's text: the axis the heading doesn't read, or both axes when there's
// no heading.
export function rowText(
  point: ChartPoint,
  heading: ChartAxis | undefined,
  format: (value: ChartValue) => string,
): string {
  if (heading === undefined) {
    return `${axisText(point, 'x', format)} · ${axisText(point, 'y', format)}`;
  }
  return axisText(point, heading === 'x' ? 'y' : 'x', format);
}

// A point's series as text, named from the config.
export function seriesText(point: ChartPoint, config: ChartConfig): string {
  const key = String(point.group ?? point.markId);
  return configText(config, key, point.groupLabel || key);
}
