import type {
  ChartControl,
  ChartFocusRingOptions,
  ChartTooltipOptions,
  ChartValue,
  DomChartDefinition,
} from '@tanstack/charts';

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
  control: ChartControl,
  content: NonNullable<ChartTooltipOptions['content']>,
): DomChartDefinition<TDatum, TXValue, TYValue> {
  return {
    ...definition,
    controls: [...(definition.controls ?? []), control],
    focusRing: definition.focusRing ?? chartFocusRing,
    tooltip: withTooltipContent(definition.tooltip, content),
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
