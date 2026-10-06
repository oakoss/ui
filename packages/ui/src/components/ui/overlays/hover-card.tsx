import type { ComponentProps, ReactNode } from 'react';

import {
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
  PreviewTrigger as AriaPreviewTrigger,
  composeRenderProps,
} from 'react-aria-components';

import { PopoverArrow, popoverStyles } from '#/components/ui/overlays/popover';
import { cn } from '#/lib/cx';
import { useOverlayOpen } from '#/lib/use-overlay-open';

export type HoverCardProps = {
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
} & HoverCardName &
  Omit<
    AriaPopoverProps,
    | 'aria-label'
    | 'aria-labelledby'
    | 'children'
    | 'className'
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

export function HoverCard({
  children,
  className,
  offset,
  placement = 'bottom',
  showArrow = false,
  style,
  ...props
}: HoverCardProps) {
  return (
    <AriaPopover
      className={cn(popoverStyles(), 'w-64 gap-4', className)}
      // Keeps the card out of the inert content behind an open Dialog or
      // Popover, so it stays reachable there.
      data-react-aria-top-layer="true"
      data-slot="hover-card-content"
      offset={offset ?? (showArrow ? 12 : 8)}
      placement={placement}
      // Clears React Aria's inline z-index of 100000, so z-(--z-popover) applies.
      style={composeRenderProps(style, (value) => ({
        zIndex: undefined,
        ...value,
      }))}
      {...props}
    >
      {showArrow ? <PopoverArrow /> : null}
      {children}
    </AriaPopover>
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
