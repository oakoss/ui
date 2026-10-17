import { parseDate } from '@internationalized/date';
import { DateRangePicker } from '@oakoss/ui/components/ui/inputs/date-range-picker';

export function DateRangePickerMonths() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <DateRangePicker
        calendarProps={{ visibleMonths: 2 }}
        className="w-80"
        defaultValue={{
          end: parseDate('2026-04-03'),
          start: parseDate('2026-03-28'),
        }}
        label="Trip"
      />
    </div>
  );
}
