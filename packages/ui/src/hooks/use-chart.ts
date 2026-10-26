import type { ChartScene } from '@tanstack/charts';

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
  // The series the legend hides.
  hidden: ReadonlySet<string>;
  highlighter: ChartHighlighter;
  // Each plot's last drawn scene, by plot id, in the order they first drew.
  scenes: ReadonlyMap<string, ChartScene>;
  setHidden: (hidden: ReadonlySet<string>) => void;
  setScene: (id: string, scene: ChartScene | null) => void;
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
