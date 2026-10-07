import type { ComponentProps } from 'react';

import { PreviewTrigger as AriaPreviewTrigger } from 'react-aria-components';

import {
  PopoverContent,
  type PopoverContentProps,
} from '#/components/ui/overlays/popover';
import { cn } from '#/lib/cx';
import { useOverlayOpen } from '#/lib/use-overlay-open';

export type HoverCardProps = HoverCardName &
  Omit<
    PopoverContentProps,
    | 'aria-label'
    | 'aria-labelledby'
    | 'defaultOpen'
    | 'isEntering'
    | 'isExiting'
    | 'isNonModal'
    | 'isOpen'
    | 'onOpenChange'
    | 'shouldSkipAnimation'
    | 'slot'
    | 'trigger'
    | 'triggerRef'
  >;

// The card is a dialog, which needs a name.
type HoverCardName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export function HoverCard({ className, ...props }: HoverCardProps) {
  return (
    <PopoverContent
      className={cn('w-64 gap-4', className)}
      // Keeps the card out of the inert content behind an open Dialog or
      // Popover, so it stays reachable there.
      data-react-aria-top-layer="true"
      data-slot="hover-card-content"
      {...props}
    />
  );
}

export function HoverCardTrigger({
  defaultOpen,
  isDisabled,
  isOpen,
  onOpenChange,
  ...props
}: ComponentProps<typeof AriaPreviewTrigger>) {
  const open = useOverlayOpen({
    defaultOpen,
    isDisabled,
    isOpen,
    onOpenChange,
  });
  return <AriaPreviewTrigger {...props} {...open} />;
}
