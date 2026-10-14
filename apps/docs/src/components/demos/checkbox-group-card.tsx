import {
  CheckboxGroup,
  CheckboxGroupItem,
} from '@oakoss/ui/components/ui/inputs/checkbox-group';

export function CheckboxGroupCard() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <CheckboxGroup label="Add-ons" variant="card">
        <CheckboxGroupItem
          description="Daily copies, kept for 30 days."
          value="backups"
        >
          Backups
        </CheckboxGroupItem>
        <CheckboxGroupItem
          description="Answers within four hours."
          value="support"
        >
          Priority support
        </CheckboxGroupItem>
      </CheckboxGroup>
    </div>
  );
}
