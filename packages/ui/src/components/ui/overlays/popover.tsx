import type { ComponentProps, ReactNode } from 'react';

import {
  Dialog as AriaDialog,
  type DialogProps as AriaDialogProps,
  OverlayArrow as AriaOverlayArrow,
  Popover as AriaPopover,
  type PopoverProps as AriaPopoverProps,
  composeRenderProps,
} from 'react-aria-components';

import {
  DialogBody,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/overlays/dialog';
import { cn, cx } from '#/lib/cx';

export type PopoverProps = {
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
} & Omit<
  AriaPopoverProps,
  | 'aria-describedby'
  | 'aria-label'
  | 'aria-labelledby'
  | 'children'
  | 'className'
  | 'isNonModal'
> &
  Pick<AriaDialogProps, 'aria-describedby' | 'aria-label' | 'aria-labelledby'>;

const panel = cn(
  'z-(--z-popover) flex w-72 origin-(--trigger-anchor-point) flex-col rounded-panel border border-transparent bg-popover p-popover text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden transition duration-150 ease-out',
  'entering:scale-95 entering:opacity-0 exiting:scale-95 exiting:opacity-0',
  'placement-left:entering:translate-x-1 placement-right:entering:-translate-x-1 placement-top:entering:translate-y-1 placement-bottom:entering:-translate-y-1',
  'placement-left:exiting:translate-x-1 placement-right:exiting:-translate-x-1 placement-top:exiting:translate-y-1 placement-bottom:exiting:-translate-y-1',
);

export function Popover({
  'aria-describedby': ariaDescribedby,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  children,
  className,
  offset,
  placement = 'bottom',
  showArrow = false,
  style,
  ...props
}: PopoverProps) {
  return (
    <AriaPopover
      className={cx(panel, className)}
      data-slot="popover-content"
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
      <AriaDialog
        aria-describedby={ariaDescribedby}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        className="-mx-popover -my-1.5 flex flex-1 flex-col gap-4 overflow-y-auto px-popover py-1.5 outline-hidden"
        data-slot="popover"
      >
        {children}
      </AriaDialog>
    </AriaPopover>
  );
}

export function PopoverBody({
  className,
  ...props
}: ComponentProps<typeof DialogBody>) {
  return (
    <DialogBody
      className={cn('-mx-popover -my-1.5 px-popover py-1.5', className)}
      {...props}
    />
  );
}

export function PopoverDescription(
  props: ComponentProps<typeof DialogDescription>,
) {
  return <DialogDescription data-slot="popover-description" {...props} />;
}

export function PopoverHeader({
  className,
  ...props
}: ComponentProps<typeof DialogHeader>) {
  return (
    <DialogHeader
      className={cn('gap-1', className)}
      data-slot="popover-header"
      {...props}
    />
  );
}

export function PopoverTitle({
  className,
  ...props
}: ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      className={cn('text-sm', className)}
      data-slot="popover-title"
      {...props}
    />
  );
}

export function PopoverTrigger(props: ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger {...props} />;
}

// Points down; rotated toward the trigger for the other placements.
function PopoverArrow() {
  return (
    <AriaOverlayArrow className="group" data-slot="popover-arrow">
      <svg
        aria-hidden="true"
        className="block size-3 fill-popover stroke-foreground/10 group-placement-left:-rotate-90 group-placement-right:rotate-90 group-placement-bottom:rotate-180 forced-colors:fill-[Canvas] forced-colors:stroke-[CanvasText]"
        viewBox="0 0 12 12"
      >
        <path d="M0 0 L6 6 L12 0" />
      </svg>
    </AriaOverlayArrow>
  );
}
