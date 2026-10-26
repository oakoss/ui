import type {
  ChartColorOptions,
  ChartControl,
  ChartHostControlExtension,
  ChartKey,
  ChartScene,
} from '@tanstack/charts';

import { controlledSignal } from '@tanstack/charts/interaction/signal';
import {
  interactiveColorLegend,
  type InteractiveColorLegendChange,
} from '@tanstack/charts/legend';

import type { ChartConfig } from '#/hooks/use-chart';

export type ChartHighlighter = {
  control: ChartControl;
  highlight: (source: ChartHighlightSource, series: ChartKey | null) => void;
  // Clears a series from every source, for an item that goes away without
  // a blur or hover end.
  release: (series: ChartKey) => void;
};

export type ChartHighlightSource = 'keyboard' | 'pointer';

type ChartHighlightHost = {
  scene?: ChartScene;
  setStateFocus: Parameters<
    ChartHostControlExtension['create']
  >[0]['setStateFocus'];
};

// Dims every series but the one the legend highlights. Add it to each mark's
// `states`.
export const chartSeriesStates = [
  { style: { opacity: 0.25 }, when: { focus: 'unmatched', source: 'legend' } },
] as const;

// chartSeriesStates, and an outline on the focused bar in place of the focus
// ring's dot; set the definition's `focusRing: false` with it.
export const chartBarStates = [
  ...chartSeriesStates,
  {
    style: { stroke: 'var(--chart-focus)', strokeWidth: 3 },
    when: { focus: 'primary', source: ['keyboard', 'pointer', 'restored'] },
  },
] as const;

// TanStack's color scale for the config's series. Its legend draws nothing and
// removes hidden series after the scales resolve, so the axes keep their
// domain; TanStack hides only series a mark's `color` channel names.
export function chartColor(
  config: ChartConfig,
  hidden: Iterable<string> = [],
): ChartColorOptions {
  const keys = chartSeriesKeys(config);
  const hiddenKeys = new Set(hidden);
  const visible: readonly string[] = keys.filter((key) => !hiddenKeys.has(key));
  // Only the visibility test is borrowed; its buttons, which would propose
  // changes, never render.
  const { filterMark, seriesVisible } = interactiveColorLegend({
    visible: controlledSignal<
      readonly string[],
      InteractiveColorLegendChange<string>
    >(visible, () => {
      // ChartLegend owns changes.
    }),
  });
  return {
    domain: keys,
    legend: {
      filterMark,
      height: () => 0,
      render: () => ({ children: [], key: 'chart-series', kind: 'group' }),
      seriesVisible,
    },
    range: keys.map((key) => config[key]?.color ?? 'currentColor'),
  };
}

export function chartSeriesKeys(config: ChartConfig) {
  return Object.keys(config).filter((key) => config[key]?.color !== undefined);
}

// Dims through TanStack's inline-state focus, which leaves real focus and the
// tooltip alone. The pointer's series wins over the keyboard's, as in
// TanStack's own legend. A hidden series has no points, so it dims nothing.
export function createChartHighlighter(): ChartHighlighter {
  const active: Record<ChartHighlightSource, ChartKey | null> = {
    keyboard: null,
    pointer: null,
  };
  const hosts = new Set<ChartHighlightHost>();

  const paint = (host: ChartHighlightHost) => {
    paintSeries(host, active.pointer ?? active.keyboard);
  };

  const extension: ChartHostControlExtension = {
    create: ({ setStateFocus }) => {
      const host: ChartHighlightHost = { setStateFocus };
      hosts.add(host);
      return {
        destroy: () => {
          hosts.delete(host);
          setStateFocus(null);
        },
        update: (_control, scene) => {
          host.scene = scene;
          paint(host);
        },
      };
    },
    id: 'chart-highlight',
  };

  return {
    control: {
      id: 'chart-highlight',
      resolve: () => ({ controls: [{ extension, key: 'chart-highlight' }] }),
    },
    highlight: (source, series) => {
      active[source] = series;
      for (const host of hosts) paint(host);
    },
    release: (series) => {
      for (const source of ['keyboard', 'pointer'] as const) {
        if (Object.is(active[source], series)) active[source] = null;
      }
      for (const host of hosts) paint(host);
    },
  };
}

function paintSeries(host: ChartHighlightHost, series: ChartKey | null) {
  const group =
    series === null
      ? []
      : (host.scene?.points.filter((point) => Object.is(point.group, series)) ??
        []);
  const [primary] = group;
  host.setStateFocus(
    primary ? { group, pinned: false, primary, source: 'legend' } : null,
  );
}
