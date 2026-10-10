import {
  Combobox,
  ComboboxItem,
} from '@oakoss/ui/components/ui/inputs/combobox';

export function ComboboxDemo() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <Combobox description="Type to filter." label="Fruit">
        <ComboboxItem id="apple">Apple</ComboboxItem>
        <ComboboxItem id="apricot">Apricot</ComboboxItem>
        <ComboboxItem id="banana">Banana</ComboboxItem>
        <ComboboxItem id="pear">Pear</ComboboxItem>
      </Combobox>
    </div>
  );
}
