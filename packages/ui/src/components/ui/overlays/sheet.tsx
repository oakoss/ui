import type { ComponentProps, ReactNode } from 'react';

import {
  Dialog as AriaDialog,
  type DialogProps as AriaDialogProps,
  Modal as AriaModal,
  type ModalOverlayProps as AriaModalOverlayProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';

import * as Icon from '#/components/icons';
import {
  DialogBody,
  DialogClose,
  type DialogCloseProps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/overlays/dialog';
import { cn, cx } from '#/lib/cx';

export type SheetProps = {
  children: ReactNode;
  className?: string;
  closeLabel?: string;
  showCloseButton?: boolean;
  side?: SheetSide;
  size?: SheetSize;
} & Omit<
  AriaModalOverlayProps,
  | 'aria-describedby'
  | 'aria-label'
  | 'aria-labelledby'
  | 'children'
  | 'className'
> &
  Pick<AriaDialogProps, 'aria-describedby' | 'aria-label' | 'aria-labelledby'>;

export type SheetSide = 'bottom' | 'end' | 'start' | 'top';

export type SheetSize = NonNullable<VariantProps<typeof styles>['size']>;

// Placement, border and slide all come from CSS, so `start` and `end` follow
// the page's `dir` even where React Aria's locale disagrees with it.
const styles = tv({
  compoundVariants: [
    { class: { content: 'max-w-xs' }, inline: true, size: 'sm' },
    { class: { content: 'max-w-sm' }, inline: true, size: 'md' },
    { class: { content: 'max-w-lg' }, inline: true, size: 'lg' },
  ],
  defaultVariants: { side: 'end', size: 'md' },
  slots: {
    content:
      'relative flex flex-col overflow-y-auto border border-transparent bg-popover p-panel text-sm text-popover-foreground shadow-lg outline-hidden transition duration-200 ease-out',
    overlay: 'p-0',
  },
  variants: {
    inline: { false: '', true: { content: 'h-full w-3/4' } },
    side: {
      bottom: {
        content:
          'max-h-full w-full rounded-t-panel border-t-border pb-[max(var(--spacing-panel),env(safe-area-inset-bottom))] entering:translate-y-full exiting:translate-y-full',
        overlay: 'items-end',
      },
      end: {
        content:
          'ms-auto border-s-border ltr:entering:translate-x-full rtl:entering:-translate-x-full ltr:exiting:translate-x-full rtl:exiting:-translate-x-full',
      },
      start: {
        content:
          'me-auto border-e-border ltr:entering:-translate-x-full rtl:entering:translate-x-full ltr:exiting:-translate-x-full rtl:exiting:translate-x-full',
      },
      top: {
        content:
          'max-h-full w-full rounded-b-panel border-b-border entering:-translate-y-full exiting:-translate-y-full',
        overlay: 'items-start',
      },
    },
    size: { lg: '', md: '', sm: '' },
  },
});

export function Sheet({
  'aria-describedby': ariaDescribedby,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  children,
  className,
  closeLabel = 'Close',
  isDismissable = true,
  showCloseButton = true,
  side = 'end',
  size = 'md',
  ...props
}: SheetProps) {
  const { content, overlay } = styles({
    inline: side !== 'top' && side !== 'bottom',
    side,
    size,
  });
  return (
    <DialogOverlay
      className={cn(overlay())}
      data-side={side}
      isDismissable={isDismissable}
      {...props}
    >
      <AriaModal
        className={cx(content(), className)}
        data-side={side}
        data-size={size}
        data-slot="sheet-content"
      >
        <AriaDialog
          aria-describedby={ariaDescribedby}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className="flex flex-1 flex-col gap-6 outline-hidden has-data-[slot=dialog-body]:min-h-0 [@container(max-height:31.25rem)]:has-data-[slot=dialog-body]:min-h-auto"
          data-slot="sheet"
        >
          {children}
          {showCloseButton ? <CloseButton label={closeLabel} /> : null}
        </AriaDialog>
      </AriaModal>
    </DialogOverlay>
  );
}

export function SheetBody(props: ComponentProps<typeof DialogBody>) {
  return <DialogBody {...props} />;
}

export function SheetClose(props: DialogCloseProps) {
  return <DialogClose data-slot="sheet-close" {...props} />;
}

export function SheetDescription(
  props: ComponentProps<typeof DialogDescription>,
) {
  return <DialogDescription data-slot="sheet-description" {...props} />;
}

export function SheetFooter({
  className,
  ...props
}: ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn('mt-auto', className)}
      data-slot="sheet-footer"
      {...props}
    />
  );
}

export function SheetHeader(props: ComponentProps<typeof DialogHeader>) {
  return <DialogHeader data-slot="sheet-header" {...props} />;
}

export function SheetTitle(props: ComponentProps<typeof DialogTitle>) {
  return <DialogTitle data-slot="sheet-title" {...props} />;
}

export function SheetTrigger(props: ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger {...props} />;
}

function CloseButton({ label }: { label: string }) {
  return (
    <DialogClose
      aria-label={label}
      className="absolute end-4 top-4"
      data-slot="sheet-close"
      size="icon-sm"
      variant="ghost"
    >
      <Icon.X />
    </DialogClose>
  );
}
