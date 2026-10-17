import {
  CalendarDate,
  CalendarDateTime,
  type Time,
} from '@internationalized/date';
import { expect, test } from 'vitest';

import type {
  DateFieldGroupProps,
  DateFieldProps,
} from '#/components/ui/inputs/date-field';
import type { TimeFieldProps } from '#/components/ui/inputs/time-field';

const day = new CalendarDate(2026, 3, 14);
const dayAndTime = new CalendarDateTime(2026, 3, 14, 9, 30);

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('children and the layout props are exclusive', () => {
  const valid: (DateFieldProps | TimeFieldProps)[] = [
    {},
    { label: 'Due', size: 'sm', start: 'Due' },
    { children: 'Custom' },
  ];
  const mixed: (DateFieldProps | TimeFieldProps)[] = [
    // @ts-expect-error children replace the layout
    { children: 'Custom', label: 'Due' },
    // @ts-expect-error children replace the layout
    { children: 'Custom', start: 'Due' },
  ];
  // @ts-expect-error empty children would render no input
  const empty: DateFieldProps = { children: null };
  // @ts-expect-error an empty group draws a border around nothing
  const group: DateFieldGroupProps = { children: null };
  expect([...valid, ...mixed, empty, group]).toHaveLength(7);
});

// React Aria throws at render when the granularity is finer than the value.
test('granularity follows the value', () => {
  const valid: (
    | DateFieldProps<CalendarDate>
    | DateFieldProps<CalendarDateTime>
  )[] = [
    { granularity: 'day', value: day },
    { granularity: 'minute', value: dayAndTime },
    // With no value to read, any granularity renders.
    { granularity: 'hour' } satisfies DateFieldProps,
  ];
  const tooFine: DateFieldProps<CalendarDate> = {
    // @ts-expect-error a CalendarDate has no hour
    granularity: 'hour',
    value: day,
  };
  expect([...valid, tooFine]).toHaveLength(4);
});

test('values match the field', () => {
  // @ts-expect-error a CalendarDateTime isn't a CalendarDate
  const mixed: DateFieldProps<CalendarDate> = { value: dayAndTime };
  // @ts-expect-error a TimeField holds no date
  const date: TimeFieldProps<Time> = { value: day };
  // @ts-expect-error a TimeField has no day segment
  const coarse: TimeFieldProps = { granularity: 'day' };
  expect([mixed, date, coarse]).toHaveLength(3);
});
