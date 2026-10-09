import { buttonStyles } from '@oakoss/ui/components/ui/inputs/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@oakoss/ui/components/ui/layout/collapsible';

export function CollapsibleOpen() {
  return (
    <Collapsible
      className="not-prose flex max-w-sm flex-col gap-2"
      defaultExpanded
    >
      <CollapsibleTrigger
        className={buttonStyles({ intent: 'neutral', variant: 'ghost' })}
      >
        Release notes
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="py-2 text-sm">
          Adds Accordion and Collapsible, with animated panels.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
