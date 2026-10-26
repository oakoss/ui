import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartContainer, ChartPlot } from '@oakoss/ui/components/ui/data/chart';
import { ChartLegend } from '@oakoss/ui/components/ui/data/chart-legend';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useMemo, useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { tabReal } from '#/helpers/keyboard';
import { part } from '#/helpers/parts';

import {
  emptyVisitorsChart,
  visitorsBars,
  visitorsChart,
  visitorsConfig,
} from './chart-demo';

function HideAll() {
  const [hidden, setHidden] = useState(() => new Set<string>());
  const definition = useMemo(() => visitorsBars(hidden), [hidden]);
  return (
    <ChartContainer
      config={visitorsConfig}
      description="Desktop and mobile visitors from January to June."
      title="Visitors by month"
    >
      <ChartPlot definition={definition} hiddenLabel="Every device is hidden" />
      <ChartLegend hidden={hidden} onHiddenChange={setHidden} />
    </ChartContainer>
  );
}

const meta = {
  args: {
    children: <ChartPlot definition={visitorsChart} status="loading" />,
    config: visitorsConfig,
    description: 'Desktop and mobile visitors from January to June.',
    title: 'Visitors by month',
  },
  component: ChartContainer,
  title: 'Data/Chart/States',
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

// A skeleton the plot's size, busy, with text a screen reader reads; the
// caption stays.
export const Loading: Story = {
  args: {
    children: (
      <ChartPlot aspectRatio={2} definition={visitorsChart} status="loading" />
    ),
  },
  play: async ({ canvas }) => {
    const plot = part('chart-plot');
    await expect(plot).toHaveAttribute('aria-busy', 'true');
    await expect(plot).toHaveTextContent('Loading chart');
    const { height, width } = plot.getBoundingClientRect();
    await expect(width / height).toBeCloseTo(2, 1);
    await expect(canvas.queryByRole('img')).toBeNull();
    await expect(canvas.getByRole('figure')).toHaveAccessibleName(
      'Visitors by month',
    );
  },
};

// A plot given its size keeps it in every state.
export const Sized: Story = {
  args: {
    children: (
      <ChartPlot
        definition={visitorsChart}
        height={200}
        status="loading"
        width={300}
      />
    ),
  },
  play: async () => {
    const { height, width } = part('chart-plot').getBoundingClientRect();
    await expect([width, height]).toEqual([300, 200]);
  },
};

// An alert in place of the plot.
export const Failed: Story = {
  args: {
    children: (
      <>
        <ChartPlot definition={visitorsChart} status="error" />
        <ChartPlot
          definition={visitorsChart}
          errorLabel="Visitors couldn’t load"
          status="error"
        />
      </>
    ),
  },
  play: async ({ canvas }) => {
    const [first, second] = canvas.getAllByRole('alert');
    await expect(first).toHaveTextContent('The chart couldn’t load');
    await expect(second).toHaveTextContent('Visitors couldn’t load');
    await expect(part('chart-plot')).not.toHaveAttribute('aria-busy');
  },
};

// A plot the app knows is empty says so in place of the plot.
export const EmptyStatus: Story = {
  args: {
    children: (
      <ChartPlot
        definition={visitorsChart}
        emptyLabel="No visitors yet"
        status="empty"
      />
    ),
  },
  play: async ({ canvas }) => {
    await expect(part('chart-plot')).toHaveTextContent('No visitors yet');
    await expect(canvas.queryByRole('img')).toBeNull();
  },
};

// The labels and fallback replace the default text.
export const Fallback: Story = {
  args: {
    children: (
      <>
        <ChartPlot
          definition={visitorsChart}
          loadingLabel="Fetching visitors"
          status="loading"
        />
        <ChartPlot
          definition={visitorsChart}
          fallback={<Button size="sm">Retry</Button>}
          status="error"
        />
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Fetching visitors')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Retry' })).toBeVisible();
    await expect(canvas.queryByRole('alert')).toBeNull();
  },
};

// A plot with no rows keeps its axes and says so over them, even with no
// series in the config to call hidden.
export const Empty: Story = {
  args: { children: <ChartPlot definition={emptyVisitorsChart} />, config: {} },
  play: async ({ canvas }) => {
    await waitFor(() =>
      expect(part('chart-empty')).toHaveTextContent('No data'),
    );
    await expect(canvas.getByRole('img')).toBeInTheDocument();
  },
};

export const EmptyLabel: Story = {
  args: {
    children: (
      <ChartPlot definition={emptyVisitorsChart} emptyLabel="No visitors yet" />
    ),
  },
  play: async () => {
    await waitFor(() =>
      expect(part('chart-empty')).toHaveTextContent('No visitors yet'),
    );
  },
};

// Hiding every series says so, not that there's no data, and the legend
// stays usable to bring one back.
export const AllHidden: Story = {
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByRole('img')).toBeInTheDocument());
    await expect(document.querySelector('[data-slot=chart-empty]')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Desktop' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Mobile' }));
    await waitFor(() =>
      expect(part('chart-empty')).toHaveTextContent('Every device is hidden'),
    );
    // With no point to mark, keyboard focus shows as the chart's outline.
    await tabReal({ shift: true });
    const chart = canvas.getByRole('img');
    await expect(chart.matches(':focus-visible')).toBe(true);
    await expect(getComputedStyle(chart).outlineStyle).not.toBe('none');
    await userEvent.click(canvas.getByRole('button', { name: 'Mobile' }));
    await waitFor(() =>
      expect(document.querySelector('[data-slot=chart-empty]')).toBeNull(),
    );
  },
  render: () => <HideAll />,
};
