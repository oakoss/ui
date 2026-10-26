import type { CSSProperties, ReactNode } from 'react';

import { Alert, AlertTitle } from '#/components/ui/feedback/alert';
import { Skeleton } from '#/components/ui/feedback/skeleton';
import { useChart } from '#/hooks/use-chart';
import { chartSeriesKeys } from '#/lib/chart-series';
import { cn } from '#/lib/cx';

export type ChartPlotLabels = {
  emptyLabel?: string;
  errorLabel?: string;
  // Shown when the legend hides every series.
  hiddenLabel?: string;
  loadingLabel?: string;
};

export type ChartPlotStatus = 'empty' | 'error' | 'loading';

type ChartPlotEmptyProps = { id: string } & Pick<
  ChartPlotLabels,
  'emptyLabel' | 'hiddenLabel'
>;

type ChartPlotStateProps = {
  aspectRatio: number;
  className?: string;
  fallback?: ReactNode;
  height?: number;
  status: ChartPlotStatus;
  width?: number;
} & Pick<ChartPlotLabels, 'emptyLabel' | 'errorLabel' | 'loadingLabel'>;

type ChartPlotStateStyle = CSSProperties &
  Record<'--chart-aspect' | '--chart-height' | '--chart-width', string>;

const emptyText = 'text-center text-sm text-muted-foreground';

// Over the drawn axes when the plot has no points.
export function ChartPlotEmpty({
  emptyLabel = 'No data',
  hiddenLabel = 'All series are hidden',
  id,
}: ChartPlotEmptyProps) {
  const { config, hidden, scenes } = useChart();
  const scene = scenes.get(id);
  if (!scene || scene.points.length > 0) return null;
  const series = chartSeriesKeys(config);
  const isAllHidden =
    series.length > 0 && series.every((key) => hidden.has(key));
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 grid place-items-center p-4',
        emptyText,
      )}
      data-slot="chart-empty"
    >
      {isAllHidden ? hiddenLabel : emptyLabel}
    </div>
  );
}

// Stands in for the plot at its size, so the layout holds when data comes.
export function ChartPlotState({
  aspectRatio,
  className,
  emptyLabel = 'No data',
  errorLabel = 'The chart couldn’t load',
  fallback,
  height,
  loadingLabel = 'Loading chart',
  status,
  width,
}: ChartPlotStateProps) {
  // Sized as TanStack sizes the plot: full width, and the aspect ratio unless
  // a height is given.
  const style: ChartPlotStateStyle = {
    '--chart-aspect': String(aspectRatio),
    '--chart-height': height === undefined ? 'auto' : `${height}px`,
    '--chart-width': width === undefined ? '100%' : `${width}px`,
  };
  return (
    <div
      aria-busy={status === 'loading' || undefined}
      className={cn(
        'grid aspect-(--chart-aspect) h-(--chart-height) w-(--chart-width) place-items-center',
        className,
      )}
      data-slot="chart-plot"
      data-status={status}
      style={style}
    >
      {fallback ?? (
        <ChartPlotStateContent
          emptyLabel={emptyLabel}
          errorLabel={errorLabel}
          loadingLabel={loadingLabel}
          status={status}
        />
      )}
    </div>
  );
}

function ChartPlotStateContent({
  emptyLabel,
  errorLabel,
  loadingLabel,
  status,
}: { status: ChartPlotStatus } & Required<
  Pick<ChartPlotLabels, 'emptyLabel' | 'errorLabel' | 'loadingLabel'>
>) {
  if (status === 'empty') return <p className={cn(emptyText)}>{emptyLabel}</p>;
  if (status === 'error') {
    return (
      <Alert className="max-w-sm" intent="destructive" role="alert">
        <AlertTitle>{errorLabel}</AlertTitle>
      </Alert>
    );
  }
  return (
    <>
      <Skeleton className="col-start-1 row-start-1 size-full" />
      <span className="sr-only">{loadingLabel}</span>
    </>
  );
}
