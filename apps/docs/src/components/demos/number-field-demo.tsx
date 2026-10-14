import { NumberField } from '@oakoss/ui/components/ui/inputs/number-field';

export function NumberFieldDemo() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <NumberField
        className="w-40"
        defaultValue={2}
        description="Up to 10 per order."
        label="Quantity"
        maxValue={10}
        minValue={1}
        step={1}
      />
    </div>
  );
}
