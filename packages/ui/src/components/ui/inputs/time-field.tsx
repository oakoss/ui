import {
  TimeField as AriaTimeField,
  type TimeFieldProps as AriaTimeFieldProps,
  type TimeValue,
} from 'react-aria-components';

import type { Shortcut } from '#/components/ui/inputs/field';

import {
  DateFieldGroup,
  type DateFieldLayoutProps,
  DateInput,
} from '#/components/ui/inputs/date-field';
import { useFieldShortcut } from '#/components/ui/inputs/input-group';
import { cx } from '#/lib/cx';

export type TimeFieldProps<T extends TimeValue = TimeValue> = Omit<
  AriaTimeFieldProps<T>,
  'children'
> &
  Shortcut<DateFieldLayoutProps>;

export function TimeField<T extends TimeValue = TimeValue>({
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
}: TimeFieldProps<T>) {
  const { decorations, fieldProps, layout } = useFieldShortcut(
    { description, end, errorMessage, errors, label, start },
    props,
  );
  return (
    <AriaTimeField<T>
      {...fieldProps}
      className={cx('flex flex-col gap-2', className)}
      data-slot="time-field"
    >
      {children ??
        layout(
          <DateFieldGroup size={size} {...decorations}>
            <DateInput />
          </DateFieldGroup>,
        )}
    </AriaTimeField>
  );
}
