import type { ChartValue } from '@tanstack/charts';

import { useCallback } from 'react';
import { useDateFormatter, useNumberFormatter } from 'react-aria';

import { useStableValue } from '#/hooks/use-stable-value';

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
  const number = options.number ?? defaultNumber;
  const date = options.date ?? defaultDate;
  const numberFormatter = useNumberFormatter(
    useStableValue(number, optionsKey),
  );
  const dateFormatter = useDateFormatter(useStableValue(date, optionsKey));
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

// Intl options hold only strings, numbers and booleans, so JSON keys them.
function optionsKey(
  options: Intl.DateTimeFormatOptions | Intl.NumberFormatOptions,
): string {
  return JSON.stringify(options);
}
