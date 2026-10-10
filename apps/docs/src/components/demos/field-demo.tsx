import {
  FieldDescription,
  FieldLabel,
} from '@oakoss/ui/components/ui/inputs/field';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import { SearchField } from 'react-aria-components';

export function FieldDemo() {
  return (
    <SearchField className="not-prose flex max-w-sm flex-col gap-2">
      <FieldLabel>Search docs</FieldLabel>
      <Input placeholder="Button, Field…" />
      <FieldDescription>Press Escape to clear.</FieldDescription>
    </SearchField>
  );
}
