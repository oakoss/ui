import { parseDate } from '@internationalized/date';
import { CalendarMonthYearSelect } from '@oakoss/ui/components/ui/inputs/calendar-month-year-select';
import { DatePicker } from '@oakoss/ui/components/ui/inputs/date-picker';

export function DatePickerMonthYear() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <DatePicker
        calendarProps={{ heading: <CalendarMonthYearSelect /> }}
        className="w-60"
        defaultValue={parseDate('1990-06-21')}
        label="Date of birth"
        maxValue={parseDate('2026-12-31')}
        minValue={parseDate('1900-01-01')}
      />
    </div>
  );
}
