import { useState } from 'react';

import type { ToastAction as ToastActionOptions } from '#/lib/toast/toast-content';

import * as Icon from '#/components/icons';
import { Button } from '#/components/ui/inputs/button';
import { cn } from '#/lib/cx';

// A promise from the action keeps it pending; a failure goes to the action's
// onError (reportError otherwise) and leaves the toast open. Pending belongs
// to the toast version that started it, so an update in place keeps the
// button, and its focus, without inheriting the old action's work.
export function ToastAction({
  action,
  className,
  onDone,
  pendingLabel,
  version,
}: {
  action: ToastActionOptions;
  className: string;
  onDone: () => void;
  pendingLabel: string | undefined;
  version: number;
}) {
  const [pendingVersion, setPendingVersion] = useState<number>();

  async function act() {
    const started = version;
    try {
      const result = action.onPress();
      if (isPromiseLike(result)) {
        setPendingVersion(started);
        await result;
      }
    } catch (error) {
      (action.onError ?? reportError)(error);
      return;
    } finally {
      setPendingVersion((current) =>
        current === started ? undefined : current,
      );
    }
    onDone();
  }

  return (
    <Button
      className={cn(className)}
      data-slot="toast-action"
      isPending={pendingVersion === version}
      onPress={() => void act()}
      pendingLabel={pendingLabel}
      size="sm"
      variant="outline"
    >
      {action.label}
    </Button>
  );
}

export function ToastClose({
  className,
  label,
  onPress,
}: {
  className: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Button
      aria-label={label}
      className={cn(className)}
      data-slot="toast-close"
      onPress={onPress}
      size="icon-sm"
      variant="ghost"
    >
      <Icon.X />
    </Button>
  );
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}
