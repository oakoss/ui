import { Select, SelectItem } from '@oakoss/ui/components/ui/inputs/select';

export function SelectDemo() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <Select description="Picked fresh daily." label="Fruit">
        <SelectItem id="apple">Apple</SelectItem>
        <SelectItem id="banana">Banana</SelectItem>
        <SelectItem id="pear">Pear</SelectItem>
      </Select>
    </div>
  );
}
