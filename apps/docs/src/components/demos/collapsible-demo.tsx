import { buttonStyles } from '@oakoss/ui/components/ui/inputs/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@oakoss/ui/components/ui/layout/collapsible';

export function CollapsibleDemo() {
  return (
    <Collapsible className="not-prose flex max-w-sm flex-col gap-2">
      <CollapsibleTrigger
        className={buttonStyles({ intent: 'neutral', variant: 'outline' })}
      >
        Order details
      </CollapsibleTrigger>
      <CollapsibleContent>
        <dl className="grid grid-cols-2 gap-1 py-2 text-sm">
          <dt className="text-muted-foreground">Placed</dt>
          <dd>October 9</dd>
          <dt className="text-muted-foreground">Ships</dt>
          <dd>October 11</dd>
        </dl>
      </CollapsibleContent>
    </Collapsible>
  );
}
