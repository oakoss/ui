import {
  FieldDescription,
  FieldLabel,
} from '@oakoss/ui/components/ui/inputs/field';
import {
  Slider,
  SliderOutput,
  SliderTrack,
} from '@oakoss/ui/components/ui/inputs/slider';

export function SliderComposed() {
  return (
    <Slider
      className="not-prose max-w-80"
      defaultValue={0.25}
      formatOptions={{ style: 'percent' }}
      maxValue={1}
      step={0.05}
    >
      <FieldLabel>Opacity</FieldLabel>
      <SliderTrack />
      <div className="flex items-center justify-between gap-2">
        <FieldDescription>Of the selected layer.</FieldDescription>
        <SliderOutput />
      </div>
    </Slider>
  );
}
