import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
} from '@oakoss/ui/components/ui/inputs/field';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';

export function FieldOrientation() {
  return (
    <FieldGroup className="not-prose w-full max-w-lg">
      <TextField>
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel>Seats</FieldLabel>
            <FieldDescription>Billed per month.</FieldDescription>
          </FieldContent>
          <Input className="w-24" />
        </Field>
      </TextField>
      <TextField>
        <Field orientation="responsive">
          <FieldLabel>Display name</FieldLabel>
          <Input />
        </Field>
      </TextField>
    </FieldGroup>
  );
}
