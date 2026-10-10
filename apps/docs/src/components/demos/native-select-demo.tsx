import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from '@oakoss/ui/components/ui/inputs/native-select';

export function NativeSelectDemo() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <NativeSelect
        defaultValue=""
        description="We ship to these countries."
        label="Country"
        name="country"
      >
        <NativeSelectOption disabled value="">
          Choose a country
        </NativeSelectOption>
        <NativeSelectOptGroup label="North America">
          <NativeSelectOption value="ca">Canada</NativeSelectOption>
          <NativeSelectOption value="mx">Mexico</NativeSelectOption>
          <NativeSelectOption value="us">United States</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Europe">
          <NativeSelectOption value="fr">France</NativeSelectOption>
          <NativeSelectOption value="de">Germany</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  );
}
