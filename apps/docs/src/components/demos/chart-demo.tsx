import type { ChartConfig } from '@oakoss/ui/hooks/use-chart';

import { ChartContainer, ChartPlot } from '@oakoss/ui/components/ui/data/chart';
import { ChartLegend } from '@oakoss/ui/components/ui/data/chart-legend';
import { ChartTable } from '@oakoss/ui/components/ui/data/chart-table';
import { chartBarStates, chartColor } from '@oakoss/ui/lib/chart-series';
import { barY, defineChart, group } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { useMemo, useState } from 'react';

const config = {
  desktop: { color: 'var(--color-chart-1)', label: 'Desktop' },
  mobile: { color: 'var(--color-chart-2)', label: 'Mobile' },
} satisfies ChartConfig;

const devices: (keyof typeof config)[] = ['desktop', 'mobile'];

const visitors = [
  { desktop: 186, mobile: 80, month: 'January' },
  { desktop: 305, mobile: 200, month: 'February' },
  { desktop: 237, mobile: 120, month: 'March' },
  { desktop: 73, mobile: 190, month: 'April' },
  { desktop: 209, mobile: 130, month: 'May' },
  { desktop: 214, mobile: 140, month: 'June' },
].flatMap(({ month, ...counts }) =>
  devices.map((device) => ({ device, month, visitors: counts[device] })),
);

export function ChartDemo() {
  const [hidden, setHidden] = useState(() => new Set<string>());
  const definition = useMemo(() => visitorsBars(hidden), [hidden]);
  return (
    <ChartContainer
      className="w-full max-w-xl"
      config={config}
      description="Desktop and mobile visitors from January to June."
      title="Visitors by month"
    >
      <ChartPlot definition={definition} />
      <ChartLegend hidden={hidden} onHiddenChange={setHidden} />
      <ChartTable categoryLabel="Month" />
    </ChartContainer>
  );
}

// The color channel names each bar's series, which the legend can hide. An
// outline marks the focused bar, in place of the focus ring's dot.
function visitorsBars(hidden: Set<string>) {
  return defineChart({
    color: chartColor(config, hidden),
    focus: 'group-x',
    focusRing: false,
    marks: [
      barY(visitors, {
        color: 'device',
        layout: group({ padding: 0.1 }),
        radius: 4,
        states: chartBarStates,
        x: 'month',
        y: 'visitors',
      }),
    ],
    scales: {
      x: {
        axis: {
          line: false,
          ticks: { format: (month: string) => month.slice(0, 3), size: 0 },
        },
        scale: scaleBand,
      },
      y: { axis: false, grid: true, nice: true, scale: scaleLinear },
    },
    tooltip,
  });
}
