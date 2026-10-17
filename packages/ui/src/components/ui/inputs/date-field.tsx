import { type ReactNode, use } from 'react';
import {
  DateField as AriaDateField,
  type DateFieldProps as AriaDateFieldProps,
  DateInput as AriaDateInput,
  type DateInputProps as AriaDateInputProps,
  DateSegment as AriaDateSegment,
  type DateSegmentProps as AriaDateSegmentProps,
  type DateValue,
  GroupContext,
  useSlottedContext,
} from 'react-aria-components';

import type { FieldMessages, Shortcut } from '#/components/ui/inputs/field';
import type { InputSize } from '#/components/ui/inputs/input';

import {
  DecoratedInputGroup,
  type InputGroupSlots,
  useFieldShortcut,
} from '#/components/ui/inputs/input-group';
import { cx } from '#/lib/cx';

export type DateFieldGroupProps = {
  children: Exclude<ReactNode, boolean | null | undefined>;
  size?: InputSize;
} & InputGroupSlots;

export type DateFieldLayoutProps = { size?: InputSize } & FieldMessages &
  InputGroupSlots;

export type DateFieldProps<T extends DateValue = DateValue> = {
  granularity?: GranularityOf<T>;
} & Omit<AriaDateFieldProps<T>, 'children' | 'granularity'> &
  Shortcut<DateFieldLayoutProps>;

export type DateInputProps = Omit<AriaDateInputProps, 'children'>;

// React Aria throws when the granularity is finer than the value holds: a
// CalendarDate has no hour.
export type GranularityOf<T extends DateValue> = T extends { hour: number }
  ? AriaDateFieldProps<T>['granularity']
  : 'day';

// Text on a Highlight fill opts out of forced colors, or the backplate covers
// it. Segments are spans, so a disabled one paints GrayText itself.
const segmentClass =
  'rounded-xs px-0.5 whitespace-nowrap tabular-nums caret-transparent outline-hidden type-literal:px-0 data-placeholder:text-muted-foreground focus:bg-accent focus:text-accent-foreground focus:data-invalid:bg-destructive focus:data-invalid:text-destructive-foreground forced-colors:focus:bg-[Highlight] forced-colors:focus:text-[HighlightText] forced-colors:focus:forced-color-adjust-none forced-colors:data-disabled:text-[GrayText]';

export function DateField<T extends DateValue = DateValue>({
  children,
  className,
  description,
  end,
  errorMessage,
  errors,
  label,
  size,
  start,
  ...props
}: DateFieldProps<T>) {
  const { decorations, fieldProps, layout } = useFieldShortcut(
    { description, end, errorMessage, errors, label, start },
    props,
  );
  return (
    <AriaDateField<T>
      {...fieldProps}
      className={cx('flex flex-col gap-2', className)}
      data-slot="date-field"
    >
      {children ??
        layout(
          <DateFieldGroup size={size} {...decorations}>
            <DateInput />
          </DateFieldGroup>,
        )}
    </AriaDateField>
  );
}

// The InputGroup takes only the field's state from the GroupContext meant for
// the DateInput; with its name too, the field would be announced as two groups.
export function DateFieldGroup({
  children,
  size,
  ...decorations
}: DateFieldGroupProps) {
  const group = use(GroupContext);
  const state = useSlottedContext(GroupContext);
  return (
    <GroupContext
      value={{ isDisabled: state?.isDisabled, isInvalid: state?.isInvalid }}
    >
      <DecoratedInputGroup axis="inline" size={size} {...decorations}>
        <GroupContext value={group}>{children}</GroupContext>
      </DecoratedInputGroup>
    </GroupContext>
  );
}

export function DateInput({ className, ...props }: DateInputProps) {
  return (
    <AriaDateInput
      {...props}
      className={cx(
        'flex min-w-0 flex-1 cursor-text [scrollbar-width:none] items-center self-stretch overflow-x-auto px-control-x whitespace-nowrap disabled:cursor-default',
        className,
      )}
      data-slot="date-input"
    >
      {(segment) => <DateSegment segment={segment} />}
    </AriaDateInput>
  );
}

export function DateSegment({ className, ...props }: AriaDateSegmentProps) {
  return (
    <AriaDateSegment
      {...props}
      className={cx(segmentClass, className)}
      data-slot="date-segment"
    />
  );
}
