import type { ChartConfig } from '@oakoss/ui/hooks/use-chart';

import { ChartContainer, ChartPlot } from '@oakoss/ui/components/ui/data/chart';
import { defineChart, lineY } from '@tanstack/charts';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';

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

// Axis titles, and month ticks at the two ends only. The revenue ticks take
// the container's currency format.
const revenueChart = defineChart({
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
      axis: { label: 'Revenue' },
      grid: true,
      nice: true,
      scale: scaleLinear,
    },
  },
  tooltip,
});

export function ChartAxes() {
  return (
    <ChartContainer
      className="w-full max-w-xl"
      config={config}
      description="Monthly revenue from January to June, rising from $42,000 to $97,000."
      format={{
        number: {
          currency: 'USD',
          maximumFractionDigits: 0,
          style: 'currency',
        },
      }}
      title="Revenue"
    >
      <ChartPlot definition={revenueChart} />
    </ChartContainer>
  );
}
