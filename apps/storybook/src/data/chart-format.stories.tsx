import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartContainer, ChartPlot } from '@oakoss/ui/components/ui/data/chart';
import { ChartTable } from '@oakoss/ui/components/ui/data/chart-table';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useChart } from '@oakoss/ui/hooks/use-chart';
import { defineChart, lineY } from '@tanstack/charts';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { part } from '#/helpers/parts';

import { visitorsChart, visitorsConfig } from './chart-demo';

// Dust counts in grams: every tick sits below Intl's default three decimals.
const dustChart = defineChart({
  marks: [
    lineY(
      [
        { day: 1, grams: 1e-5 },
        { day: 2, grams: 3e-5 },
      ],
      { x: 'day', y: 'grams' },
    ),
  ],
  scales: { x: { scale: scaleLinear }, y: { scale: scaleLinear } },
});

// The formatters each render of the container handed its parts.
const seenFormats = new Set<unknown>();

function FormatProbe() {
  seenFormats.add(useChart().format);
  return null;
}

function RerenderedChart() {
  const [renders, setRenders] = useState(0);
  const [isCurrency, setIsCurrency] = useState(false);
  const currency: Intl.NumberFormatOptions = isCurrency
    ? { currency: 'USD', style: 'currency' }
    : {};
  return (
    <ChartContainer
      config={visitorsConfig}
      description="Desktop and mobile visitors from January to June."
      format={{ number: { maximumFractionDigits: 0, ...currency } }}
      title="Visitors by month"
    >
      <ChartPlot definition={visitorsChart} />
      <FormatProbe />
      <Button onPress={() => setRenders(renders + 1)} variant="outline">
        Render again
      </Button>
      <Button onPress={() => setIsCurrency(true)} variant="outline">
        Show dollars
      </Button>
    </ChartContainer>
  );
}

const meta = {
  args: {
    children: <ChartPlot definition={visitorsChart} />,
    config: visitorsConfig,
    description: 'Desktop and mobile visitors from January to June.',
    title: 'Visitors by month',
  },
  component: ChartContainer,
  title: 'Data/Chart/Format',
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

async function focusTooltip() {
  await userEvent.tab();
  await waitFor(() => expect(part('chart-tooltip')).toBeVisible());
  return part('chart-tooltip');
}

function tickLabels() {
  return [...document.querySelectorAll('svg text')].map(
    (text) => text.textContent,
  );
}

// Values and categories format in the app's locale, not the browser's, and so
// do the ticks of a numeric axis that sets no format.
export const Locale: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    await waitFor(() => expect(tickLabels()).toContain('٣٠٠'));
    await expect(tickLabels()).not.toContain('300');
    const tooltip = await focusTooltip();
    await expect(tooltip).toHaveTextContent('Desktop١٨٦');
  },
};

// The container's number format reaches the ticks, the tooltip and the table.
export const Currency: Story = {
  args: {
    children: (
      <>
        <ChartPlot definition={visitorsChart} />
        <ChartTable defaultExpanded />
      </>
    ),
    format: {
      number: { currency: 'USD', maximumFractionDigits: 0, style: 'currency' },
    },
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(tickLabels()).toContain('$300'));
    await expect(
      within(canvas.getByRole('table')).getAllByRole('cell')[0],
    ).toHaveTextContent('$186');
    const tooltip = await focusTooltip();
    await expect(tooltip).toHaveTextContent('Desktop$186');
  },
};

// Ticks keep the decimals their values need, so tiny values don't all read 0.
export const SmallValues: Story = {
  args: { children: <ChartPlot definition={dustChart} /> },
  play: async () => {
    await waitFor(() => expect(tickLabels()).toContain('0.00003'));
    const ticks = tickLabels().filter((label) => label.startsWith('0.'));
    await expect(new Set(ticks).size).toBe(ticks.length);
  },
};

// An inline format, a new object on each render, keeps one formatter, so the
// plots don't rebuild their definitions.
export const InlineFormat: Story = {
  play: async ({ canvas }) => {
    seenFormats.clear();
    const button = canvas.getByRole('button', { name: 'Render again' });
    await userEvent.click(button);
    await userEvent.click(button);
    await expect(seenFormats.size).toBe(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Show dollars' }));
    await waitFor(() => expect(tickLabels()).toContain('$300'));
    await expect(seenFormats.size).toBe(2);
  },
  render: () => <RerenderedChart />,
};
