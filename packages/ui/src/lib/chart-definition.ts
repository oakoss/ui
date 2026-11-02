import type {
  ChartColorOptions,
  ChartControl,
  ChartFocusRingOptions,
  ChartPositionScaleOptions,
  ChartTooltipOptions,
  ChartValue,
  DomChartDefinition,
} from '@tanstack/charts';

import { chartSeriesStates } from '#/lib/chart-series';

export type ChartDefaults = {
  color?: ChartColorOptions;
  content: NonNullable<ChartTooltipOptions['content']>;
  control: ChartControl;
  // Formats a numeric axis's ticks when it sets no `format`.
  tickFormat: (value: number) => string;
};

// What a responsive definition's `chart` returns, and the part of a static one
// the defaults fill.
type ChartSpec = ReturnType<
  Extract<DomChartDefinition, { chart: unknown }>['chart']
>;

type ChartSpecMark = ChartSpec['marks'][number];

// A ring in the page's own colors shows on any series color. ChartPlot sets
// both variables, to system colors in forced colors.
export const chartFocusRing: ChartFocusRingOptions = {
  fill: 'var(--chart-focus-fill)',
  radius: 5,
  stroke: 'var(--chart-focus)',
  strokeWidth: 2,
};

// Adds ChartPlot's control and defaults, keeping what the definition sets.
// Spread as defineChart(definition, options) does, whose overloads can't take
// a definition that may be static or responsive.
export function withChartDefaults<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>(
  definition: DomChartDefinition<TDatum, TXValue, TYValue>,
  defaults: ChartDefaults,
): DomChartDefinition<TDatum, TXValue, TYValue> {
  const options = {
    controls: [...(definition.controls ?? []), defaults.control],
    focusRing: definition.focusRing ?? chartFocusRing,
    tooltip: withTooltipContent(definition.tooltip, defaults.content),
  };
  if ('chart' in definition) {
    const { chart } = definition;
    return {
      ...definition,
      ...options,
      chart: (context) => withSpecDefaults(chart(context), defaults),
    };
  }
  return {
    ...definition,
    ...withSpecDefaults(definition, defaults),
    ...options,
  };
}

// The tooltip with the given content, unless it has none or already sets its
// own text.
export function withTooltipContent<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>(
  tooltip: DomChartDefinition<TDatum, TXValue, TYValue>['tooltip'],
  content: NonNullable<ChartTooltipOptions['content']>,
): DomChartDefinition<TDatum, TXValue, TYValue>['tooltip'] {
  if (tooltip === undefined || tooltip === false) return tooltip;
  if (!('use' in tooltip)) return { content, use: tooltip };
  const { content: own, format, formatGroup, items } = tooltip;
  if (own || format || formatGroup || items) return tooltip;
  return { ...tooltip, content };
}

function isNumericScale(scale: ChartPositionScaleOptions['scale']) {
  // A D3 scale is a function with `copy`; a factory builds one with its default
  // domain: numbers for a continuous numeric scale, dates for a time scale and
  // none for a band. A TanStack scale object isn't probed.
  if (typeof scale !== 'function') return false;
  const probe: unknown =
    'copy' in scale ? scale : Reflect.apply(scale, undefined, []);
  if (typeof probe !== 'function' || !('domain' in probe)) return false;
  const { domain } = probe;
  if (typeof domain !== 'function') return false;
  const values: unknown = domain.call(probe);
  return Array.isArray(values) && typeof values[0] === 'number';
}

// A mark whose series comes from its `color` channel, and sets no states of
// its own, dims with the legend's highlight. TanStack reads a state's `data`
// only to call its functions, and chartSeriesStates has none.
function withSeriesStates(mark: ChartSpecMark): ChartSpecMark {
  return {
    ...mark,
    initialize: (context) => {
      const initialized = mark.initialize(context);
      if (
        initialized.seriesFromColor !== true ||
        initialized.states !== undefined
      ) {
        return initialized;
      }
      return {
        ...initialized,
        states: { data: [], definitions: chartSeriesStates },
      };
    },
  };
}

function withSpecDefaults(spec: ChartSpec, defaults: ChartDefaults): ChartSpec {
  return {
    ...spec,
    color: spec.color ?? defaults.color,
    marks: spec.marks.map((mark) => withSeriesStates(mark)),
    scales: Object.fromEntries(
      Object.entries(spec.scales).map(([key, scale]) => [
        key,
        withTickFormat(scale, defaults.tickFormat),
      ]),
    ),
  };
}

function withTickFormat(
  options: ChartPositionScaleOptions | null,
  format: (value: number) => string,
): ChartPositionScaleOptions | null {
  if (!options || options.axis === false) return options;
  const { ticks } = options.axis ?? {};
  if (ticks === false || ticks?.format || !isNumericScale(options.scale)) {
    return options;
  }
  return { ...options, axis: { ...options.axis, ticks: { ...ticks, format } } };
}
