import type { ChartPoint, ChartValue } from '@tanstack/charts';

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

// The axis the tooltip's heading reads, as TanStack's own tooltip picks it:
// the one every focused point shares, none when a group shares neither, or
// y for a lone bar measured along x.
export function headingAxis(
  points: readonly ChartPoint[],
): ChartAxis | undefined {
  const [first, ...rest] = points;
  if (!first) return undefined;
  if (rest.length === 0) {
    return first.xInterval === 'difference' && first.yInterval === undefined
      ? 'y'
      : 'x';
  }
  if (rest.every((point) => isSameValue(point.xValue, first.xValue))) {
    return 'x';
  }
  if (rest.every((point) => isSameValue(point.yValue, first.yValue))) {
    return 'y';
  }
  return undefined;
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

function isSameValue(a: ChartValue, b: ChartValue) {
  return a instanceof Date && b instanceof Date
    ? Object.is(a.getTime(), b.getTime())
    : Object.is(a, b);
}
