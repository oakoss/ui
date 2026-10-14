import { NumberField } from '@oakoss/ui/components/ui/inputs/number-field';

export function NumberFieldSteppers() {
  return (
    <div className="not-prose grid gap-4 sm:grid-cols-2">
      <NumberField className="w-40" defaultValue={2} label="Split" />
      <NumberField
        className="w-40"
        defaultValue={2}
        label="End"
        steppers="end"
      />
      <NumberField
        className="w-40"
        defaultValue={2}
        label="Start"
        steppers="start"
      />
      <NumberField
        className="w-40"
        defaultValue={2500}
        formatOptions={{ currency: 'USD', style: 'currency' }}
        label="None"
        minValue={0}
        steppers="none"
      />
    </div>
  );
}
