import type { ComponentProps, ReactNode } from 'react';

import {
  OverlayArrow as AriaOverlayArrow,
  Tooltip as AriaTooltip,
  type TooltipProps as AriaTooltipProps,
  TooltipTrigger as AriaTooltipTrigger,
  composeRenderProps,
} from 'react-aria-components';

import { cn, cx } from '#/lib/cx';
import { useOverlayOpen } from '#/lib/use-overlay-open';

export type TooltipProps = { children: ReactNode; className?: string } & Omit<
  AriaTooltipProps,
  'children' | 'className'
>;

const panel = cn(
  'z-(--z-tooltip) w-fit max-w-xs origin-(--trigger-anchor-point) rounded-control border border-transparent bg-foreground px-3 py-1.5 text-xs text-background outline-hidden transition duration-150 ease-out',
  'entering:scale-95 entering:opacity-0 exiting:scale-95 exiting:opacity-0',
  'placement-left:entering:translate-x-1 placement-right:entering:-translate-x-1 placement-top:entering:translate-y-1 placement-bottom:entering:-translate-y-1',
  'placement-left:exiting:translate-x-1 placement-right:exiting:-translate-x-1 placement-top:exiting:translate-y-1 placement-bottom:exiting:-translate-y-1',
);

export function Tooltip({
  children,
  className,
  offset = 10,
  style,
  ...props
}: TooltipProps) {
  return (
    <AriaTooltip
      className={cx(panel, className)}
      // Keeps the tooltip out of the inert content behind an open Dialog or
      // Popover, so it stays hoverable and still describes its trigger.
      data-react-aria-top-layer="true"
      data-slot="tooltip-content"
      offset={offset}
      // Clears React Aria's inline z-index of 100000, so z-(--z-tooltip) applies.
      style={composeRenderProps(style, (value) => ({
        zIndex: undefined,
        ...value,
      }))}
      {...props}
    >
      <TooltipArrow />
      {children}
    </AriaTooltip>
  );
}

// Half a second both ways: long enough that passing over a control doesn't
// open its tooltip, short enough to read as a response.
export function TooltipTrigger({
  closeDelay = 500,
  defaultOpen,
  delay = 500,
  isDisabled,
  isOpen,
  onOpenChange,
  ...props
}: ComponentProps<typeof AriaTooltipTrigger>) {
  const open = useOverlayOpen({
    defaultOpen,
    isDisabled,
    isOpen,
    onOpenChange,
  });
  return (
    <AriaTooltipTrigger
      closeDelay={closeDelay}
      delay={delay}
      {...props}
      {...open}
    />
  );
}

// Points down; rotated toward the trigger for the other placements.
function TooltipArrow() {
  return (
    <AriaOverlayArrow className="group" data-slot="tooltip-arrow">
      <svg
        aria-hidden="true"
        className="block size-2 fill-foreground group-placement-left:-rotate-90 group-placement-right:rotate-90 group-placement-bottom:rotate-180 forced-colors:fill-[Canvas] forced-colors:stroke-[CanvasText]"
        viewBox="0 0 8 8"
      >
        <path d="M0 0 L4 4 L8 0" />
      </svg>
    </AriaOverlayArrow>
  );
}
