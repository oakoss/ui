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

import * as Icon from '#/components/icons';
import { Button, type ButtonProps } from '#/components/ui/inputs/button';
import { cn, cx } from '#/lib/cx';

export type DialogCloseProps = DistributiveOmit<ButtonProps, 'slot'>;

export type DialogFooterProps = {
  closeLabel?: string;
  showCloseButton?: boolean;
} & ComponentProps<'div'>;

export type DialogProps = {
  children: ReactNode;
  className?: string;
  closeLabel?: string;
  showCloseButton?: boolean;
} & DialogNameProps &
  Omit<AriaModalOverlayProps, 'children' | 'className' | keyof DialogNameProps>;

type DialogNameProps = Pick<
  AriaDialogProps,
  'aria-describedby' | 'aria-label' | 'aria-labelledby' | 'role'
>;

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export function Dialog({
  'aria-describedby': ariaDescribedby,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  children,
  className,
  closeLabel = 'Close',
  isDismissable = true,
  role,
  showCloseButton = true,
  ...props
}: DialogProps) {
  return (
    <DialogOverlay isDismissable={isDismissable} {...props}>
      <AriaModal
        className={cx(
          'max-h-full w-full overflow-y-auto rounded-panel border border-transparent bg-popover p-panel text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-hidden transition duration-100 sm:max-w-md entering:scale-95 entering:opacity-0 exiting:scale-95 exiting:opacity-0',
          className,
        )}
        data-slot="dialog-content"
      >
        <AriaDialog
          aria-describedby={ariaDescribedby}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className="relative grid gap-6 outline-hidden"
          data-slot="dialog"
          role={role}
        >
          {children}
          {showCloseButton ? (
            <DialogClose
              aria-label={closeLabel}
              className="absolute -end-2 -top-2"
              size="icon-sm"
              variant="ghost"
            >
              <Icon.X />
            </DialogClose>
          ) : null}
        </AriaDialog>
      </AriaModal>
    </DialogOverlay>
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
        'fixed inset-0 isolate z-(--z-modal) flex items-center justify-center bg-black/10 p-4 transition-opacity duration-100 supports-backdrop-filter:backdrop-blur-xs entering:opacity-0 exiting:opacity-0',
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
