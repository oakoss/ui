import { Slider } from '@oakoss/ui/components/ui/inputs/slider';

export function SliderRange() {
  return (
    <Slider
      className="not-prose max-w-80"
      defaultValue={[200, 800]}
      formatOptions={{
        currency: 'USD',
        maximumFractionDigits: 0,
        style: 'currency',
      }}
      label="Price"
      maxValue={1000}
      step={10}
      thumbLabels={['Minimum', 'Maximum']}
    />
  );
}
