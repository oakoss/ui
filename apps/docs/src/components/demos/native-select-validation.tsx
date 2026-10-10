import {
  NativeSelect,
  NativeSelectOption,
} from '@oakoss/ui/components/ui/inputs/native-select';
import { useState } from 'react';

export function NativeSelectValidation() {
  const [size, setSize] = useState('');
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <NativeSelect
        errors={['Choose a size.']}
        isInvalid={size === ''}
        label="Size"
        onChange={(event) => {
          setSize(event.target.value);
        }}
        required
        value={size}
      >
        <NativeSelectOption disabled value="">
          Choose a size
        </NativeSelectOption>
        <NativeSelectOption value="s">Small</NativeSelectOption>
        <NativeSelectOption value="m">Medium</NativeSelectOption>
        <NativeSelectOption value="l">Large</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
