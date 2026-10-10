import {
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@oakoss/ui/components/ui/inputs/combobox';
import {
  FieldDescription,
  FieldLabel,
} from '@oakoss/ui/components/ui/inputs/field';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import {
  InputGroup,
  InputGroupAddon,
} from '@oakoss/ui/components/ui/inputs/input-group';
import { ComboBox } from 'react-aria-components';

export function ComboboxCustomLayout() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <ComboBox className="flex flex-col gap-2">
        <FieldLabel>Country</FieldLabel>
        <InputGroup>
          <Input placeholder="Search countries" />
          <InputGroupAddon align="inline-end">
            <ComboboxTrigger />
          </InputGroupAddon>
        </InputGroup>
        <FieldDescription>Where we ship your order.</FieldDescription>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem id="ca">Canada</ComboboxItem>
            <ComboboxItem id="fr">France</ComboboxItem>
            <ComboboxItem id="jp">Japan</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </ComboBox>
    </div>
  );
}
