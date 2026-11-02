import type { ChartValue } from '@tanstack/charts';

import { useCallback, useState } from 'react';
import { useDateFormatter, useNumberFormatter } from 'react-aria';

export type ChartFormatOptions = {
  date?: Intl.DateTimeFormatOptions;
  number?: Intl.NumberFormatOptions;
};

export type ChartFormatter = (value: ChartValue) => string;

const defaultNumber: Intl.NumberFormatOptions = {};
const defaultDate: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeZone: 'UTC',
};

// Formats a chart value in the app's locale. Dates format in UTC, matching
// TanStack's UTC time scales. The function changes only with the locale or
// the options' values, so options can be written inline.
export function useChartFormatter(
  options: ChartFormatOptions = {},
): ChartFormatter {
  const numberFormatter = useNumberFormatter(
    useStableValue(options.number ?? defaultNumber),
  );
  const dateFormatter = useDateFormatter(
    useStableValue(options.date ?? defaultDate),
  );
  return useCallback(
    (value: ChartValue) => {
      if (typeof value === 'number') return numberFormatter.format(value);
      if (value instanceof Date) return dateFormatter.format(value);
      return value;
    },
    [dateFormatter, numberFormatter],
  );
}

// Ticks keep every decimal their values have, since Intl's default of three
// would print an axis from 0.00001 to 0.00003 as a row of zeros. Options that
// cap the digits themselves are kept.
export function withTickPrecision(
  options: Intl.NumberFormatOptions = {},
): Intl.NumberFormatOptions {
  if (
    options.maximumFractionDigits !== undefined ||
    options.maximumSignificantDigits !== undefined
  ) {
    return options;
  }
  return { ...options, maximumFractionDigits: 20 };
}

// The first of a run of equal values, so an inline options object keeps the
// formatter React Aria memoized for it.
function useStableValue<T>(value: T): T {
  const key = JSON.stringify(value);
  const [stable, setStable] = useState({ key, value });
  if (stable.key !== key) setStable({ key, value });
  return stable.key === key ? stable.value : value;
}
