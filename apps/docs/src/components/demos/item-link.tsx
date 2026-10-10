import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@oakoss/ui/components/ui/data/item';
import { Button } from '@oakoss/ui/components/ui/inputs/button';

export function ItemLink() {
  return (
    <Item
      className="not-prose max-w-md"
      href="/docs/components/button"
      variant="outline"
    >
      <ItemContent>
        <ItemTitle>Button</ItemTitle>
        <ItemDescription>Triggers an action or event.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button intent="neutral" size="sm" variant="ghost">
          Copy
        </Button>
      </ItemActions>
    </Item>
  );
}
