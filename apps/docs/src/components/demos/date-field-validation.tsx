import { parseDate } from '@internationalized/date';
import { DateField } from '@oakoss/ui/components/ui/inputs/date-field';

export function DateFieldValidation() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <DateField
        className="w-56"
        defaultValue={parseDate('2026-01-10')}
        label="Check-in"
        maxValue={parseDate('2026-12-31')}
        minValue={parseDate('2026-03-01')}
        validationBehavior="aria"
      />
    </div>
  );
}
