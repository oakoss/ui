import {
  RadioGroup,
  RadioGroupItem,
} from '@oakoss/ui/components/ui/inputs/radio-group';

export function RadioGroupCard() {
  return (
    <RadioGroup
      className="not-prose w-full max-w-sm"
      defaultValue="team"
      label="Plan"
      variant="card"
    >
      <RadioGroupItem
        description="One project, community support."
        value="free"
      >
        Free
      </RadioGroupItem>
      <RadioGroupItem
        description="Up to 20 seats and shared folders."
        value="team"
      >
        Team
      </RadioGroupItem>
      <RadioGroupItem
        description="Single sign-on and audit logs."
        value="enterprise"
      >
        Enterprise
      </RadioGroupItem>
    </RadioGroup>
  );
}
