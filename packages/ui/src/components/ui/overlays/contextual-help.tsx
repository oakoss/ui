import type { ReactNode } from 'react';
import type { DialogTriggerProps as AriaDialogTriggerProps } from 'react-aria-components';

import * as Icon from '#/components/icons';
import { Button } from '#/components/ui/inputs/button';
import {
  Popover,
  type PopoverProps,
  PopoverTrigger,
} from '#/components/ui/overlays/popover';
import { cn } from '#/lib/cx';

export type ContextualHelpProps = {
  // The popover's content; a PopoverTitle names it, otherwise it takes the
  // button's label.
  children: ReactNode;
  className?: string;
  helpLabel?: string;
  infoLabel?: string;
  variant?: 'help' | 'info';
} & Pick<AriaDialogTriggerProps, 'defaultOpen' | 'isOpen' | 'onOpenChange'> &
  Pick<
    PopoverProps,
    'crossOffset' | 'offset' | 'placement' | 'shouldFlip' | 'showArrow'
  >;

export function ContextualHelp({
  children,
  className,
  crossOffset,
  defaultOpen,
  helpLabel = 'Help',
  infoLabel = 'Information',
  isOpen,
  offset,
  onOpenChange,
  placement = 'bottom start',
  shouldFlip,
  showArrow,
  variant = 'help',
}: ContextualHelpProps) {
  return (
    <PopoverTrigger
      defaultOpen={defaultOpen}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      {/* slot={null} opts out of a surrounding field's button props, so help
          inside a disabled NumberField or Select stays enabled and opens its
          own popover. */}
      <Button
        aria-label={variant === 'info' ? infoLabel : helpLabel}
        className={cn(className)}
        data-slot="contextual-help-trigger"
        intent="neutral"
        size="icon-sm"
        slot={null}
        variant="ghost"
      >
        <TriggerIcon variant={variant} />
      </Button>
      <Popover
        crossOffset={crossOffset}
        offset={offset}
        placement={placement}
        shouldFlip={shouldFlip}
        showArrow={showArrow}
      >
        {children}
      </Popover>
    </PopoverTrigger>
  );
}

function TriggerIcon({ variant }: { variant: 'help' | 'info' }) {
  if (variant === 'info') return <Icon.Info />;
  // Arabic-script question marks are mirrored (؟); Hebrew uses "?".
  return (
    <Icon.Help className="[&:lang(ar)]:-scale-x-100 [&:lang(fa)]:-scale-x-100 [&:lang(ur)]:-scale-x-100" />
  );
}
