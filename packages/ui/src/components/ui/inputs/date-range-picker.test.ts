import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { expect, test } from 'vitest';

import type { DateRangePickerProps } from '#/components/ui/inputs/date-range-picker';

const day = new CalendarDate(2026, 3, 14);
const dayAndTime = new CalendarDateTime(2026, 3, 14, 9, 30);

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('children and the layout props are exclusive', () => {
  const valid: DateRangePickerProps[] = [
    { endTimeLabel: 'Until', label: 'Stay', startTimeLabel: 'From' },
    { children: 'Custom' },
  ];
  // @ts-expect-error children replace the layout
  const mixed: DateRangePickerProps = {
    children: 'Custom',
    startTimeLabel: 'From',
  };
  // @ts-expect-error a range names its two times
  const single: DateRangePickerProps = { timeLabel: 'At' };
  expect([...valid, mixed, single]).toHaveLength(4);
});

// React Aria throws at render when the granularity is finer than the value.
test('granularity follows the value', () => {
  const valid: (
    | DateRangePickerProps<CalendarDate>
    | DateRangePickerProps<CalendarDateTime>
  )[] = [
    { granularity: 'day', value: { end: day, start: day } },
    { granularity: 'minute', value: { end: dayAndTime, start: dayAndTime } },
    { granularity: 'hour' } satisfies DateRangePickerProps,
  ];
  const tooFine: DateRangePickerProps<CalendarDate> = {
    // @ts-expect-error a CalendarDate has no hour
    granularity: 'hour',
    value: { end: day, start: day },
  };
  expect([...valid, tooFine]).toHaveLength(4);
});

// Both ends share one type, so one granularity fits both.
test('the ends share a type', () => {
  const mixed: DateRangePickerProps<CalendarDate> = {
    // @ts-expect-error a CalendarDateTime end in a CalendarDate range
    value: { end: dayAndTime, start: day },
  };
  expect(mixed).toBeDefined();
});
