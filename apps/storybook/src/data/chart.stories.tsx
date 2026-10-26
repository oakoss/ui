import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartContainer, ChartPlot } from '@oakoss/ui/components/ui/data/chart';
import { ChartTooltipContent } from '@oakoss/ui/components/ui/data/chart-tooltip-content';
import { expect, userEvent, waitFor } from 'storybook/test';

import { computedColor, flatBackground } from '#/helpers/color';
import { paintedColor } from '#/helpers/paint';
import { part } from '#/helpers/parts';

import {
  browsersChart,
  browsersConfig,
  histogramChart,
  horizontalVisitorsChart,
  visitorsChart,
  visitorsConfig,
} from './chart-demo';

function DesktopIcon() {
  return <svg aria-hidden="true" data-testid="desktop-icon" />;
}

const meta = {
  args: {
    children: <ChartPlot definition={visitorsChart} />,
    config: visitorsConfig,
    description: 'Desktop and mobile visitors from January to June.',
    title: 'Visitors by month',
  },
  component: ChartContainer,
  title: 'Data/Chart',
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

// Focuses the chart, which shows the first x value's tooltip.
async function focusTooltip() {
  await userEvent.tab();
  await waitFor(() => expect(part('chart-tooltip')).toBeVisible());
  return part('chart-tooltip');
}

// The figure is named and described by its visible caption, and the chart
// inside carries the same name and description.
export const Default: Story = {
  args: {
    children: (
      <>
        <ChartPlot definition={visitorsChart} />
        <p>Desktop leads in every month but April.</p>
      </>
    ),
  },
  play: async ({ canvas }) => {
    const figure = canvas.getByRole('figure');
    await expect(figure).toHaveAccessibleName('Visitors by month');
    await expect(figure).toHaveAccessibleDescription(
      'Desktop and mobile visitors from January to June.',
    );
    // SVG-AAM describes the chart by its <desc>, which Testing Library's
    // description doesn't compute.
    const chart = canvas.getByRole('img', { name: 'Visitors by month' });
    await expect(chart.querySelector(':scope > desc')).toHaveTextContent(
      'Desktop and mobile visitors from January to June.',
    );
  },
};

// TanStack's five default series colors are the theme's chart colors, and its
// sixth is the muted gray.
export const SeriesColors: Story = {
  play: async () => {
    const host = document.querySelector('.ts-chart-host');
    if (!host) throw new Error('No chart');
    // The fallback keeps an unset variable from matching the inherited text
    // color, which is the same gray.
    for (const n of [1, 2, 3, 4, 5]) {
      await expect(
        computedColor(`var(--ts-chart-${n}, transparent)`, host),
      ).toBe(computedColor(`var(--color-chart-${n})`));
    }
    await expect(computedColor('var(--ts-chart-6, transparent)', host)).toBe(
      computedColor('var(--color-muted-foreground)'),
    );
  },
};

// Focus shows the first month's values, one row per series, named from the
// config.
export const TooltipOnFocus: Story = {
  play: async ({ canvas }) => {
    const tooltip = await focusTooltip();
    await expect(
      canvas.getByRole('img', { name: 'Visitors by month' }),
    ).toHaveFocus();
    await expect(tooltip).toHaveTextContent('January');
    await expect(tooltip).toHaveTextContent('Desktop186');
    await expect(tooltip).toHaveTextContent('Mobile80');
  },
};

// Values and categories format in the app's locale, not the browser's.
export const Locale: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    const tooltip = await focusTooltip();
    await expect(tooltip).toHaveTextContent('Desktop١٨٦');
  },
};

// A horizontal bar is headed by its category, the y value, and reports its
// length, the x value.
export const Horizontal: Story = {
  args: { children: <ChartPlot definition={horizontalVisitorsChart} /> },
  play: async () => {
    // Keyboard focus starts at the shortest bar.
    const tooltip = await focusTooltip();
    await expect(part('chart-tooltip-label').textContent).toBe('April');
    await expect(tooltip).toHaveTextContent('Desktop73');
    // A dot indicator keeps the heading above the row.
    await expect(
      part('chart-tooltip-item').contains(part('chart-tooltip-label')),
    ).toBe(false);
  },
};

// A category named in the config heads the tooltip with its label.
export const ConfigLabel: Story = {
  args: {
    children: <ChartPlot definition={browsersChart} />,
    config: browsersConfig,
  },
  play: async () => {
    const tooltip = await focusTooltip();
    await expect(part('chart-tooltip-label').textContent).toBe('Chrome');
    await expect(tooltip).toHaveTextContent('Visitors275');
  },
};

// A histogram bin is headed by its range, and its bar by the count, as
// TanStack's own tooltip reports a rect.
export const Range: Story = {
  args: { children: <ChartPlot definition={histogramChart} />, config: {} },
  play: async () => {
    await focusTooltip();
    await expect(part('chart-tooltip-label').textContent).toBe('0–10');
    await expect(part('chart-tooltip-item')).toHaveTextContent('0–12');
  },
};

// hideLabel and hideIndicator leave only the rows' names and values.
export const HiddenParts: Story = {
  play: async () => {
    const tooltip = await focusTooltip();
    await expect(
      tooltip.querySelector('[data-slot=chart-tooltip-label]'),
    ).toBeNull();
    await expect(
      tooltip.querySelector('[data-slot=chart-tooltip-indicator]'),
    ).toBeNull();
    await expect(tooltip).toHaveTextContent('Desktop186');
  },
  render: (args) => (
    <ChartContainer {...args}>
      <ChartPlot
        definition={visitorsChart}
        renderTooltipBody={(context) => (
          <ChartTooltipContent {...context} hideIndicator hideLabel />
        )}
      />
    </ChartContainer>
  ),
};

// A series with an icon in the config shows it in place of the indicator.
export const ConfigIcon: Story = {
  args: {
    config: {
      ...visitorsConfig,
      desktop: { ...visitorsConfig.desktop, icon: DesktopIcon },
    },
  },
  play: async () => {
    const tooltip = await focusTooltip();
    const [desktop, mobile] = tooltip.querySelectorAll(
      '[data-slot=chart-tooltip-item]',
    );
    await expect(
      desktop?.querySelector('[data-testid=desktop-icon]'),
    ).not.toBeNull();
    await expect(
      desktop?.querySelector('[data-slot=chart-tooltip-indicator]'),
    ).toBeNull();
    await expect(
      mobile?.querySelector('[data-slot=chart-tooltip-indicator]'),
    ).not.toBeNull();
  },
};

// shadcn's line indicator: a bar beside each value.
export const LineIndicator: Story = {
  play: async () => {
    const tooltip = await focusTooltip();
    const indicator = part('chart-tooltip-indicator');
    await expect(indicator.getBoundingClientRect().width).toBe(4);
    // Two series keep one heading above both rows.
    await expect(
      tooltip.querySelectorAll('[data-slot=chart-tooltip-label]'),
    ).toHaveLength(1);
    await expect(part('chart-tooltip-label').parentElement).toBe(tooltip);
  },
  render: (args) => (
    <ChartContainer {...args}>
      <ChartPlot
        definition={visitorsChart}
        renderTooltipBody={(context) => (
          <ChartTooltipContent {...context} indicator="line" />
        )}
      />
    </ChartContainer>
  ),
};

// One series nests its heading beside the dashed indicator.
export const DashedIndicator: Story = {
  play: async () => {
    await focusTooltip();
    const indicator = part('chart-tooltip-indicator');
    await expect(getComputedStyle(indicator).borderTopStyle).toBe('dashed');
    await expect(
      part('chart-tooltip-item').contains(part('chart-tooltip-label')),
    ).toBe(true);
  },
  render: (args) => (
    <ChartContainer {...args}>
      <ChartPlot
        definition={horizontalVisitorsChart}
        renderTooltipBody={(context) => (
          <ChartTooltipContent {...context} indicator="dashed" />
        )}
      />
    </ChartContainer>
  ),
};

// Formatters replace the heading and the values.
export const Formatters: Story = {
  play: async () => {
    const tooltip = await focusTooltip();
    await expect(part('chart-tooltip-label').textContent).toBe('Jan');
    await expect(tooltip).toHaveTextContent('Desktop186 visits');
  },
  render: (args) => (
    <ChartContainer {...args}>
      <ChartPlot
        definition={visitorsChart}
        renderTooltipBody={(context) => (
          <ChartTooltipContent
            {...context}
            labelFormatter={(month) => String(month).slice(0, 3)}
            valueFormatter={(value) => `${String(value)} visits`}
          />
        )}
      />
    </ChartContainer>
  ),
};

// Forced colors repaint backgrounds as the page color, so the indicator
// opts out to keep its series color.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    await focusTooltip();
    const indicator = part('chart-tooltip-indicator');
    await expect(await paintedColor(indicator)).not.toBe(
      flatBackground(document.body),
    );
  },
  tags: ['forced-colors'],
};
