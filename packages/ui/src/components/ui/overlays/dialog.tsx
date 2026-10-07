import type { ComponentProps, ReactNode } from 'react';

import {
  Dialog as AriaDialog,
  type DialogProps as AriaDialogProps,
  DialogTrigger as AriaDialogTrigger,
  type DialogTriggerProps as AriaDialogTriggerProps,
  Heading as AriaHeading,
  type HeadingProps as AriaHeadingProps,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  type ModalOverlayProps as AriaModalOverlayProps,
  Text as AriaText,
  type TextProps as AriaTextProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';

import * as Icon from '#/components/icons';
import { Button, type ButtonProps } from '#/components/ui/inputs/button';
import { cn, cx } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';

export type DialogCloseProps = DistributiveOmit<ButtonProps, 'slot'>;

export type DialogContentProps = {
  children: ReactNode;
  closeLabel?: string;
  // Names the dialog's part, and prefixes the panel's and the close button's.
  'data-slot'?: string;
  showCloseButton?: boolean;
} & DialogNameProps &
  // Inside an overlay, Modal ignores its open state and dismissal props.
  Omit<
    ComponentProps<typeof AriaModal>,
    | 'children'
    | 'defaultOpen'
    | 'isDismissable'
    | 'isEntering'
    | 'isExiting'
    | 'isKeyboardDismissDisabled'
    | 'isOpen'
    | 'onOpenChange'
    | 'shouldCloseOnInteractOutside'
    | 'UNSTABLE_portalContainer'
    | keyof DialogNameProps
  >;

export type DialogFooterProps = {
  closeLabel?: string;
  showCloseButton?: boolean;
} & ComponentProps<'div'>;

export type DialogProps = {
  children: ReactNode;
  className?: string;
  closeLabel?: string;
  // Names the dialog's part, and prefixes the overlay's, panel's and close
  // button's.
  'data-slot'?: string;
  showCloseButton?: boolean;
  size?: DialogSize;
} & DialogNameProps &
  Omit<AriaModalOverlayProps, 'children' | 'className' | keyof DialogNameProps>;

export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

type DialogNameProps = Pick<
  AriaDialogProps,
  'aria-describedby' | 'aria-label' | 'aria-labelledby' | 'role'
>;

// Below `sm` the panel sits on the bottom edge and slides up; from `sm` it's
// centered and scales in. `full` fills the screen at every width.
const styles = tv({
  compoundVariants: [
    {
      class: {
        content:
          'rounded-t-panel sm:rounded-panel entering:translate-y-full sm:entering:translate-y-0 sm:entering:scale-95 exiting:translate-y-full sm:exiting:translate-y-0 sm:exiting:scale-95',
        overlay: 'items-end p-0 pt-4 sm:items-center sm:p-4',
      },
      size: ['lg', 'md', 'sm'],
    },
  ],
  defaultVariants: { size: 'md' },
  slots: {
    content: [
      'relative flex max-h-full w-full flex-col overflow-y-auto border border-transparent bg-popover p-panel text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-hidden transition duration-100',
      'entering:opacity-0 exiting:opacity-0',
    ],
    overlay: '',
  },
  variants: {
    size: {
      full: { content: 'h-full rounded-none', overlay: 'items-stretch p-0' },
      lg: { content: 'sm:max-w-2xl' },
      md: { content: 'sm:max-w-md' },
      sm: { content: 'sm:max-w-sm' },
    },
  },
});

export type DialogSize = NonNullable<VariantProps<typeof styles>['size']>;

export function Dialog({
  'aria-describedby': ariaDescribedby,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  children,
  className,
  closeLabel = 'Close',
  'data-slot': slot = 'dialog',
  isDismissable = true,
  role,
  showCloseButton = true,
  size = 'md',
  ...props
}: DialogProps) {
  const { content, overlay } = styles({ size });
  return (
    <DialogOverlay
      className={cn(overlay())}
      data-size={size}
      data-slot={`${slot}-overlay`}
      isDismissable={isDismissable}
      {...props}
    >
      <DialogContent
        aria-describedby={ariaDescribedby}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        className={cx(content(), className)}
        closeLabel={closeLabel}
        data-size={size}
        data-slot={slot}
        role={role}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </DialogOverlay>
  );
}

export function DialogBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        focusRing,
        '-mx-panel -my-2 min-h-0 flex-1 overflow-y-auto px-panel py-2 focus-visible:-outline-offset-3 [@container(max-height:31.25rem)]:flex-none [@container(max-height:31.25rem)]:overflow-visible',
        className,
      )}
      data-slot="dialog-body"
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region needs keyboard access (axe scrollable-region-focusable)
      tabIndex={0}
      {...props}
    />
  );
}

export function DialogClose({
  intent = 'neutral',
  variant = 'outline',
  ...props
}: DialogCloseProps) {
  return (
    <Button
      data-slot="dialog-close"
      intent={intent}
      variant={variant}
      {...props}
      slot="close"
    />
  );
}

// The panel and dialog inside an overlay, for a modal with its own layout, as
// Sheet does. A tall DialogBody scrolls unless the viewport is short.
export function DialogContent({
  'aria-describedby': ariaDescribedby,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  children,
  closeLabel = 'Close',
  'data-slot': slot = 'dialog',
  role,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <AriaModal data-slot={`${slot}-content`} {...props}>
      <AriaDialog
        aria-describedby={ariaDescribedby}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        className="flex flex-1 flex-col gap-6 outline-hidden has-data-[slot=dialog-body]:min-h-0 [@container(max-height:31.25rem)]:has-data-[slot=dialog-body]:min-h-auto"
        data-slot={slot}
        role={role}
      >
        {children}
        {showCloseButton ? (
          <DialogClose
            aria-label={closeLabel}
            className="absolute end-4 top-4"
            data-slot={`${slot}-close`}
            size="icon-sm"
            variant="ghost"
          >
            <Icon.X />
          </DialogClose>
        ) : null}
      </AriaDialog>
    </AriaModal>
  );
}

export function DialogDescription({
  className,
  ...props
}: Omit<AriaTextProps, 'slot'>) {
  return (
    <AriaText
      className={cn(
        'text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className,
      )}
      data-slot="dialog-description"
      elementType="div"
      {...props}
      slot="description"
    />
  );
}

export function DialogFooter({
  children,
  className,
  closeLabel = 'Close',
  showCloseButton = false,
  ...props
}: DialogFooterProps) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      data-slot="dialog-footer"
      {...props}
    >
      {children}
      {showCloseButton ? <DialogClose>{closeLabel}</DialogClose> : null}
    </div>
  );
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      data-slot="dialog-header"
      {...props}
    />
  );
}

export function DialogOverlay({ className, ...props }: AriaModalOverlayProps) {
  return (
    <AriaModalOverlay
      className={cx(
        '@container-size fixed inset-x-0 top-0 isolate z-(--z-modal) flex h-(--visual-viewport-height) items-center justify-center bg-black/10 p-4 transition-opacity duration-100 supports-backdrop-filter:backdrop-blur-xs entering:opacity-0 exiting:opacity-0',
        className,
      )}
      data-slot="dialog-overlay"
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: Omit<AriaHeadingProps, 'slot'>) {
  return (
    <AriaHeading
      className={cn('text-lg leading-none font-medium', className)}
      data-slot="dialog-title"
      {...props}
      slot="title"
    />
  );
}

export function DialogTrigger(props: AriaDialogTriggerProps) {
  return <AriaDialogTrigger {...props} />;
}
