import { Checkbox } from '@oakoss/ui/components/ui/inputs/checkbox';

export function CheckboxDescription() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <Checkbox description="Synced with iCloud Drive.">Sync folders</Checkbox>
      <Checkbox
        errorMessage="Accept the terms to continue."
        isInvalid
        isRequired
      >
        I accept the terms
      </Checkbox>
    </div>
  );
}
