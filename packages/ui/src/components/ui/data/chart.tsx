import type { ChartScene, ChartValue } from '@tanstack/charts';

import {
  Chart as ChartPrimitive,
  type ChartProps as ChartPrimitiveProps,
  type ChartTooltipBodyRenderContext,
} from '@tanstack/charts/react/tooltip';
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useId,
  useMemo,
  useState,
} from 'react';

import {
  ChartPlotEmpty,
  type ChartPlotLabels,
  ChartPlotState,
  type ChartPlotStatus,
} from '#/components/ui/data/chart-plot-state';
import { ChartTooltipContent } from '#/components/ui/data/chart-tooltip-content';
import { type ChartConfig, ChartContext, useChart } from '#/hooks/use-chart';
import { useChartPlot } from '#/hooks/use-chart-plot';
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
> = {
  // Replaces the message or skeleton shown for the status.
  fallback?: ReactNode;
  status?: ChartPlotStatus;
} & ChartPlotLabels &
  Omit<
    ChartPrimitiveProps<TDatum, TXValue, TYValue>,
    'ariaDescription' | 'ariaLabel' | 'style'
  >;

const noneHidden: ReadonlySet<string> = new Set();

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
  const value = useChartContextValue(config, description, title);
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
  emptyLabel,
  errorLabel,
  fallback,
  height,
  loadingLabel,
  status,
  width,
  ...props
}: ChartPlotProps<TDatum, TXValue, TYValue>) {
  if (status) {
    return (
      <ChartPlotState
        aspectRatio={aspectRatio}
        className={cn(props.className)}
        emptyLabel={emptyLabel}
        errorLabel={errorLabel}
        fallback={fallback}
        height={height}
        loadingLabel={loadingLabel}
        status={status}
        width={width}
      />
    );
  }
  return (
    <ChartPlotSurface
      {...props}
      aspectRatio={aspectRatio}
      emptyLabel={emptyLabel}
      height={height}
      width={width}
    />
  );
}

// Speaks the focused points when the chart has no tooltip to.
function ChartPlotAnnouncement({
  announcement,
}: {
  announcement: null | string;
}) {
  if (announcement === null) return null;
  return (
    <div className="sr-only" role="status">
      {announcement}
    </div>
  );
}

function ChartPlotSurface<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>({
  className,
  definition,
  emptyLabel,
  hiddenLabel,
  onFocusGroupChange,
  onRender,
  renderTooltipBody = defaultTooltipBody,
  ...props
}: Omit<
  ChartPlotProps<TDatum, TXValue, TYValue>,
  'errorLabel' | 'fallback' | 'loadingLabel' | 'status'
>) {
  const { description, title } = useChart();
  const { announcement, chartProps, id, isTooltipDismissed, surfaceRef } =
    useChartPlot({ definition, onFocusGroupChange, onRender });
  return (
    <div
      // With no points there's no marker, so the chart keeps its outline.
      className="relative not-has-data-[slot=chart-empty]:[&_svg]:outline-none"
      data-slot="chart-plot"
      data-tooltip-dismissed={isTooltipDismissed || undefined}
      ref={surfaceRef}
    >
      <ChartPrimitive
        {...props}
        {...chartProps}
        ariaDescription={description}
        ariaLabel={title}
        className={cn(
          'text-xs text-muted-foreground [--chart-focus-fill:var(--color-background)] [--chart-focus:var(--color-foreground)] [--ts-chart-1:var(--color-chart-1)] [--ts-chart-2:var(--color-chart-2)] [--ts-chart-3:var(--color-chart-3)] [--ts-chart-4:var(--color-chart-4)] [--ts-chart-5:var(--color-chart-5)] [--ts-chart-6:var(--color-muted-foreground)] forced-colors:[--chart-focus-fill:Canvas] forced-colors:[--chart-focus:CanvasText] in-data-tooltip-dismissed:[&_.ts-chart-tooltip]:hidden',
          className,
        )}
        renderTooltipBody={renderTooltipBody}
      />
      <ChartPlotEmpty
        emptyLabel={emptyLabel}
        hiddenLabel={hiddenLabel}
        id={id}
      />
      <ChartPlotAnnouncement announcement={announcement} />
    </div>
  );
}

function defaultTooltipBody<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>(context: ChartTooltipBodyRenderContext<TDatum, TXValue, TYValue>) {
  return <ChartTooltipContent points={context.points} />;
}

function useChartContextValue(
  config: ChartConfig,
  description: string,
  title: string,
) {
  const highlighter = useMemo(() => createChartHighlighter(), []);
  const [hidden, setHidden] = useState(noneHidden);
  const [scenes, setScenes] = useState<ReadonlyMap<string, ChartScene>>(
    () => new Map(),
  );
  const setScene = useCallback((id: string, scene: ChartScene | null) => {
    setScenes((current) => {
      if ((current.get(id) ?? null) === scene) return current;
      const next = new Map(current);
      if (scene) next.set(id, scene);
      else next.delete(id);
      return next;
    });
  }, []);
  return useMemo(
    () => ({
      config,
      description,
      hidden,
      highlighter,
      scenes,
      setHidden,
      setScene,
      title,
    }),
    [config, description, hidden, highlighter, scenes, setScene, title],
  );
}
