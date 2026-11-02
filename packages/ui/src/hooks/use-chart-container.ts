import type { ChartScene } from '@tanstack/charts';

import { useCallback, useMemo, useState } from 'react';

import type { ChartConfig, ChartContextValue } from '#/hooks/use-chart';

import {
  type ChartFormatOptions,
  useChartFormatter,
  withTickPrecision,
} from '#/hooks/use-chart-formatter';
import { useStableValue } from '#/hooks/use-stable-value';
import { createChartHighlighter } from '#/lib/chart-series';

export type ChartContainerOptions = {
  config: ChartConfig;
  description: string;
  // Number and date options for the ticks, tooltip and table.
  format?: ChartFormatOptions;
  title: string;
} & ChartHiddenSeriesOptions;

// The hidden series: the container holds them, starting from
// `defaultHiddenSeries`, unless `hiddenSeries` and `onHiddenSeriesChange`
// control them together.
export type ChartHiddenSeriesOptions =
  | {
      defaultHiddenSeries?: ChartSeriesKeys;
      hiddenSeries?: never;
      onHiddenSeriesChange?: (hidden: Set<string>) => void;
    }
  | {
      defaultHiddenSeries?: never;
      hiddenSeries: ChartSeriesKeys;
      onHiddenSeriesChange: (hidden: Set<string>) => void;
    };

// Not a plain string, which would iterate as its characters.
export type ChartSeriesKeys = ReadonlySet<string> | readonly string[];

export function useChartContainer<TProps extends ChartContainerOptions>({
  config,
  defaultHiddenSeries,
  description,
  format: formatOptions,
  hiddenSeries,
  onHiddenSeriesChange,
  title,
  ...figureProps
}: TProps) {
  const highlighter = useMemo(() => createChartHighlighter(), []);
  const format = useChartFormatter(formatOptions);
  const tickFormat = useChartFormatter({
    ...formatOptions,
    number: withTickPrecision(formatOptions?.number),
  });
  const [hidden, setHidden] = useHiddenSeries({
    defaultHiddenSeries,
    hiddenSeries,
    onHiddenSeriesChange,
  });
  const [scenes, setScene] = useScenes();
  const value = useMemo<ChartContextValue>(
    () => ({
      config,
      description,
      format,
      hidden,
      highlighter,
      scenes,
      setHidden,
      setScene,
      tickFormat,
      title,
    }),
    [
      config,
      description,
      format,
      hidden,
      highlighter,
      scenes,
      setHidden,
      setScene,
      tickFormat,
      title,
    ],
  );
  return { figureProps, value };
}

// Code-unit order, not the locale's, so two strings a collator ranks equal
// can't reorder the key.
function setKey(members: ReadonlySet<string>): string {
  return JSON.stringify(
    [...members].toSorted((a, b) => Number(a > b) - Number(a < b)),
  );
}

function useHiddenSeries({
  defaultHiddenSeries,
  hiddenSeries,
  onHiddenSeriesChange,
}: {
  defaultHiddenSeries?: ChartSeriesKeys;
  hiddenSeries?: ChartSeriesKeys;
  onHiddenSeriesChange?: (hidden: Set<string>) => void;
}) {
  const [own, setOwn] = useState(() => new Set(defaultHiddenSeries));
  const hidden = useStableSet(hiddenSeries ?? own);
  const setHidden = useCallback(
    (next: ReadonlySet<string>) => {
      if (hiddenSeries === undefined) setOwn(new Set(next));
      onHiddenSeriesChange?.(new Set(next));
    },
    [hiddenSeries, onHiddenSeriesChange],
  );
  return [hidden, setHidden] as const;
}

function useScenes() {
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
  return [scenes, setScene] as const;
}

// The same set while its members don't change, so plots rebuild their
// definitions only when the hidden series do.
function useStableSet(values: ChartSeriesKeys): ReadonlySet<string> {
  return useStableValue(new Set(values), setKey);
}
