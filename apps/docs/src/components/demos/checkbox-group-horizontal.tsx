import {
  CheckboxGroup,
  CheckboxGroupItem,
} from '@oakoss/ui/components/ui/inputs/checkbox-group';

export function CheckboxGroupHorizontal() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <CheckboxGroup label="Days" orientation="horizontal">
        <CheckboxGroupItem value="sat">Saturday</CheckboxGroupItem>
        <CheckboxGroupItem value="sun">Sunday</CheckboxGroupItem>
      </CheckboxGroup>
    </div>
  );
}
