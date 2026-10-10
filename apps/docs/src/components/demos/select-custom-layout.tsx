import {
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@oakoss/ui/components/ui/inputs/field';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@oakoss/ui/components/ui/inputs/select';
import { Select } from 'react-aria-components';

export function SelectCustomLayout() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <Select className="flex flex-col gap-2" isRequired>
        <FieldLabel>Country</FieldLabel>
        <FieldDescription>Where we ship your order.</FieldDescription>
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <FieldError />
        <SelectContent>
          <SelectItem id="ca">Canada</SelectItem>
          <SelectItem id="mx">Mexico</SelectItem>
          <SelectItem id="us">United States</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
