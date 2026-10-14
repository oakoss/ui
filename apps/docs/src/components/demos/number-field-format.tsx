import { NumberField } from '@oakoss/ui/components/ui/inputs/number-field';

export function NumberFieldFormat() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <NumberField
        className="w-48"
        defaultValue={49.99}
        formatOptions={{ currency: 'USD', style: 'currency' }}
        label="Price"
        minValue={0}
        steppers="none"
      />
      <NumberField
        className="w-40"
        defaultValue={0.15}
        formatOptions={{ style: 'percent' }}
        label="Discount"
        maxValue={1}
        minValue={0}
        step={0.05}
      />
      <NumberField
        className="w-48"
        defaultValue={12}
        formatOptions={{ style: 'unit', unit: 'kilogram', unitDisplay: 'long' }}
        label="Weight"
        minValue={0}
      />
    </div>
  );
}
