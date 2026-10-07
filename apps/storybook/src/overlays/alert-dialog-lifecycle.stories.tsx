import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@oakoss/ui/components/ui/overlays/alert-dialog';
import { act, useEffect, useState } from 'react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { closed, dialogParts } from './dialog-demo';

// Lets a play function close the dialog from outside, as an app's own state
// would, and settle the action's promise.
const app = {
  setOpen: undefined as ((isOpen: boolean) => void) | undefined,
  work: Promise.withResolvers<null>(),
};

function ControlledAlert({ intent }: { intent?: 'destructive' }) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    app.setOpen = setIsOpen;
  }, []);
  return (
    <AlertDialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button variant="outline">Delete project</Button>
      <AlertDialog>
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            {...(intent === undefined ? {} : { intent })}
            onAction={() => app.work.promise}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  );
}

const meta = {
  render: () => <ControlledAlert />,
  title: 'Overlays/Alert Dialog/Lifecycle',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

async function setOpen(isOpen: boolean) {
  await act(async () => {
    app.setOpen?.(isOpen);
    await Promise.resolve();
  });
}

// Closed from outside while pending, then reopened after the work settles: the
// reopened dialog isn't stuck pending.
export const ExternalCloseWhilePending: Story = {
  play: async () => {
    app.work = Promise.withResolvers<null>();
    await setOpen(true);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Delete' }),
    );
    await setOpen(false);
    await closed('alertdialog');
    await act(async () => {
      app.work.resolve(null);
      await app.work.promise;
    });
    await setOpen(true);
    const action = await screen.findByRole('button', { name: 'Delete' });
    await expect(action).not.toHaveAttribute('data-pending');
    await expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  },
};

// A promise from before a reopen doesn't close the reopened dialog.
export const StalePromiseAfterReopen: Story = {
  play: async () => {
    const stale = Promise.withResolvers<null>();
    app.work = stale;
    await setOpen(true);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Delete' }),
    );
    await setOpen(false);
    await closed('alertdialog');
    app.work = Promise.withResolvers<null>();
    await setOpen(true);
    const dialog = await screen.findByRole('alertdialog');
    await act(async () => {
      stale.resolve(null);
      await stale.promise;
    });
    const { content } = dialogParts(dialog, 'alert-dialog');
    await waitFor(async () => {
      await expect(content).not.toHaveAttribute('data-entering');
    });
    await expect(content).not.toHaveAttribute('data-exiting');
    await expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  },
};

// A caller's intent wins over the action's primary default.
export const IntentOverride: Story = {
  play: async () => {
    await setOpen(true);
    await expect(
      await screen.findByRole('button', { name: 'Delete' }),
    ).toHaveAttribute('data-intent', 'destructive');
  },
  render: () => <ControlledAlert intent="destructive" />,
};
