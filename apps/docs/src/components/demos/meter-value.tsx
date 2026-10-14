import { Meter } from '@oakoss/ui/components/ui/feedback/meter';

export function MeterValueDemo() {
  return (
    <div className="not-prose grid w-full max-w-sm gap-4">
      <Meter
        formatOptions={{ style: 'unit', unit: 'gigabyte' }}
        label="Storage"
        maxValue={256}
        value={180}
      />
      <Meter label="Seats" maxValue={25} value={18} valueLabel="18 of 25" />
    </div>
  );
}
