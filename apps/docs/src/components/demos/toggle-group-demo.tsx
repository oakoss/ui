import {
  ToggleGroup,
  ToggleGroupItem,
} from '@oakoss/ui/components/ui/inputs/toggle-group';

export function ToggleGroupDemo() {
  return (
    <ToggleGroup
      aria-label="Alignment"
      className="not-prose"
      defaultSelectedKeys={['center']}
      variant="outline"
    >
      <ToggleGroupItem id="start">Start</ToggleGroupItem>
      <ToggleGroupItem id="center">Center</ToggleGroupItem>
      <ToggleGroupItem id="end">End</ToggleGroupItem>
    </ToggleGroup>
  );
}
