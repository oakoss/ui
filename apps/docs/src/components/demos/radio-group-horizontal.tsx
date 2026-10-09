import {
  RadioGroup,
  RadioGroupItem,
} from '@oakoss/ui/components/ui/inputs/radio-group';

export function RadioGroupHorizontal() {
  return (
    <RadioGroup
      className="not-prose"
      defaultValue="monthly"
      description="Yearly saves two months."
      label="Billing"
      orientation="horizontal"
    >
      <RadioGroupItem value="monthly">Monthly</RadioGroupItem>
      <RadioGroupItem value="yearly">Yearly</RadioGroupItem>
    </RadioGroup>
  );
}
