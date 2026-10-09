import { Slider } from '@oakoss/ui/components/ui/inputs/slider';

export function SliderVertical() {
  return (
    <Slider
      className="not-prose h-56"
      defaultValue={60}
      label="Bass"
      orientation="vertical"
    />
  );
}
