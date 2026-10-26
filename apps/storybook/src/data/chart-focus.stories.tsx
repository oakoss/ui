import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChartContainer, ChartPlot } from '@oakoss/ui/components/ui/data/chart';
import { ChartLegend } from '@oakoss/ui/components/ui/data/chart-legend';
import { useEffect, useMemo, useState } from 'react';
import { expect, userEvent, waitFor } from 'storybook/test';

import { computedColor, contrast } from '#/helpers/color';
import { hoverReal } from '#/helpers/pointer';

import {
  silentVisitorsChart,
  visitorsBars,
  visitorsChart,
  visitorsConfig,
} from './chart-demo';

function HideableBars() {
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
    </ChartContainer>
  );
}

// Set while RedrawnBars is mounted, so the play function can redraw it and
// count the renders.
const redrawn: { draw?: () => void; renders: number } = { renders: 0 };

function RedrawnBars() {
  const [drawn, setDrawn] = useState(0);
  // A new definition each time draw runs, with the same bars.
  const definition = useMemo(() => visitorsBars([`redraw-${drawn}`]), [drawn]);
  useEffect(() => {
    redrawn.draw = () => setDrawn((count) => count + 1);
    return () => {
      delete redrawn.draw;
    };
  }, []);
  return (
    <ChartPlot
      definition={definition}
      onRender={() => {
        redrawn.renders += 1;
      }}
    />
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
  title: 'Data/Chart/Focus',
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

async function focusChart() {
  await userEvent.tab();
  await waitFor(() => expect(tooltip()).toBeVisible());
}

function focusDot() {
  return document.querySelector('.ts-chart__focus-layer--default circle');
}

function outlinedBars() {
  return [...document.querySelectorAll('svg[role="img"] rect')].filter(
    (rect) => !['none', null].includes(rect.getAttribute('stroke')),
  );
}

function tooltip() {
  const element = document.querySelector('.ts-chart-tooltip');
  if (!(element instanceof HTMLElement)) throw new Error('No tooltip');
  return element;
}

// A line point's ring takes the page's colors, so it holds 3:1 on any
// series color, and marks focus in place of an outline around the chart.
export const LineRing: Story = {
  play: async ({ canvas }) => {
    await focusChart();
    const chart = canvas.getByRole('img');
    await expect(chart).toHaveFocus();
    await expect(chart.matches(':focus-visible')).toBe(true);
    await expect(getComputedStyle(chart).outlineStyle).toBe('none');
    const dot = focusDot();
    if (!dot) throw new Error('No focus dot');
    const { fill, stroke } = getComputedStyle(dot);
    await expect(
      contrast(stroke, getComputedStyle(document.body).backgroundColor),
    ).toBeGreaterThanOrEqual(3);
    await expect(fill).toBe(computedColor('var(--color-background)'));
  },
};

// A bar takes an outline in place of the dot, for keyboard focus and hover.
export const BarOutline: Story = {
  args: { children: <ChartPlot definition={visitorsBars()} /> },
  play: async ({ canvas }) => {
    await focusChart();
    await expect(focusDot()).toBeNull();
    await expect(outlinedBars()).toHaveLength(1);
    const [bar] = outlinedBars();
    if (!bar) throw new Error('No outline');
    await expect(
      contrast(
        getComputedStyle(bar).stroke,
        getComputedStyle(document.body).backgroundColor,
      ),
    ).toBeGreaterThanOrEqual(3);
    canvas.getByRole('img').blur();
    await waitFor(() => expect(outlinedBars()).toHaveLength(0));
    const lastBar = [...document.querySelectorAll('svg[role="img"] rect')].at(
      -1,
    );
    if (!lastBar) throw new Error('No bars');
    await hoverReal(lastBar);
    await waitFor(() => expect(outlinedBars()).toHaveLength(1));
  },
};

// Escape hides an open tooltip, which TanStack leaves up unless pinned, and
// the next arrow brings it back.
export const EscapeHides: Story = {
  play: async () => {
    await focusChart();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(tooltip()).not.toBeVisible());
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(tooltip()).toBeVisible());
    await expect(tooltip()).toHaveTextContent('February');
  },
};

// The tooltip's spoken text names series from the config, in the app's
// locale, as the tooltip shows them.
export const SpokenText: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    await focusChart();
    await expect(tooltip()).toHaveAttribute('role', 'status');
    await expect(tooltip().getAttribute('aria-label')).toBe(
      'January\nDesktop: ١٨٦\nMobile: ٨٠',
    );
  },
};

// Without a tooltip, the chart announces the focused points itself.
export const AnnouncedWithoutTooltip: Story = {
  args: { children: <ChartPlot definition={silentVisitorsChart} /> },
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        /February\s+Desktop: 305\s+Mobile: 200/u,
      ),
    );
    await expect(document.querySelector('.ts-chart-tooltip')).toBeNull();
  },
};

// The tooltip sits beside the focused mark, never over it.
export const TooltipClear: Story = {
  args: { children: <ChartPlot definition={visitorsBars()} /> },
  play: async () => {
    await focusChart();
    for (let index = 0; index < 12; index++) {
      const [bar] = outlinedBars();
      if (!bar) throw new Error('No outline');
      const a = tooltip().getBoundingClientRect();
      const b = bar.getBoundingClientRect();
      const overlap =
        Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
        Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      await expect(overlap).toBe(0);
      await userEvent.keyboard('{ArrowRight}');
    }
  },
};

// Hiding the focused point's series leaves no focus on it: focus comes back
// to the first point still drawn, with only the shown series spoken.
export const FocusAfterHide: Story = {
  play: async ({ canvas }) => {
    await focusChart();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await waitFor(() => expect(tooltip()).toHaveTextContent('March'));
    await userEvent.click(canvas.getByRole('button', { name: 'Desktop' }));
    canvas.getByRole('img').focus();
    await waitFor(() =>
      expect(tooltip().getAttribute('aria-label')).toBe('January\nMobile: 80'),
    );
    await expect(outlinedBars()).toHaveLength(1);
  },
  render: () => <HideableBars />,
};

// A redraw while the chart has focus restores it, outline and all.
export const OutlineAfterRedraw: Story = {
  args: { children: <RedrawnBars /> },
  play: async () => {
    await focusChart();
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(outlinedBars()).toHaveLength(1));
    const renders = redrawn.renders;
    redrawn.draw?.();
    await waitFor(() => expect(redrawn.renders).toBeGreaterThan(renders));
    await expect(tooltip()).toHaveTextContent('February');
    await expect(outlinedBars()).toHaveLength(1);
  },
};

// SVG strokes keep their colors in forced colors, so the marker takes
// system colors there and shows on the page color.
export const ForcedColors: Story = {
  args: { children: <ChartPlot definition={visitorsBars()} /> },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    await focusChart();
    const [bar] = outlinedBars();
    if (!bar) throw new Error('No outline');
    await expect(getComputedStyle(bar).stroke).toBe(
      computedColor('CanvasText'),
    );
  },
  tags: ['forced-colors'],
};
