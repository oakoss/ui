import { parseTime } from '@internationalized/date';
import { TimeField } from '@oakoss/ui/components/ui/inputs/time-field';

export function TimeFieldHourCycle() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <TimeField
        className="w-40"
        defaultValue={parseTime('21:30')}
        hourCycle={24}
        label="Departure"
      />
      <TimeField
        className="w-44"
        defaultValue={parseTime('21:30:15')}
        granularity="second"
        label="Lap time"
      />
    </div>
  );
}
