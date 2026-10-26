import type {
  ChartPoint,
  ChartRenderContext,
  ChartValue,
  DomChartDefinition,
} from '@tanstack/charts';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useChart } from '#/hooks/use-chart';
import { useChartFormatter } from '#/hooks/use-chart-formatter';
import { withChartDefaults } from '#/lib/chart-definition';
import { chartTooltipText } from '#/lib/chart-tooltip';

type ChartPlotOptions<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
> = {
  definition: DomChartDefinition<TDatum, TXValue, TYValue>;
  onFocusGroupChange?: (
    points: readonly ChartPoint<TDatum, TXValue, TYValue>[],
  ) => void;
  onRender?: (context: ChartRenderContext<TDatum, TXValue, TYValue>) => void;
};

// ChartPlot's wiring: the definition with its defaults, the scene the
// container's table and empty state read, and the announcement a chart
// without a tooltip makes.
export function useChartPlot<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>({
  definition,
  onFocusGroupChange,
  onRender,
}: ChartPlotOptions<TDatum, TXValue, TYValue>) {
  const { config, highlighter, setScene } = useChart();
  const id = useId();
  const format = useChartFormatter();
  const describe = useCallback(
    (points: readonly ChartPoint[]) => chartTooltipText(points, config, format),
    [config, format],
  );
  const plotted = useMemo(
    () => withChartDefaults(definition, highlighter.control, describe),
    [definition, describe, highlighter],
  );
  const isTooltip =
    definition.tooltip !== undefined && definition.tooltip !== false;
  const [announcement, setAnnouncement] = useState('');
  const [isTooltipDismissed, setIsTooltipDismissed] = useState(false);
  const surfaceRef = useEscapeDismiss(setIsTooltipDismissed);
  useEffect(() => () => setScene(id, null), [id, setScene]);

  return {
    announcement: isTooltip ? null : announcement,
    chartProps: {
      definition: plotted,
      onFocusGroupChange: (
        points: readonly ChartPoint<TDatum, TXValue, TYValue>[],
      ) => {
        setIsTooltipDismissed(false);
        if (!isTooltip) setAnnouncement(announce(describe(points)));
        onFocusGroupChange?.(points);
      },
      onRender: (context: ChartRenderContext<TDatum, TXValue, TYValue>) => {
        setScene(id, context.scene);
        onRender?.(context);
      },
    },
    id,
    isTooltipDismissed,
    surfaceRef,
  };
}

function announce({ rows, title }: ReturnType<typeof chartTooltipText>) {
  return [title, ...rows.map(({ label, value }) => `${label}: ${value}`)]
    .filter(Boolean)
    .join('\n');
}

// TanStack's Escape closes only a pinned tooltip (TanStack/charts#189), so
// Escape on the chart hides an open one until focus moves.
function useEscapeDismiss(setIsDismissed: (isDismissed: boolean) => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        setIsDismissed(true);
      }
    };
    element?.addEventListener('keydown', dismiss);
    return () => element?.removeEventListener('keydown', dismiss);
  }, [setIsDismissed]);
  return ref;
}
