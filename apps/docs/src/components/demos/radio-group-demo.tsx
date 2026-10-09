import {
  RadioGroup,
  RadioGroupItem,
} from '@oakoss/ui/components/ui/inputs/radio-group';

export function RadioGroupDemo() {
  return (
    <RadioGroup
      className="not-prose"
      defaultValue="comfortable"
      label="Density"
    >
      <RadioGroupItem value="compact">Compact</RadioGroupItem>
      <RadioGroupItem value="comfortable">Comfortable</RadioGroupItem>
      <RadioGroupItem value="spacious">Spacious</RadioGroupItem>
    </RadioGroup>
  );
}
