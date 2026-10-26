import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartContainer, ChartPlot } from '@oakoss/ui/components/ui/data/chart';
import { ChartLegend } from '@oakoss/ui/components/ui/data/chart-legend';
import { ChartTable } from '@oakoss/ui/components/ui/data/chart-table';
import { useMemo, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  browsersChart,
  browsersConfig,
  horizontalVisitorsChart,
  overlaidVisitorsChart,
  visitorsBars,
  visitorsChart,
  visitorsConfig,
} from './chart-demo';

function HideableTable() {
  const [hidden, setHidden] = useState(() => new Set<string>());
  const definition = useMemo(() => visitorsBars(hidden), [hidden]);
  return (
    <ChartContainer
      config={visitorsConfig}
      description="Desktop and mobile visitors from January to June."
      title="Visitors by month"
    >
      <ChartPlot definition={definition} />
      <ChartLegend hidden={hidden} onHiddenChange={setHidden} />
      <ChartTable defaultExpanded />
    </ChartContainer>
  );
}

const meta = {
  args: {
    children: (
      <>
        <ChartPlot definition={visitorsChart} />
        <ChartTable />
      </>
    ),
    config: visitorsConfig,
    description: 'Desktop and mobile visitors from January to June.',
    title: 'Visitors by month',
  },
  component: ChartContainer,
  title: 'Data/Chart/Table',
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

function rows(table: HTMLElement) {
  return within(table)
    .getAllByRole('row')
    .map((row) =>
      [...row.querySelectorAll('th, td')].map((cell) => cell.textContent),
    );
}

// Closed until its button opens it; then a table named by the chart's title,
// a row per month headed by the month, and a column per series from the
// config, in the app's locale.
export const Rows: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'View as table' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    const table = await canvas.findByRole('table', {
      name: 'Visitors by month',
    });
    await expect(rows(table).slice(0, 3)).toEqual([
      ['Category', 'Desktop', 'Mobile'],
      ['January', '186', '80'],
      ['February', '305', '200'],
    ]);
    await expect(
      within(table).getByRole('rowheader', { name: 'June' }),
    ).toBeVisible();
  },
};

// Numbers format in the app's locale.
export const Locale: Story = {
  args: {
    children: (
      <>
        <ChartPlot definition={visitorsChart} />
        <ChartTable defaultExpanded />
      </>
    ),
  },
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const table = await canvas.findByRole('table');
    await waitFor(() => expect(rows(table)[1]).toContain('١٨٦'));
  },
};

// A series the legend hides leaves the table, as it leaves the chart.
export const HiddenSeries: Story = {
  play: async ({ canvas }) => {
    const table = await canvas.findByRole('table');
    await waitFor(() =>
      expect(rows(table)[0]).toEqual(['Category', 'Desktop', 'Mobile']),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Desktop' }));
    await waitFor(() => expect(rows(table)[0]).toEqual(['Category', 'Mobile']));
    await expect(rows(table)[1]).toEqual(['January', '80']);
  },
  render: () => <HideableTable />,
};

// Bars measured along x head their rows with the y value, the month.
export const Horizontal: Story = {
  args: {
    children: (
      <>
        <ChartPlot definition={horizontalVisitorsChart} />
        <ChartTable defaultExpanded />
      </>
    ),
  },
  play: async ({ canvas }) => {
    const table = await canvas.findByRole('table');
    await waitFor(() => expect(rows(table)).toContainEqual(['January', '186']));
  },
};

// Two marks drawing one series give each month two values for it, so the
// table takes a row per point with a series column, dropping neither.
export const Overlaid: Story = {
  args: {
    children: (
      <>
        <ChartPlot definition={overlaidVisitorsChart} />
        <ChartTable defaultExpanded />
      </>
    ),
  },
  play: async ({ canvas }) => {
    const table = await canvas.findByRole('table');
    await waitFor(() =>
      expect(rows(table)[0]).toEqual(['Category', 'Series', 'Value']),
    );
    await expect(
      rows(table).filter((row) => row[1] === 'Desktop' && row[2] === '186'),
    ).toHaveLength(2);
  },
};

// A chart without series takes a row per point, its categories named from
// the config, and the labels given.
export const NoSeries: Story = {
  args: {
    children: (
      <>
        <ChartPlot definition={browsersChart} />
        <ChartTable
          categoryLabel="Browser"
          defaultExpanded
          label="Show values"
          valueLabel="Visitors"
        />
      </>
    ),
    config: browsersConfig,
    description: 'Visitors by browser.',
    title: 'Browsers',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Show values' }),
    ).toHaveAttribute('aria-expanded', 'true');
    const table = await canvas.findByRole('table');
    await waitFor(() =>
      expect(rows(table)).toEqual([
        ['Browser', 'Visitors'],
        ['Chrome', '275'],
        ['Safari', '200'],
      ]),
    );
  },
};
