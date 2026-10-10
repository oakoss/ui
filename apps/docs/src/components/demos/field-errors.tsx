import { FieldError, FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';

// Duplicates and blank entries are dropped.
const errors = [
  'Choose a longer username.',
  { message: 'That username is taken.' },
  'Choose a longer username.',
  '',
];

export function FieldErrors() {
  return (
    <TextField className="not-prose max-w-sm" defaultValue="ada" isInvalid>
      <FieldLabel>Username</FieldLabel>
      <Input />
      <FieldError errors={errors} />
    </TextField>
  );
}
