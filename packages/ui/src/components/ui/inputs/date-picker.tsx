import { type ReactNode, use } from 'react';
import {
  Button as AriaButton,
  DatePicker as AriaDatePicker,
  type DatePickerProps as AriaDatePickerProps,
  ButtonContext,
  DatePickerStateContext,
  type DateValue,
} from 'react-aria-components';

import type { Shortcut } from '#/components/ui/inputs/field';

import * as Icon from '#/components/icons';
import { buttonStyles } from '#/components/ui/inputs/button';
import {
  Calendar,
  type CalendarGridProps,
} from '#/components/ui/inputs/calendar';
import {
  type DateFieldGroupProps,
  type DateFieldLayoutProps,
  DateInput,
  type GranularityOf,
} from '#/components/ui/inputs/date-field';
import {
  InputGroup,
  InputGroupAddon,
  useFieldShortcut,
} from '#/components/ui/inputs/input-group';
import { TimeField } from '#/components/ui/inputs/time-field';
import { Popover, type PopoverProps } from '#/components/ui/overlays/popover';
import { cn, cx } from '#/lib/cx';
import { isEmptyNode } from '#/lib/empty-node';

export type DatePickerCalendarProps = {
  footer?: ReactNode;
  heading?: ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  renderCell?: CalendarGridProps['renderCell'];
  visibleMonths?: number;
};

export type DatePickerLayoutProps = {
  calendarProps?: DatePickerCalendarProps;
  // Names the time field the popover adds when granularity includes a time.
  timeLabel?: string;
} & DateFieldLayoutProps;

export type DatePickerProps<T extends DateValue = DateValue> = {
  granularity?: GranularityOf<T>;
} & Omit<AriaDatePickerProps<T>, 'children' | 'granularity'> &
  Shortcut<DatePickerLayoutProps>;

const triggerStyles = buttonStyles({
  size: 'icon-sm',
  targetSize: false,
  variant: 'ghost',
});

export function DatePicker<T extends DateValue = DateValue>({
  calendarProps,
  children,
  className,
  description,
  end,
  errorMessage,
  errors,
  label,
  size,
  start,
  timeLabel = 'Time',
  ...props
}: DatePickerProps<T>) {
  const { decorations, fieldProps, layout } = useFieldShortcut(
    { description, end, errorMessage, errors, label, start },
    props,
  );
  return (
    <AriaDatePicker<T>
      {...fieldProps}
      className={cx('flex flex-col gap-2', className)}
      data-slot="date-picker"
    >
      {children ??
        (({ isDisabled, isReadOnly, isRequired }) =>
          layout(
            <>
              <DatePickerGroup size={size} {...decorations}>
                <DateInput />
              </DatePickerGroup>
              <DatePickerContent>
                <Calendar {...calendarProps} />
                <DatePickerTime
                  hideTimeZone={props.hideTimeZone}
                  hourCycle={props.hourCycle}
                  isDisabled={isDisabled}
                  isReadOnly={isReadOnly}
                  label={timeLabel}
                  placeholderValue={props.placeholderValue}
                />
              </DatePickerContent>
            </>,
          )({ isRequired }))}
    </AriaDatePicker>
  );
}

// The popover around the calendar, which React Aria names after the field
// and places under the whole input.
export function DatePickerContent({
  className,
  placement = 'bottom start',
  ...props
}: PopoverProps) {
  return (
    <Popover
      {...props}
      className={cn('w-auto', className)}
      placement={placement}
    />
  );
}

// The picker's named group: its input, decorations and the trigger last.
// Decorations reset the button context, which belongs to the trigger.
export function DatePickerGroup({
  children,
  end,
  size,
  start,
}: DateFieldGroupProps) {
  return (
    <InputGroup size={size}>
      {isEmptyNode(start) ? null : (
        <InputGroupAddon align="inline-start">
          <ButtonContext value={null}>{start}</ButtonContext>
        </InputGroupAddon>
      )}
      {children}
      <InputGroupAddon align="inline-end">
        {isEmptyNode(end) ? null : (
          <ButtonContext value={null}>{end}</ButtonContext>
        )}
        <DatePickerTrigger />
      </InputGroupAddon>
    </InputGroup>
  );
}

// The time of a date and time value, for the popover. It renders only when
// the picker's granularity includes a time. A zoned placeholder keeps a time
// typed before the date in its time zone. A cleared time leaves the picker's
// time as it was, since a date and time value always has one.
export function DatePickerTime({
  placeholderValue,
  ...props
}: { label: string } & Pick<
  AriaDatePickerProps<DateValue>,
  | 'hideTimeZone'
  | 'hourCycle'
  | 'isDisabled'
  | 'isReadOnly'
  | 'placeholderValue'
>) {
  const state = use(DatePickerStateContext);
  if (state === null || !state.hasTime) return null;
  const { granularity } = state;
  const placeholderTime =
    placeholderValue && 'hour' in placeholderValue
      ? placeholderValue
      : undefined;
  return (
    <TimeField
      {...props}
      granularity={granularity === 'day' ? undefined : granularity}
      onChange={(value) => {
        if (value !== null) state.setTimeValue(value);
      }}
      placeholderValue={placeholderTime}
      value={state.timeValue}
    />
  );
}

// React Aria names the button ("Calendar"), translated, and keeps it pressed
// while the popover is open, which would hold Button's pressed look.
export function DatePickerTrigger({ className }: { className?: string }) {
  return (
    <AriaButton
      className={cn(
        triggerStyles,
        'pressed:from-transparent pressed:to-transparent',
        className,
      )}
      data-slot="date-picker-trigger"
    >
      <Icon.Calendar aria-hidden />
    </AriaButton>
  );
}
