import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  CheckboxGroup,
  CheckboxGroupItem,
} from '@oakoss/ui/components/ui/inputs/checkbox-group';

export function CheckboxGroupValidation() {
  return (
    <form
      className="not-prose flex flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <CheckboxGroup
        description="Select at least two."
        isRequired
        label="Interests"
        name="interests"
        requiredLabel="Select at least two."
        validate={(value) =>
          value.length > 0 && value.length < 2 ? 'Select at least two.' : null
        }
      >
        <CheckboxGroupItem value="design">Design</CheckboxGroupItem>
        <CheckboxGroupItem value="code">Code</CheckboxGroupItem>
        <CheckboxGroupItem value="writing">Writing</CheckboxGroupItem>
      </CheckboxGroup>
      <Button type="submit">Save</Button>
    </form>
  );
}
