import { FieldError, FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
import { Link } from 'react-aria-components';

export function TextFieldCustomLayout() {
  return (
    <TextField className="not-prose max-w-sm" isRequired type="password">
      <div className="flex items-center justify-between">
        <FieldLabel>Password</FieldLabel>
        <Link className="text-sm underline" href="#custom-layout">
          Forgot?
        </Link>
      </div>
      <Input />
      <FieldError />
    </TextField>
  );
}
