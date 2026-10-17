import { parseDate } from '@internationalized/date';
import * as Icon from '@oakoss/ui/components/icons';
import { buttonStyles } from '@oakoss/ui/components/ui/inputs/button';
import { Calendar } from '@oakoss/ui/components/ui/inputs/calendar';
import {
  DatePicker,
  DatePickerContent,
} from '@oakoss/ui/components/ui/inputs/date-picker';
import { FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { use } from 'react';
import {
  Button as AriaButton,
  DatePickerStateContext,
  Group,
  useLocale,
} from 'react-aria-components';

export function DatePickerButton() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <DatePicker defaultValue={parseDate('2026-03-14')}>
        <FieldLabel>Check-in</FieldLabel>
        <Group className="w-fit">
          <DateButton />
        </Group>
        <DatePickerContent>
          <Calendar />
        </DatePickerContent>
      </DatePicker>
    </div>
  );
}

// The button's name is the date it holds, so a screen reader hears the
// value before opening the calendar.
function DateButton() {
  const state = use(DatePickerStateContext);
  const { locale } = useLocale();
  const text = state?.value
    ? state.formatValue(locale, { month: 'long' })
    : 'Pick a date';
  return (
    <AriaButton
      aria-label={text}
      className={buttonStyles({
        className: 'w-56 justify-between',
        variant: 'outline',
      })}
    >
      {text}
      <Icon.Calendar aria-hidden />
    </AriaButton>
  );
}
