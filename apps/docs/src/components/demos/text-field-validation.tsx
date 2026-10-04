import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
import { useState } from 'react';

export function TextFieldValidation() {
  const [value, setValue] = useState('ada');
  const errors = validate(value);

  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <TextField
        errors={errors}
        isInvalid={errors.length > 0}
        label="Email"
        onChange={setValue}
        value={value}
      />
    </div>
  );
}

// The shape form libraries produce: a list of strings or { message } objects.
function validate(value: string) {
  const errors: { message: string }[] = [];
  if (!value.includes('@')) errors.push({ message: 'Include an @.' });
  if (!value.endsWith('.com')) errors.push({ message: 'Use a .com address.' });
  return errors;
}
