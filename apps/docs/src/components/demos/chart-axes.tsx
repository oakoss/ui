import type { ChartConfig } from '@oakoss/ui/hooks/use-chart';

import { ChartContainer, ChartPlot } from '@oakoss/ui/components/ui/data/chart';
import { ChartTooltipContent } from '@oakoss/ui/components/ui/data/chart-tooltip-content';
import { useChartFormatter } from '@oakoss/ui/hooks/use-chart-formatter';
import { defineChart, lineY } from '@tanstack/charts';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';
import { useMemo } from 'react';

const config = {
  revenue: { color: 'var(--color-chart-1)', label: 'Revenue' },
} satisfies ChartConfig;

const months = [
  { month: 'January', revenue: 42_000 },
  { month: 'February', revenue: 58_000 },
  { month: 'March', revenue: 76_000 },
  { month: 'April', revenue: 64_000 },
  { month: 'May', revenue: 81_000 },
  { month: 'June', revenue: 97_000 },
];

const currency: Intl.NumberFormatOptions = {
  currency: 'USD',
  maximumFractionDigits: 0,
  style: 'currency',
};

export function ChartAxes() {
  const format = useChartFormatter({ number: currency });
  // The definition captures the formatter, so it rebuilds with the locale.
  const definition = useMemo(
    () => revenueChart((value) => format(value)),
    [format],
  );
  return (
    <ChartContainer
      className="w-full max-w-xl"
      config={config}
      description="Monthly revenue from January to June, rising from $42,000 to $97,000."
      title="Revenue"
    >
      <ChartPlot
        definition={definition}
        renderTooltipBody={(context) => (
          <ChartTooltipContent
            {...context}
            valueFormatter={(value) => format(value)}
          />
        )}
      />
    </ChartContainer>
  );
}

// Axis titles, and month ticks at the two ends only.
function revenueChart(format: (value: number) => string) {
  return defineChart({
    marks: [
      lineY(months, {
        id: 'revenue',
        points: true,
        stroke: config.revenue.color,
        strokeWidth: 2,
        x: 'month',
        y: 'revenue',
      }),
    ],
    scales: {
      x: {
        axis: { label: 'Month', ticks: { values: ['January', 'June'] } },
        scale: () => scalePoint().padding(0.2),
      },
      y: {
        axis: { label: 'Revenue', ticks: { format } },
        grid: true,
        nice: true,
        scale: scaleLinear,
      },
    },
    tooltip,
  });
}
