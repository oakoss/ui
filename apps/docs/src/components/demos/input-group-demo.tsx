import * as Icon from '@oakoss/ui/components/icons';
import { FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from '@oakoss/ui/components/ui/inputs/input-group';
import { TextField } from 'react-aria-components';

export function InputGroupDemo() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <TextField className="flex flex-col gap-2">
        <FieldLabel>Website</FieldLabel>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <Input placeholder="example.com" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton aria-label="Search" size="icon-sm">
              <Icon.Search />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </TextField>
    </div>
  );
}
