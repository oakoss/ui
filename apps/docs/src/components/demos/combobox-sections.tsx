import {
  Combobox,
  ComboboxHeader,
  ComboboxItem,
  ComboboxSection,
} from '@oakoss/ui/components/ui/inputs/combobox';

export function ComboboxSections() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <Combobox label="Produce">
        <ComboboxSection>
          <ComboboxHeader>Fruit</ComboboxHeader>
          <ComboboxItem description="Crisp and sweet" id="apple">
            Apple
          </ComboboxItem>
          <ComboboxItem description="Soft when ripe" id="pear">
            Pear
          </ComboboxItem>
        </ComboboxSection>
        <ComboboxSection>
          <ComboboxHeader>Vegetables</ComboboxHeader>
          <ComboboxItem id="carrot">Carrot</ComboboxItem>
          <ComboboxItem id="leek">Leek</ComboboxItem>
        </ComboboxSection>
      </Combobox>
    </div>
  );
}
