import { NumberField } from '@oakoss/ui/components/ui/inputs/number-field';
import { useState } from 'react';

export function NumberFieldValidation() {
  const [value, setValue] = useState(75);
  // An emptied field commits NaN, which no comparison catches.
  const isInvalid = Number.isNaN(value) || value < 1 || value > 50;

  return (
    <div className="not-prose flex flex-col gap-4">
      <NumberField
        className="w-48"
        commitBehavior="validate"
        errorMessage="Enter an amount between 1 and 50."
        formatOptions={{ currency: 'USD', style: 'currency' }}
        isInvalid={isInvalid}
        label="Gift amount"
        maxValue={50}
        minValue={1}
        onChange={setValue}
        steppers="none"
        value={value}
      />
    </div>
  );
}
