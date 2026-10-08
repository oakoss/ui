import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  FieldGroup,
  FieldSeparator,
} from '@oakoss/ui/components/ui/inputs/field';

export function FieldSeparatorDemo() {
  return (
    <FieldGroup className="not-prose w-full max-w-xs">
      <Button fullWidth>Continue with email</Button>
      <FieldSeparator>Or</FieldSeparator>
      <Button fullWidth variant="outline">
        Continue with a passkey
      </Button>
    </FieldGroup>
  );
}
