import { parseDateTime } from '@internationalized/date';
import { DatePicker } from '@oakoss/ui/components/ui/inputs/date-picker';

export function DatePickerTime() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <DatePicker
        className="w-72"
        defaultValue={parseDateTime('2026-03-14T09:30')}
        granularity="minute"
        label="Meeting"
        timeLabel="Starts at"
      />
    </div>
  );
}
