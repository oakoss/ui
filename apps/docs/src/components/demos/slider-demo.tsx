import { Slider } from '@oakoss/ui/components/ui/inputs/slider';

export function SliderDemo() {
  return (
    <Slider
      className="not-prose max-w-80"
      defaultValue={40}
      description="Applies to every speaker."
      label="Volume"
    />
  );
}
