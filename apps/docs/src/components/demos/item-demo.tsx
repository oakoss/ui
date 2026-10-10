import * as Icon from '@oakoss/ui/components/icons';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@oakoss/ui/components/ui/data/item';
import { Button } from '@oakoss/ui/components/ui/inputs/button';

export function ItemDemo() {
  return (
    <Item className="not-prose max-w-md" variant="outline">
      <ItemMedia variant="icon">
        <Icon.Info />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Billing updated</ItemTitle>
        <ItemDescription>
          Your card ending 4242 is now the default.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button intent="neutral" size="sm" variant="outline">
          Review
        </Button>
      </ItemActions>
    </Item>
  );
}
