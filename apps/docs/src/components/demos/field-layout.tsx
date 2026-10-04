import {
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@oakoss/ui/components/ui/inputs/field';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';

export function FieldLayout() {
  return (
    <FieldSet className="not-prose max-w-sm">
      <FieldLegend>Shipping address</FieldLegend>
      <FieldGroup>
        <TextField label="Street" />
        <TextField label="City" />
      </FieldGroup>
    </FieldSet>
  );
}
