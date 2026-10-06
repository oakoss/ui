import {
  type ComponentProps,
  createContext,
  use,
  useEffect,
  useRef,
  useState,
} from 'react';
import { OverlayTriggerStateContext } from 'react-aria-components';

import { Button, type ButtonProps } from '#/components/ui/inputs/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  type DialogCloseProps,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  type DialogProps,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/overlays/dialog';
import { cn } from '#/lib/cx';

export type AlertDialogActionProps = {
  /**
  Runs on press. A returned promise keeps the dialog open and the action
  pending until it settles.
  */
  onAction?: () => unknown;
  /**
  Receives the error when `onAction` throws or its promise rejects; the dialog
  stays open. Without it, the error goes to `reportError`.
  */
  onError?: (error: unknown) => void;
} & DistributiveOmit<ButtonProps, 'isPending' | 'onPress' | 'slot'>;

export type AlertDialogProps = { size?: 'md' | 'sm' } & Omit<
  DialogProps,
  'role' | 'showCloseButton' | 'size'
>;

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

type Pending = {
  isPending: boolean;
  setIsPending: (isPending: boolean) => void;
};

const PendingContext = createContext<null | Pending>(null);

export function AlertDialog({
  isDismissable = false,
  isKeyboardDismissDisabled = false,
  size = 'md',
  ...props
}: AlertDialogProps) {
  const [isPending, setIsPending] = useState(false);
  return (
    <PendingContext value={{ isPending, setIsPending }}>
      <Dialog
        isDismissable={isDismissable && !isPending}
        isKeyboardDismissDisabled={isKeyboardDismissDisabled || isPending}
        size={size}
        {...props}
        role="alertdialog"
        showCloseButton={false}
      />
    </PendingContext>
  );
}

// Closes the dialog once onAction settles; a promise shows the button's
// pending state, and a failure leaves the dialog open.
export function AlertDialogAction({
  intent = 'primary',
  onAction,
  onError,
  variant = 'solid',
  ...props
}: AlertDialogActionProps) {
  const state = use(OverlayTriggerStateContext);
  const pending = use(PendingContext);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function act() {
    try {
      const result = onAction?.();
      if (isPromiseLike(result)) {
        pending?.setIsPending(true);
        await result;
      }
      if (mountedRef.current) state?.close();
    } catch (error) {
      // reportError is read here, not as a default, so SSR never touches it.
      (onError ?? reportError)(error);
    } finally {
      // AlertDialog outlives the action when the overlay closes, so pending
      // clears even after unmount; only close() checks the mount.
      pending?.setIsPending(false);
    }
  }

  return (
    <Button
      data-slot="alert-dialog-action"
      intent={intent}
      variant={variant}
      {...props}
      isPending={pending?.isPending ?? false}
      onPress={() => void act()}
      slot={null}
    />
  );
}

export function AlertDialogBody(props: ComponentProps<typeof DialogBody>) {
  return <DialogBody {...props} />;
}

export function AlertDialogCancel({
  autoFocus = true,
  isDisabled = false,
  ...props
}: DialogCloseProps) {
  const pending = use(PendingContext);
  return (
    <DialogClose
      // oxlint-disable-next-line jsx-a11y/no-autofocus -- the WAI-ARIA alertdialog pattern focuses the least destructive choice
      autoFocus={autoFocus}
      data-slot="alert-dialog-cancel"
      {...props}
      isDisabled={isDisabled || (pending?.isPending ?? false)}
    />
  );
}

export function AlertDialogDescription(
  props: ComponentProps<typeof DialogDescription>,
) {
  return <DialogDescription data-slot="alert-dialog-description" {...props} />;
}

export function AlertDialogFooter({
  className,
  ...props
}: ComponentProps<typeof DialogFooter>) {
  return (
    <DialogFooter
      className={cn(
        'in-data-[size=sm]:grid in-data-[size=sm]:grid-cols-2',
        className,
      )}
      data-slot="alert-dialog-footer"
      {...props}
    />
  );
}

export function AlertDialogHeader(props: ComponentProps<typeof DialogHeader>) {
  return <DialogHeader data-slot="alert-dialog-header" {...props} />;
}

export function AlertDialogMedia({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        "mb-2 inline-flex size-16 items-center justify-center rounded-control bg-muted [&_svg:not([class*='size-'])]:size-8",
        className,
      )}
      data-slot="alert-dialog-media"
      {...props}
    />
  );
}

export function AlertDialogTitle(props: ComponentProps<typeof DialogTitle>) {
  return <DialogTitle data-slot="alert-dialog-title" {...props} />;
}

export function AlertDialogTrigger(
  props: ComponentProps<typeof DialogTrigger>,
) {
  return <DialogTrigger {...props} />;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}
