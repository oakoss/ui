import { parseDate } from '@internationalized/date';
import { DatePicker } from '@oakoss/ui/components/ui/inputs/date-picker';

export function DatePickerDemo() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <DatePicker
        className="w-60"
        defaultValue={parseDate('2026-03-14')}
        description="Type the date, or pick it from the calendar."
        label="Due date"
      />
    </div>
  );
}
