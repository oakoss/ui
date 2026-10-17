import { parseDateTime } from '@internationalized/date';
import { DateRangePicker } from '@oakoss/ui/components/ui/inputs/date-range-picker';

export function DateRangePickerTime() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <DateRangePicker
        className="w-full max-w-md"
        defaultValue={{
          end: parseDateTime('2026-03-16T11:00'),
          start: parseDateTime('2026-03-14T15:00'),
        }}
        endTimeLabel="Check out"
        granularity="minute"
        label="Booking"
        startTimeLabel="Check in"
      />
    </div>
  );
}
