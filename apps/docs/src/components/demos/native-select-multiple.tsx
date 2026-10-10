import {
  NativeSelect,
  NativeSelectOption,
} from '@oakoss/ui/components/ui/inputs/native-select';

export function NativeSelectMultiple() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <NativeSelect
        description="Hold Ctrl or ⌘ to pick several."
        label="Toppings"
        multiple
      >
        <NativeSelectOption value="cheese">Cheese</NativeSelectOption>
        <NativeSelectOption value="mushroom">Mushroom</NativeSelectOption>
        <NativeSelectOption value="olive">Olive</NativeSelectOption>
        <NativeSelectOption value="pepper">Pepper</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
