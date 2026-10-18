import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { expect, test } from 'vitest';

import type { DatePickerProps } from '#/components/ui/inputs/date-picker';

const day = new CalendarDate(2026, 3, 14);
const dayAndTime = new CalendarDateTime(2026, 3, 14, 9, 30);

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('children and the layout props are exclusive', () => {
  const valid: DatePickerProps[] = [
    { label: 'Due', timeLabel: 'At' },
    { children: 'Custom' },
  ];
  // @ts-expect-error children replace the layout
  const mixed: DatePickerProps = { children: 'Custom', timeLabel: 'At' };
  expect([...valid, mixed]).toHaveLength(3);
});

// React Aria throws at render when the granularity is finer than the value.
test('granularity follows the value', () => {
  const valid: (
    | DatePickerProps<CalendarDate>
    | DatePickerProps<CalendarDateTime>
  )[] = [
    { granularity: 'day', value: day },
    { granularity: 'minute', value: dayAndTime },
    { granularity: 'hour' } satisfies DatePickerProps,
  ];
  const tooFine: DatePickerProps<CalendarDate> = {
    // @ts-expect-error a CalendarDate has no hour
    granularity: 'hour',
    value: day,
  };
  expect([...valid, tooFine]).toHaveLength(4);
});
