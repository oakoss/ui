import { parseTime } from '@internationalized/date';
import { TimeField } from '@oakoss/ui/components/ui/inputs/time-field';

export function TimeFieldDemo() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <TimeField
        className="w-40"
        defaultValue={parseTime('09:30')}
        description="Your local time."
        label="Start time"
      />
    </div>
  );
}
