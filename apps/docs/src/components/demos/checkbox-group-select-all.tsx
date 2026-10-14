import { Checkbox } from '@oakoss/ui/components/ui/inputs/checkbox';
import {
  CheckboxGroup,
  CheckboxGroupItem,
} from '@oakoss/ui/components/ui/inputs/checkbox-group';
import { useState } from 'react';

const options = ['email', 'sms', 'push'];

export function CheckboxGroupSelectAll() {
  const [value, setValue] = useState<string[]>(['email']);

  return (
    <div className="not-prose flex flex-col gap-3">
      <Checkbox
        isIndeterminate={value.length > 0 && value.length < options.length}
        isSelected={value.length === options.length}
        onChange={(isSelected) => {
          setValue(isSelected ? options : []);
        }}
      >
        All channels
      </Checkbox>
      <CheckboxGroup
        className="ms-6"
        label="Notify me by"
        onChange={setValue}
        value={value}
      >
        <CheckboxGroupItem value="email">Email</CheckboxGroupItem>
        <CheckboxGroupItem value="sms">Text message</CheckboxGroupItem>
        <CheckboxGroupItem value="push">Push notification</CheckboxGroupItem>
      </CheckboxGroup>
    </div>
  );
}
