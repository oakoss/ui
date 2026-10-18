import { parseDateTime, parseZonedDateTime } from '@internationalized/date';
import { DateField } from '@oakoss/ui/components/ui/inputs/date-field';

export function DateFieldGranularity() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <DateField
        className="w-64"
        defaultValue={parseDateTime('2026-03-14T09:30')}
        granularity="minute"
        label="Meeting"
      />
      <DateField
        className="w-80"
        defaultValue={parseZonedDateTime('2026-03-14T09:30[America/New_York]')}
        granularity="minute"
        label="Launch"
      />
    </div>
  );
}
