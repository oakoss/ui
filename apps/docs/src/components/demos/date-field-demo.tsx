import { parseDate } from '@internationalized/date';
import { DateField } from '@oakoss/ui/components/ui/inputs/date-field';

export function DateFieldDemo() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <DateField
        className="w-56"
        defaultValue={parseDate('2026-03-14')}
        description="When the invoice is due."
        label="Due date"
      />
    </div>
  );
}
