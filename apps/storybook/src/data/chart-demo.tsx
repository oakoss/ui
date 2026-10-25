import type { ChartConfig } from '@oakoss/ui/hooks/use-chart';

import { barX, barY, defineChart, lineY, rect } from '@tanstack/charts';
import { crosshair } from '@tanstack/charts/crosshair';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';

export const visitorsConfig = {
  desktop: { color: 'var(--color-chart-1)', label: 'Desktop' },
  mobile: { color: 'var(--color-chart-2)', label: 'Mobile' },
} satisfies ChartConfig;

const devices: (keyof typeof visitorsConfig)[] = ['desktop', 'mobile'];

const months = [
  { desktop: 186, mobile: 80, month: 'January' },
  { desktop: 305, mobile: 200, month: 'February' },
  { desktop: 237, mobile: 120, month: 'March' },
  { desktop: 73, mobile: 190, month: 'April' },
  { desktop: 209, mobile: 130, month: 'May' },
  { desktop: 214, mobile: 140, month: 'June' },
];

// One row per month and device: grouped focus shares a tooltip across the
// series of one mark.
export const visitors = months.flatMap(({ month, ...counts }) =>
  devices.map((device) => ({ device, month, visitors: counts[device] })),
);

export const visitorsChart = defineChart({
  focus: 'group-x',
  marks: [
    lineY(visitors, {
      stroke: (row) => visitorsConfig[row.device].color,
      strokeWidth: 2,
      x: 'month',
      y: 'visitors',
      z: 'device',
    }),
    crosshair({ x: true, y: false }),
  ],
  maxFocusDistance: Infinity,
  scales: {
    x: { scale: () => scalePoint().padding(0.2) },
    y: { grid: true, nice: true, scale: scaleLinear },
  },
  tooltip,
});

export const browsersConfig = {
  chrome: { color: 'var(--color-chart-1)', label: 'Chrome' },
  safari: { color: 'var(--color-chart-2)', label: 'Safari' },
  visitors: { label: 'Visitors' },
} satisfies ChartConfig;

// Bars keyed by browser, whose config labels head the tooltip.
export const browsersChart = defineChart({
  marks: [
    barY(
      [
        { browser: 'chrome', visitors: 275 },
        { browser: 'safari', visitors: 200 },
      ],
      { id: 'visitors', x: 'browser', y: 'visitors' },
    ),
  ],
  scales: {
    x: { scale: scaleBand },
    y: { grid: true, nice: true, scale: scaleLinear },
  },
  tooltip,
});

// A histogram: each bin spans a range of x.
export const histogramChart = defineChart({
  marks: [
    rect(
      [
        { base: 0, count: 12, end: 10, start: 0 },
        { base: 0, count: 30, end: 20, start: 10 },
      ],
      { id: 'sessions', x1: 'start', x2: 'end', y1: 'base', y2: 'count' },
    ),
  ],
  scales: {
    x: { scale: scaleLinear },
    y: { grid: true, nice: true, scale: scaleLinear },
  },
  tooltip,
});

// Bars along x, one per month: the month is the y value.
export const horizontalVisitorsChart = defineChart({
  marks: [
    barX(months, {
      fill: visitorsConfig.desktop.color,
      id: 'desktop',
      x: 'desktop',
      y: 'month',
    }),
  ],
  scales: {
    x: { grid: true, nice: true, scale: scaleLinear },
    y: { scale: scaleBand },
  },
  tooltip,
});
