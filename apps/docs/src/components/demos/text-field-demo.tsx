import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';

export function TextFieldDemo() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <TextField
        description="We never share your address."
        label="Email"
        placeholder="you@example.com"
        type="email"
      />
      <TextField
        errorMessage="Enter a valid email."
        isInvalid
        label="Work email"
        placeholder="you@company.com"
      />
    </div>
  );
}
