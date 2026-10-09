import {
  ToggleGroup,
  ToggleGroupItem,
} from '@oakoss/ui/components/ui/inputs/toggle-group';

export function ToggleGroupMultiple() {
  return (
    <ToggleGroup
      aria-label="Text style"
      className="not-prose"
      defaultSelectedKeys={['bold']}
      selectionMode="multiple"
    >
      <ToggleGroupItem id="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem id="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem id="underline">Underline</ToggleGroupItem>
    </ToggleGroup>
  );
}
