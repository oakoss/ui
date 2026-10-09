import {
  ToggleGroup,
  ToggleGroupItem,
} from '@oakoss/ui/components/ui/inputs/toggle-group';

export function ToggleGroupJoined() {
  return (
    <ToggleGroup
      aria-label="View"
      className="not-prose"
      defaultSelectedKeys={['list']}
      disallowEmptySelection
      joined
      variant="outline"
    >
      <ToggleGroupItem id="list">List</ToggleGroupItem>
      <ToggleGroupItem id="grid">Grid</ToggleGroupItem>
      <ToggleGroupItem id="board">Board</ToggleGroupItem>
    </ToggleGroup>
  );
}
