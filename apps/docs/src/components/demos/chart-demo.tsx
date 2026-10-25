import {
  type ChartConfig,
  ChartContainer,
} from '@oakoss/ui/components/ui/data/chart';
import { barY, defineChart, group } from '@tanstack/charts';
import { scaleBand } from '@tanstack/charts/scales/band';
import { scaleLinear } from '@tanstack/charts/scales/linear';
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

const definition = defineChart({
  focus: 'group-x',
  marks: [
    barY(visitors, {
      fill: (row) => config[row.device].color,
      layout: group({ padding: 0.1 }),
      radius: 4,
      x: 'month',
      y: 'visitors',
      z: 'device',
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

export function ChartDemo() {
  return (
    <ChartContainer
      className="w-full max-w-xl"
      config={config}
      definition={definition}
      description="Desktop and mobile visitors from January to June."
      title="Visitors by month"
    />
  );
}
