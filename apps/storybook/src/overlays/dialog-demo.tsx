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

export async function closed(role: 'alertdialog' | 'dialog' = 'dialog') {
  await waitFor(async () => {
    await expect(screen.queryByRole(role)).toBeNull();
  });
}

// Whether the close button sits 1rem in from the panel's top and right/left
// edges. The 1px border and sub-pixel layout put each gap at 16–17px.
export function closePosition(dialog: HTMLElement) {
  const close = screen.getByRole('button', { name: 'Close' });
  const closeBox = close.getBoundingClientRect();
  const panel = dialogParts(dialog).content.getBoundingClientRect();
  return {
    left: isInset(closeBox.left - panel.left),
    right: isInset(panel.right - closeBox.right),
    top: isInset(closeBox.top - panel.top),
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

export function dialogParts(
  dialog: HTMLElement,
  part: 'alert-dialog' | 'dialog' = 'dialog',
) {
  const content = dialog.closest(`[data-slot=${CSS.escape(part)}-content]`);
  const overlay = dialog.closest(`[data-slot=${CSS.escape(part)}-overlay]`);
  if (!(content instanceof HTMLElement) || !(overlay instanceof HTMLElement))
    throw new Error('No dialog parts');
  return { content, overlay };
}

export async function openDialog() {
  await userEvent.click(screen.getByRole('button', { name: 'Open editor' }));
  return screen.findByRole('dialog', { name: 'Edit profile' });
}

// A closing overlay stays visible and findable by role until its exit ends.
export async function stayedOpen(overlay: HTMLElement) {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 400);
  });
  await expect(overlay).toBeInTheDocument();
  await expect(overlay).not.toHaveAttribute('data-exiting');
}

// Visibility settles once the enter transition finishes.
export async function visible(element: HTMLElement) {
  await waitFor(async () => {
    await expect(element).toBeVisible();
  });
}

function isInset(gap: number) {
  return gap >= 15.5 && gap <= 17.5;
}
