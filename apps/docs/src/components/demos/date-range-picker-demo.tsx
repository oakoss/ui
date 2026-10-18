import { parseDate } from '@internationalized/date';
import { DateRangePicker } from '@oakoss/ui/components/ui/inputs/date-range-picker';

export function DateRangePickerDemo() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <DateRangePicker
        className="w-80"
        defaultValue={{
          end: parseDate('2026-03-16'),
          start: parseDate('2026-03-14'),
        }}
        description="Type the dates, or pick them from the calendar."
        label="Stay"
      />
    </div>
  );
}
