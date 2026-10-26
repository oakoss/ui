import type { ChartConfig } from '@oakoss/ui/hooks/use-chart';
import type { Key } from 'react-aria-components';

import { ChartContainer, ChartPlot } from '@oakoss/ui/components/ui/data/chart';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@oakoss/ui/components/ui/inputs/toggle-group';
import { chartColor } from '@oakoss/ui/lib/chart-series';
import { defineChart, lineY } from '@tanstack/charts';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';
import { useMemo, useState } from 'react';

const states = ['Loading', 'Error', 'Empty', 'Data'] as const;

type Shown = (typeof states)[number];

const config = {
  visitors: { color: 'var(--color-chart-1)', label: 'Visitors' },
} satisfies ChartConfig;

const months = [
  { month: 'January', series: 'visitors', visitors: 186 },
  { month: 'February', series: 'visitors', visitors: 305 },
  { month: 'March', series: 'visitors', visitors: 237 },
];

export function ChartStates() {
  const [shown, setShown] = useState<Shown>('Loading');
  const definition = useMemo(
    () => visitorsLine(shown === 'Empty' ? [] : months),
    [shown],
  );
  const status = { Error: 'error', Loading: 'loading' } as const;
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <ToggleGroup
        aria-label="State"
        disallowEmptySelection
        onSelectionChange={(keys) => {
          const [key] = keys;
          if (isShown(key)) setShown(key);
        }}
        selectedKeys={[shown]}
        selectionMode="single"
        size="sm"
      >
        {states.map((state) => (
          <ToggleGroupItem id={state} key={state}>
            {state}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <ChartContainer
        config={config}
        description="Visitors from January to March."
        title="Visitors"
      >
        <ChartPlot
          definition={definition}
          status={
            shown === 'Error' || shown === 'Loading' ? status[shown] : undefined
          }
        />
      </ChartContainer>
    </div>
  );
}

function isShown(key: Key | undefined): key is Shown {
  return states.some((state) => state === key);
}

function visitorsLine(rows: typeof months) {
  return defineChart({
    color: chartColor(config),
    marks: [
      lineY(rows, {
        color: 'series',
        strokeWidth: 2,
        x: 'month',
        y: 'visitors',
      }),
    ],
    scales: {
      x: { scale: () => scalePoint().padding(0.2) },
      y: { domain: [0, 400], grid: true, scale: scaleLinear },
    },
    tooltip,
  });
}
