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
  const { tooltip } = definition;
  return {
    ...definition,
    controls: [...(definition.controls ?? []), control],
    focusRing: definition.focusRing ?? chartFocusRing,
    tooltip:
      tooltip === undefined || tooltip === false
        ? tooltip
        : 'use' in tooltip
          ? tooltip.content ||
            tooltip.format ||
            tooltip.formatGroup ||
            tooltip.items
            ? tooltip
            : { ...tooltip, content }
          : { content, use: tooltip },
  };
}
