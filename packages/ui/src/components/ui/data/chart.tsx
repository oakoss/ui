import type { ChartValue } from '@tanstack/charts';

import {
  Chart as ChartPrimitive,
  type ChartProps as ChartPrimitiveProps,
  type ChartTooltipBodyRenderContext,
} from '@tanstack/charts/react/tooltip';
import { type ComponentProps, useId, useMemo } from 'react';

import { ChartTooltipContent } from '#/components/ui/data/chart-tooltip-content';
import { type ChartConfig, ChartContext, useChart } from '#/hooks/use-chart';
import { createChartHighlighter } from '#/lib/chart-series';
import { cn } from '#/lib/cx';

export type ChartContainerProps = {
  config: ChartConfig;
  description: string;
  title: string;
} & Omit<
  ComponentProps<'figure'>,
  'aria-describedby' | 'aria-label' | 'aria-labelledby' | 'title'
>;

export type ChartPlotProps<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
> = Omit<
  ChartPrimitiveProps<TDatum, TXValue, TYValue>,
  'ariaDescription' | 'ariaLabel' | 'style'
>;

// The figure: its visible caption names and describes the chart, and its
// parts read the config and caption from context.
export function ChartContainer({
  children,
  className,
  config,
  description,
  title,
  ...props
}: ChartContainerProps) {
  const id = useId();
  const highlighter = useMemo(() => createChartHighlighter(), []);
  const value = useMemo(
    () => ({ config, description, highlighter, title }),
    [config, description, highlighter, title],
  );
  return (
    <ChartContext value={value}>
      <figure
        {...props}
        aria-describedby={`${id}-description`}
        aria-labelledby={`${id}-title`}
        className={cn('flex flex-col gap-4', className)}
        data-slot="chart"
      >
        <figcaption className="grid gap-1" data-slot="chart-caption">
          <span
            className="text-sm font-medium"
            data-slot="chart-title"
            id={`${id}-title`}
          >
            {title}
          </span>
          <span
            className="text-sm text-muted-foreground"
            data-slot="chart-description"
            id={`${id}-description`}
          >
            {description}
          </span>
        </figcaption>
        {children}
      </figure>
    </ChartContext>
  );
}

// TanStack's chart, named and described by the container's caption.
export function ChartPlot<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>({
  aspectRatio = 16 / 9,
  className,
  definition,
  renderTooltipBody = defaultTooltipBody,
  ...props
}: ChartPlotProps<TDatum, TXValue, TYValue>) {
  const { description, highlighter, title } = useChart();
  // The legend highlights a series through this control. Spread as
  // defineChart(definition, options) does, whose overloads can't take a
  // definition that may be static or responsive.
  const highlightable = useMemo(
    () => ({
      ...definition,
      controls: [...(definition.controls ?? []), highlighter.control],
    }),
    [definition, highlighter],
  );
  return (
    <ChartPrimitive
      {...props}
      ariaDescription={description}
      ariaLabel={title}
      aspectRatio={aspectRatio}
      className={cn(
        'text-xs text-muted-foreground [--ts-chart-1:var(--color-chart-1)] [--ts-chart-2:var(--color-chart-2)] [--ts-chart-3:var(--color-chart-3)] [--ts-chart-4:var(--color-chart-4)] [--ts-chart-5:var(--color-chart-5)]',
        className,
      )}
      definition={highlightable}
      renderTooltipBody={renderTooltipBody}
    />
  );
}

function defaultTooltipBody<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>(context: ChartTooltipBodyRenderContext<TDatum, TXValue, TYValue>) {
  return <ChartTooltipContent points={context.points} />;
}
