import { type ComponentType, createContext, type ReactNode, use } from 'react';

import type { ChartHighlighter } from '#/lib/chart-series';

// Each key names a series or category; an entry with a color is a series.
export type ChartConfig = Record<
  string,
  { color?: string; icon?: ComponentType; label?: ReactNode }
>;

export type ChartContextValue = {
  config: ChartConfig;
  description: string;
  highlighter: ChartHighlighter;
  title: string;
};

export const ChartContext = createContext<ChartContextValue | null>(null);

export function useChart() {
  const context = use(ChartContext);
  if (!context) {
    throw new Error('Chart parts must be used within a ChartContainer');
  }
  return context;
}
