import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartContainer, ChartPlot } from '@oakoss/ui/components/ui/data/chart';
import { ChartLegend } from '@oakoss/ui/components/ui/data/chart-legend';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useMemo, useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { flatBackground } from '#/helpers/color';
import { tabReal } from '#/helpers/keyboard';
import { paintedColor } from '#/helpers/paint';
import { hoverReal, parkPointer } from '#/helpers/pointer';

import { visitorsConfig, visitorsLines } from './chart-demo';

// Two plots share the legend when `isPaired`, and a button removes the second.
function LegendChart({
  initialHidden,
  isPaired = false,
}: {
  initialHidden?: string[];
  isPaired?: boolean;
}) {
  const [hidden, setHidden] = useState(() => new Set(initialHidden));
  const [hasSecond, setHasSecond] = useState(isPaired);
  const definition = useMemo(() => visitorsLines(hidden), [hidden]);
  return (
    <ChartContainer
      config={visitorsConfig}
      description="Desktop and mobile visitors from January to June."
      title="Visitors by month"
    >
      <ChartPlot definition={definition} />
      {hasSecond ? <ChartPlot definition={definition} /> : null}
      <ChartLegend hidden={hidden} onHiddenChange={setHidden} />
      {isPaired ? (
        <Button onPress={() => setHasSecond((has) => !has)} variant="outline">
          Toggle second chart
        </Button>
      ) : null}
    </ChartContainer>
  );
}

const meta = {
  component: LegendChart,
  title: 'Data/Chart/Legend',
} satisfies Meta<typeof LegendChart>;

export default meta;

type Story = StoryObj<typeof meta>;

function line(series: keyof typeof visitorsConfig) {
  return document.querySelector(
    `svg [stroke="${CSS.escape(visitorsConfig[series].color)}"]`,
  );
}

// The series' line opacity in every plot.
function lineOpacities(series: keyof typeof visitorsConfig) {
  return [
    ...document.querySelectorAll(
      `svg [stroke="${CSS.escape(visitorsConfig[series].color)}"]`,
    ),
  ].map((element) => Number(getComputedStyle(element).opacity));
}

function lineOpacity(series: keyof typeof visitorsConfig) {
  const [opacity] = lineOpacities(series);
  if (opacity === undefined) throw new Error(`No ${series} line`);
  return opacity;
}

function yTicks() {
  return [...document.querySelectorAll('svg text')].map(
    (text) => text.textContent,
  );
}

// Each item is a toggle named by its series, pressed while the series shows,
// in one toolbar named for screen readers.
export const Names: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('toolbar', { name: 'Series' })).toBeVisible();
    const desktop = canvas.getByRole('button', { name: 'Desktop' });
    await expect(desktop).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByRole('button', { name: 'Mobile' })).toBeVisible();
  },
};

// Hiding a series removes its line and keeps the axes: hiding Desktop, the
// tallest series, would otherwise rescale y to Mobile's values.
export const Hide: Story = {
  play: async ({ canvas }) => {
    const ticks = yTicks();
    await expect(line('desktop')).not.toBeNull();
    const desktop = canvas.getByRole('button', { name: 'Desktop' });
    await userEvent.click(desktop);
    await expect(desktop).toHaveAttribute('aria-pressed', 'false');
    await waitFor(() => expect(line('desktop')).toBeNull());
    await expect(line('mobile')).not.toBeNull();
    await expect(yTicks()).toEqual(ticks);
  },
};

// Focusing an item dims the other series, and leaving restores them.
export const HighlightOnFocus: Story = {
  play: async ({ canvas }) => {
    canvas.getByRole('button', { name: 'Desktop' }).focus();
    await waitFor(() => expect(lineOpacity('mobile')).toBe(0.25));
    await expect(lineOpacity('desktop')).toBe(1);
    // Arrow keys move between items in the one tab stop.
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('button', { name: 'Mobile' })).toHaveFocus();
    await waitFor(() => expect(lineOpacity('desktop')).toBe(0.25));
    await userEvent.tab();
    await waitFor(() => expect(lineOpacity('desktop')).toBe(1));
    await expect(lineOpacity('mobile')).toBe(1);
  },
};

// Hovering an item dims the other series until the pointer leaves.
export const HighlightOnHover: Story = {
  play: async ({ canvas }) => {
    await hoverReal(canvas.getByRole('button', { name: 'Mobile' }));
    await waitFor(() => expect(lineOpacity('desktop')).toBe(0.25));
    await expect(lineOpacity('mobile')).toBe(1);
    await parkPointer();
    await waitFor(() => expect(lineOpacity('desktop')).toBe(1));
  },
};

// The pointer's series wins while it hovers, and the focused item's comes
// back when it leaves.
export const HoverOverFocus: Story = {
  play: async ({ canvas }) => {
    canvas.getByRole('button', { name: 'Desktop' }).focus();
    await waitFor(() => expect(lineOpacity('mobile')).toBe(0.25));
    await hoverReal(canvas.getByRole('button', { name: 'Mobile' }));
    await waitFor(() => expect(lineOpacity('desktop')).toBe(0.25));
    await parkPointer();
    await waitFor(() => expect(lineOpacity('mobile')).toBe(0.25));
    await expect(lineOpacity('desktop')).toBe(1);
  },
};

// A hidden series can't be highlighted, so focusing it dims nothing.
export const HiddenNoHighlight: Story = {
  args: { initialHidden: ['mobile'] },
  play: async ({ canvas }) => {
    const mobile = canvas.getByRole('button', { name: 'Mobile' });
    await expect(mobile).toHaveAttribute('aria-pressed', 'false');
    mobile.focus();
    await expect(mobile).toHaveFocus();
    await expect(lineOpacity('desktop')).toBe(1);
  },
};

// The legend is one tab stop, and each item is at least 24px square.
export const TabStopAndTarget: Story = {
  play: async ({ canvas }) => {
    const [desktop, mobile] = canvas.getAllByRole('button');
    if (!desktop || !mobile) throw new Error('No items');
    desktop.focus();
    await tabReal();
    await expect(desktop).not.toHaveFocus();
    await expect(mobile).not.toHaveFocus();
    for (const item of [desktop, mobile]) {
      const { height, width } = item.getBoundingClientRect();
      await expect(height).toBeGreaterThanOrEqual(24);
      await expect(width).toBeGreaterThanOrEqual(24);
    }
  },
};

// One legend highlights every plot in its container; removing one plot leaves
// the other highlighting, and a plot mounted again joins in.
export const TwoPlots: Story = {
  args: { isPaired: true },
  play: async ({ canvas }) => {
    const desktop = canvas.getByRole('button', { name: 'Desktop' });
    const toggle = canvas.getByRole('button', { name: 'Toggle second chart' });
    desktop.focus();
    await waitFor(() => expect(lineOpacities('mobile')).toEqual([0.25, 0.25]));
    await userEvent.click(toggle);
    await waitFor(() => expect(lineOpacities('mobile')).toEqual([1]));
    desktop.focus();
    await waitFor(() => expect(lineOpacities('mobile')).toEqual([0.25]));
    await userEvent.click(toggle);
    desktop.focus();
    await waitFor(() => expect(lineOpacities('mobile')).toEqual([0.25, 0.25]));
  },
};

// A hidden series' swatch is hollow and its label struck through, so the
// state shows without color.
export const HiddenLook: Story = {
  args: { initialHidden: ['mobile'] },
  play: async ({ canvas }) => {
    const [desktop, mobile] = canvas
      .getAllByRole('button')
      .map((button) => button.querySelector('[data-slot=chart-legend-swatch]'));
    if (!desktop || !mobile) throw new Error('No swatches');
    await expect(getComputedStyle(mobile).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)',
    );
    await expect(getComputedStyle(desktop).backgroundColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    );
    await expect(
      getComputedStyle(canvas.getByRole('button', { name: 'Mobile' }))
        .textDecorationLine,
    ).toBe('line-through');
  },
};

// Without hidden and onHiddenChange, the legend is a plain list of the series.
export const Static: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(canvas.getByRole('list')).toHaveTextContent('DesktopMobile');
  },
  render: () => (
    <ChartContainer
      config={visitorsConfig}
      description="Desktop and mobile visitors from January to June."
      title="Visitors by month"
    >
      <ChartPlot definition={visitorsLines()} />
      <ChartLegend />
    </ChartContainer>
  ),
};

// Forced colors repaint backgrounds as the page color, so the swatch opts out
// to keep its series color.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const swatch = canvas
      .getByRole('button', { name: 'Desktop' })
      .querySelector('[data-slot=chart-legend-swatch]');
    if (!swatch) throw new Error('No swatch');
    // The series color as an element that keeps its own colors paints it.
    const probe = document.createElement('span');
    probe.style.forcedColorAdjust = 'none';
    probe.style.backgroundColor = visitorsConfig.desktop.color;
    document.body.append(probe);
    const series = flatBackground(probe);
    probe.remove();
    await expect(await paintedColor(swatch)).toBe(series);
  },
  tags: ['forced-colors'],
};
