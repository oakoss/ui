import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartContainer, ChartPlot } from '@oakoss/ui/components/ui/data/chart';
import { ChartLegend } from '@oakoss/ui/components/ui/data/chart-legend';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import {
  horizontalVisitorsChart,
  visitorsChart,
  visitorsConfig,
} from './chart-demo';

const desktopConfig = { desktop: visitorsConfig.desktop };

function ControlledLegendChart() {
  const [hidden, setHidden] = useState(() => new Set(['mobile']));
  return (
    <ChartContainer
      config={visitorsConfig}
      description="Desktop and mobile visitors from January to June."
      hiddenSeries={hidden}
      onHiddenSeriesChange={setHidden}
      title="Visitors by month"
    >
      <ChartPlot definition={visitorsChart} />
      <ChartLegend />
      <p data-testid="hidden-series">{[...hidden].join(', ')}</p>
      <Button onPress={() => setHidden(new Set(['desktop']))} variant="outline">
        Hide desktop only
      </Button>
      <Button onPress={() => setHidden(new Set())} variant="outline">
        Show all
      </Button>
    </ChartContainer>
  );
}

const meta = {
  args: {
    children: (
      <>
        <ChartPlot definition={visitorsChart} />
        <ChartLegend isStatic />
      </>
    ),
    config: visitorsConfig,
    description: 'Desktop and mobile visitors from January to June.',
    title: 'Visitors by month',
  },
  component: ChartContainer,
  title: 'Data/Chart/Legend modes',
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

function line(series: keyof typeof visitorsConfig) {
  return document.querySelector(
    `svg [stroke="${CSS.escape(visitorsConfig[series].color)}"]`,
  );
}

export const Static: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(canvas.getByRole('list')).toHaveTextContent('DesktopMobile');
  },
};

// One series has nothing to compare or hide, so its legend is a list.
export const SingleSeries: Story = {
  args: {
    children: (
      <>
        <ChartPlot definition={horizontalVisitorsChart} />
        <ChartLegend />
      </>
    ),
    config: desktopConfig,
    description: 'Desktop visitors from January to June.',
    title: 'Desktop visitors by month',
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('toolbar')).toBeNull();
    await expect(canvas.getByRole('list')).toHaveTextContent('Desktop');
  },
};

// Given `hiddenSeries` and `onHiddenSeriesChange`, the container reports each
// toggle and shows what the app passes back.
export const Controlled: Story = {
  play: async ({ canvas }) => {
    const desktop = canvas.getByRole('button', { name: 'Desktop' });
    const mobile = canvas.getByRole('button', { name: 'Mobile' });
    await expect(mobile).toHaveAttribute('aria-pressed', 'false');
    await expect(line('mobile')).toBeNull();
    // As many hidden as before, but a different series.
    await userEvent.click(
      canvas.getByRole('button', { name: 'Hide desktop only' }),
    );
    await waitFor(() => expect(line('desktop')).toBeNull());
    await expect(line('mobile')).not.toBeNull();
    await expect(mobile).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(mobile);
    await expect(canvas.getByTestId('hidden-series')).toHaveTextContent(
      'desktop, mobile',
    );
    await waitFor(() => expect(line('desktop')).toBeNull());
    await userEvent.click(canvas.getByRole('button', { name: 'Show all' }));
    await waitFor(() => expect(line('mobile')).not.toBeNull());
    await expect(desktop).toHaveAttribute('aria-pressed', 'true');
  },
  render: () => <ControlledLegendChart />,
};
