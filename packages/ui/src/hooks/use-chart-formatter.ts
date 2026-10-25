import type { ChartValue } from '@tanstack/charts';

import { useCallback } from 'react';
import { useDateFormatter, useNumberFormatter } from 'react-aria';

const defaultNumber: Intl.NumberFormatOptions = {};
const defaultDate: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeZone: 'UTC',
};

// Formats a chart value in the app's locale. Dates format in UTC, matching
// TanStack's UTC time scales. The function changes only with the locale or
// the options object, so a chart definition can depend on it; keep options
// outside the component or memoized.
export function useChartFormatter(
  options: {
    date?: Intl.DateTimeFormatOptions;
    number?: Intl.NumberFormatOptions;
  } = {},
) {
  const numberFormatter = useNumberFormatter(options.number ?? defaultNumber);
  const dateFormatter = useDateFormatter(options.date ?? defaultDate);
  return useCallback(
    (value: ChartValue) => {
      if (typeof value === 'number') return numberFormatter.format(value);
      if (value instanceof Date) return dateFormatter.format(value);
      return value;
    },
    [dateFormatter, numberFormatter],
  );
}
