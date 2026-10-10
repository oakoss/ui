import { FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from '@oakoss/ui/components/ui/inputs/input-group';
import { Textarea } from '@oakoss/ui/components/ui/inputs/textarea';
import { TextField } from 'react-aria-components';

export function InputGroupTextarea() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <TextField className="flex flex-col gap-2">
        <FieldLabel>Reply</FieldLabel>
        <InputGroup>
          <Textarea minRows={2} />
          <InputGroupAddon align="block-end">
            <InputGroupText>Markdown supported</InputGroupText>
            <InputGroupButton className="ms-auto" variant="solid">
              Send
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </TextField>
    </div>
  );
}
