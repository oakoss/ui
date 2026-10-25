import { type ComponentType, createContext, type ReactNode, use } from 'react';

export type ChartConfig = Record<
  string,
  { color?: string; icon?: ComponentType; label?: ReactNode }
>;

export type ChartContextValue = {
  config: ChartConfig;
  description: string;
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
