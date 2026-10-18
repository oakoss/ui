import { use } from 'react';
import {
  DateRangePicker as AriaDateRangePicker,
  type DateRangePickerProps as AriaDateRangePickerProps,
  DateRangePickerStateContext,
  type DateValue,
} from 'react-aria-components';

import type { Shortcut } from '#/components/ui/inputs/field';

import { RangeCalendar } from '#/components/ui/inputs/calendar';
import {
  DateInput,
  type GranularityOf,
} from '#/components/ui/inputs/date-field';
import {
  DatePickerContent,
  DatePickerGroup,
  type DatePickerLayoutProps,
} from '#/components/ui/inputs/date-picker';
import { useFieldShortcut } from '#/components/ui/inputs/input-group';
import { TimeField } from '#/components/ui/inputs/time-field';
import { cn, cx } from '#/lib/cx';

export type DateRangePickerLayoutProps = {
  // Name the time fields the popover adds when granularity includes a time.
  endTimeLabel?: string;
  startTimeLabel?: string;
} & Omit<DatePickerLayoutProps, 'timeLabel'>;

export type DateRangePickerProps<T extends DateValue = DateValue> = {
  granularity?: GranularityOf<T>;
} & Omit<AriaDateRangePickerProps<T>, 'children' | 'granularity'> &
  Shortcut<DateRangePickerLayoutProps>;

// The start and end inputs scroll together, so a long locale keeps both in
// one line. React Aria names their segments "Start Date" and "End Date".
export function DateRangeInput({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-1 [scrollbar-width:none] items-center self-stretch overflow-x-auto px-control-x',
        className,
      )}
      data-slot="date-range-input"
    >
      <DateInput className="flex-none overflow-visible px-0" slot="start" />
      <span aria-hidden className="px-1 text-muted-foreground">
        –
      </span>
      <DateInput className="flex-none overflow-visible px-0" slot="end" />
    </div>
  );
}

export function DateRangePicker<T extends DateValue = DateValue>({
  calendarProps,
  children,
  className,
  description,
  end,
  endTimeLabel = 'End time',
  errorMessage,
  errors,
  label,
  size,
  start,
  startTimeLabel = 'Start time',
  ...props
}: DateRangePickerProps<T>) {
  const { decorations, fieldProps, layout } = useFieldShortcut(
    { description, end, errorMessage, errors, label, start },
    props,
  );
  return (
    <AriaDateRangePicker<T>
      {...fieldProps}
      className={cx('flex flex-col gap-2', className)}
      data-slot="date-range-picker"
    >
      {children ??
        (({ isDisabled, isReadOnly, isRequired }) =>
          layout(
            <>
              <DatePickerGroup size={size} {...decorations}>
                <DateRangeInput />
              </DatePickerGroup>
              <DatePickerContent>
                <RangeCalendar {...calendarProps} />
                <DateRangePickerTime
                  endLabel={endTimeLabel}
                  hideTimeZone={props.hideTimeZone}
                  hourCycle={props.hourCycle}
                  isDisabled={isDisabled}
                  isReadOnly={isReadOnly}
                  placeholderValue={props.placeholderValue}
                  startLabel={startTimeLabel}
                />
              </DatePickerContent>
            </>,
          )({ isRequired }))}
    </AriaDateRangePicker>
  );
}

// The start and end times of a date and time range, for the popover. They
// render only when the picker's granularity includes a time. A cleared time
// leaves the range's as it was, since a date and time value always has one.
export function DateRangePickerTime({
  endLabel,
  placeholderValue,
  startLabel,
  ...props
}: { endLabel: string; startLabel: string } & Pick<
  AriaDateRangePickerProps<DateValue>,
  | 'hideTimeZone'
  | 'hourCycle'
  | 'isDisabled'
  | 'isReadOnly'
  | 'placeholderValue'
>) {
  const state = use(DateRangePickerStateContext);
  if (state === null || !state.hasTime) return null;
  const { granularity, timeRange } = state;
  const time = {
    ...props,
    granularity: granularity === 'day' ? undefined : granularity,
    placeholderValue:
      placeholderValue && 'hour' in placeholderValue
        ? placeholderValue
        : undefined,
  };
  return (
    <div className="flex flex-wrap gap-3" data-slot="date-range-picker-time">
      <TimeField
        {...time}
        className="flex-1"
        label={startLabel}
        onChange={(value) => {
          if (value !== null) state.setTime('start', value);
        }}
        value={timeRange?.start ?? null}
      />
      <TimeField
        {...time}
        className="flex-1"
        label={endLabel}
        onChange={(value) => {
          if (value !== null) state.setTime('end', value);
        }}
        value={timeRange?.end ?? null}
      />
    </div>
  );
}
