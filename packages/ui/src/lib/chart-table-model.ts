import type { ChartKey, ChartPoint } from '@tanstack/charts';

import { type ChartAxis, isSameValue } from '#/lib/chart-tooltip';

export type ChartTableModel =
  | {
      axis: ChartAxis;
      // Some point names a series, so the rows take a series column.
      hasSeries: boolean;
      kind: 'points';
      points: readonly ChartPoint[];
    }
  | {
      axis: ChartAxis;
      kind: 'series';
      rows: readonly ChartTableRow[];
      series: readonly ChartKey[];
    };

export type ChartTableRow = {
  category: ChartPoint;
  cells: ReadonlyMap<ChartKey, ChartPoint>;
};

// The axis a chart's categories run along: y for bars measured along x,
// otherwise x.
export function categoryAxis(points: readonly ChartPoint[]): ChartAxis {
  return points.length > 0 &&
    points.every(
      (point) =>
        point.xInterval === 'difference' && point.yInterval === undefined,
    )
    ? 'y'
    : 'x';
}

// Rows by category with a column per series when each category has at most
// one point per series; otherwise, as when two marks draw one series, a row
// per point, so no value is dropped.
export function chartTableModel(
  points: readonly ChartPoint[],
): ChartTableModel {
  const axis = categoryAxis(points);
  const categoryOf = (point: ChartPoint) =>
    axis === 'x' ? point.xValue : point.yValue;
  const byPoint: ChartTableModel = {
    axis,
    hasSeries: points.some(({ group }) => group !== null),
    kind: 'points',
    points,
  };
  const series: ChartKey[] = [];
  const rows: { category: ChartPoint; cells: Map<ChartKey, ChartPoint> }[] = [];
  for (const point of points) {
    const { group } = point;
    if (group === null) return byPoint;
    if (!series.includes(group)) series.push(group);
    let row = rows.find(({ category }) =>
      isSameValue(categoryOf(category), categoryOf(point)),
    );
    if (!row) {
      row = { category: point, cells: new Map() };
      rows.push(row);
    }
    if (row.cells.has(group)) return byPoint;
    row.cells.set(group, point);
  }
  if (rows.length === 0) return byPoint;
  return { axis, kind: 'series', rows, series };
}
