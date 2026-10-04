import * as Icon from '@oakoss/ui/components/icons';
import { Button } from '@oakoss/ui/components/ui/inputs/button';

export function ButtonIconOnly() {
  return (
    <div className="not-prose flex flex-wrap items-center gap-3">
      <Button aria-label="Add" size="icon-sm" variant="outline">
        <Icon.Plus />
      </Button>
      <Button aria-label="Search" size="icon" variant="soft">
        <Icon.Search />
      </Button>
      <Button aria-label="Close" size="icon-lg" variant="ghost">
        <Icon.X />
      </Button>
    </div>
  );
}
