import type { ComponentProps } from 'react';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@oakoss/ui/components/ui/overlays/dialog';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

export type DemoProps = { defaultOpen?: boolean } & Omit<
  ComponentProps<typeof Dialog>,
  'children'
>;

export async function closed() {
  await waitFor(async () => {
    await expect(screen.queryByRole('dialog')).toBeNull();
  });
}

// Where the close button sits: which half of the dialog, and how far above its
// top edge (-top-2).
export function closePosition(dialog: HTMLElement) {
  const close = screen.getByRole('button', { name: 'Close' });
  const closeBox = close.getBoundingClientRect();
  const dialogBox = dialog.getBoundingClientRect();
  return {
    side:
      closeBox.left < dialogBox.left + dialogBox.width / 2 ? 'left' : 'right',
    topOffset: Math.round(closeBox.top - dialogBox.top),
  };
}

// The trigger's text differs from the title, so a passing name check means the
// title names the dialog, not DialogTrigger's fallback to the trigger.
export function Demo({ defaultOpen = false, ...props }: DemoProps) {
  return (
    <DialogTrigger defaultOpen={defaultOpen}>
      <Button variant="outline">Open editor</Button>
      <Dialog {...props}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Changes save when you press Save.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <DialogClose intent="primary" variant="solid">
            Save
          </DialogClose>
        </DialogFooter>
      </Dialog>
    </DialogTrigger>
  );
}

export function dialogParts(dialog: HTMLElement) {
  const content = dialog.closest('[data-slot=dialog-content]');
  const overlay = dialog.closest('[data-slot=dialog-overlay]');
  if (!(content instanceof HTMLElement) || !(overlay instanceof HTMLElement))
    throw new Error('No dialog parts');
  return { content, overlay };
}

export async function openDialog() {
  await userEvent.click(screen.getByRole('button', { name: 'Open editor' }));
  return screen.findByRole('dialog', { name: 'Edit profile' });
}

// Visibility settles once the enter transition finishes.
export async function visible(element: HTMLElement) {
  await waitFor(async () => {
    await expect(element).toBeVisible();
  });
}
