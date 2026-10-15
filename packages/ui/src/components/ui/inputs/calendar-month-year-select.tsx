import { use } from 'react';
import {
  CalendarMonthPicker,
  type CalendarMonthPickerProps,
  CalendarStateContext,
  CalendarYearPicker,
  type CalendarYearPickerProps,
  type DateValue,
  type Key,
  RangeCalendarStateContext,
} from 'react-aria-components';

import { Select, SelectItem } from '#/components/ui/inputs/select';

export type CalendarMonthYearSelectProps = {
  monthFormat?: CalendarMonthPickerProps['format'];
  visibleYears?: CalendarYearPickerProps['visibleYears'];
  yearFormat?: CalendarYearPickerProps['format'];
};

type Picker = {
  'aria-label': string;
  items: PickerItem[];
  onChange: (key: Key | null) => void;
  value: Key;
};

type PickerItem = { formatted: string; id: number };

type YearPicker = { items: ({ date: DateValue } & PickerItem)[] } & Omit<
  Picker,
  'items'
>;

// Fills a Calendar's heading slot, so it renders once per calendar. React
// Aria names both pickers and keeps the years within minValue and maxValue.
export function CalendarMonthYearSelect({
  monthFormat,
  visibleYears,
  yearFormat,
}: CalendarMonthYearSelectProps) {
  return (
    <div className="flex items-center gap-1" data-slot="calendar-month-year">
      <CalendarMonthPicker format={monthFormat}>
        {(picker) => <PickerSelect picker={picker} />}
      </CalendarMonthPicker>
      <CalendarYearPicker
        format={yearFormat}
        visibleYears={wholeYears(visibleYears)}
      >
        {(picker) => <YearSelect picker={picker} />}
      </CalendarYearPicker>
    </div>
  );
}

// React Aria leaves the calendar's disabled state out of the picker props.
function PickerSelect({ picker }: { picker: Picker }) {
  const state = useCalendarState();
  return (
    <Select<PickerItem>
      {...picker}
      className="min-w-0"
      isDisabled={state?.isDisabled}
      size="sm"
    >
      {(item: PickerItem) => (
        <SelectItem id={item.id}>{item.formatted}</SelectItem>
      )}
    </Select>
  );
}

function useCalendarState() {
  return use(CalendarStateContext) ?? use(RangeCalendarStateContext);
}

// React Aria lists 20 years for zero and none for a negative count.
function wholeYears(value: number | undefined): number | undefined {
  if (value === undefined) return undefined;
  const whole = Math.trunc(value);
  return Number.isFinite(whole) && whole > 0 ? whole : 1;
}

// Near minValue or maxValue, React Aria dates every year on that bound's month
// and day, so picking one would jump there; this keeps the focused month and day.
function YearSelect({ picker }: { picker: YearPicker }) {
  const state = useCalendarState();
  return (
    <PickerSelect
      picker={{
        ...picker,
        onChange: (key) => {
          const item = picker.items.find(({ id }) => id === key);
          if (state === null || item === undefined) {
            picker.onChange(key);
            return;
          }
          state.setFocusedDate(
            state.focusedDate.set({ era: item.date.era, year: item.date.year }),
          );
        },
      }}
    />
  );
}
