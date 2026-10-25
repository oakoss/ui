import type { ChartConfig } from '@oakoss/ui/hooks/use-chart';

import { ChartContainer, ChartPlot } from '@oakoss/ui/components/ui/data/chart';
import { ChartTooltipContent } from '@oakoss/ui/components/ui/data/chart-tooltip-content';
import { chartColor } from '@oakoss/ui/lib/chart-series';
import { areaY, defineChart } from '@tanstack/charts';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';

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

// Areas stack by device.
const definition = defineChart({
  color: chartColor(config),
  focus: 'group-x',
  marks: [
    areaY(visitors, {
      color: 'device',
      fillOpacity: 0.4,
      x: 'month',
      y: 'visitors',
    }),
  ],
  maxFocusDistance: Infinity,
  scales: {
    x: {
      axis: {
        line: false,
        ticks: { format: (month: string) => month.slice(0, 3), size: 0 },
      },
      scale: () => scalePoint().padding(0.2),
    },
    y: { axis: false, grid: true, nice: true, scale: scaleLinear },
  },
  tooltip,
});

export function ChartTooltip() {
  return (
    <ChartContainer
      className="w-full max-w-xl"
      config={config}
      description="Desktop and mobile visitors from January to June, stacked."
      title="Total visitors"
    >
      <ChartPlot
        definition={definition}
        renderTooltipBody={(context) => (
          <ChartTooltipContent
            {...context}
            indicator="line"
            valueFormatter={(value) => `${String(value)} visitors`}
          />
        )}
      />
    </ChartContainer>
  );
}
