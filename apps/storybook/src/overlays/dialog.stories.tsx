import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@oakoss/ui/components/ui/overlays/dialog';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import {
  closed,
  Demo,
  type DemoProps,
  dialogParts,
  openDialog,
  stayedOpen,
  visible,
} from './dialog-demo';

const meta = {
  render: (args) => <Demo {...args} />,
  title: 'Overlays/Dialog',
} satisfies Meta<DemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// React Aria links the description only for alert dialogs (see AlertRole), so
// a long dialog isn't read out in full on open.
export const Default: Story = {
  play: async () => {
    const dialog = await openDialog();
    await expect(
      screen.getByRole('heading', { level: 2, name: 'Edit profile' }),
    ).toHaveAttribute('data-slot', 'dialog-title');
    await expect(dialog).not.toHaveAttribute('aria-describedby');
    await expect(screen.getByRole('button', { name: 'Close' })).toHaveAttribute(
      'data-slot',
      'dialog-close',
    );
  },
};

export const EscapeClosesAndRestoresFocus: Story = {
  play: async () => {
    await openDialog();
    await userEvent.keyboard('{Escape}');
    await closed();
    await waitFor(async () => {
      await expect(
        screen.getByRole('button', { name: 'Open editor' }),
      ).toHaveFocus();
    });
  },
};

export const FocusContained: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await openDialog();
    await waitFor(async () => {
      await expect(dialog.contains(document.activeElement)).toBe(true);
    });
    for (const key of ['{Tab}', '{Tab}', '{Tab}', '{Shift>}{Tab}{/Shift}']) {
      await userEvent.keyboard(key);
      await expect(dialog.contains(document.activeElement)).toBe(true);
    }
    // React Aria hides everything outside the dialog from screen readers, with
    // inert or aria-hidden.
    await expect(
      canvasElement.closest('[inert], [aria-hidden=true]'),
    ).not.toBeNull();
  },
};

export const CloseButtons: Story = {
  play: async () => {
    await openDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await closed();
    await openDialog();
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await closed();
  },
};

export const OutsideClickDismisses: Story = {
  play: async () => {
    const { overlay } = dialogParts(await openDialog());
    await userEvent.click(overlay, { skipHover: true });
    await closed();
  },
};

export const NotDismissable: Story = {
  args: { isDismissable: false },
  play: async () => {
    const { overlay } = dialogParts(await openDialog());
    await userEvent.click(overlay, { skipHover: true });
    await stayedOpen(overlay);
    await userEvent.keyboard('{Escape}');
    await closed();
  },
};

export const CloseLabel: Story = {
  args: { closeLabel: 'Fermer' },
  play: async () => {
    await openDialog();
    await visible(screen.getByRole('button', { name: 'Fermer' }));
  },
};

export const WithoutCloseButton: Story = {
  args: { showCloseButton: false },
  play: async () => {
    await openDialog();
    await expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  },
};

export const FooterCloseButton: Story = {
  play: async () => {
    const dialog = await screen.findByRole('dialog');
    await expect(
      dialog.querySelectorAll('[data-slot=dialog-close]'),
    ).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    await closed();
  },
  render: () => (
    <DialogTrigger defaultOpen>
      <Button variant="outline">Open editor</Button>
      <Dialog>
        <DialogHeader>
          <DialogTitle>Saved</DialogTitle>
        </DialogHeader>
        <DialogFooter closeLabel="Done" showCloseButton />
      </Dialog>
    </DialogTrigger>
  ),
};

export const AlertRole: Story = {
  args: { role: 'alertdialog' },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Open editor' }));
    await expect(
      await screen.findByRole('alertdialog', { name: 'Edit profile' }),
    ).toHaveAccessibleDescription('Changes save when you press Save.');
  },
};

// Controlled through isOpen and onOpenChange, without a trigger to fall back
// on for a name.
export const Controlled: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Open' }));
    await visible(await screen.findByRole('dialog', { name: 'Controlled' }));
    await userEvent.keyboard('{Escape}');
    await closed();
    await expect(canvas.getByText('Closed')).toBeVisible();
  },
  render: function Render() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onPress={() => setIsOpen(true)}>Open</Button>
        <p>{isOpen ? 'Open' : 'Closed'}</p>
        <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
          <DialogTitle>Controlled</DialogTitle>
        </Dialog>
      </>
    );
  },
};

// A dialog with no title takes its name from aria-label, on the dialog element
// rather than the overlay.
export const LabelWithoutTitle: Story = {
  play: async () => {
    const dialog = await screen.findByRole('dialog', { name: 'Settings' });
    await expect(dialog).toHaveAttribute('data-slot', 'dialog');
  },
  render: () => (
    <Dialog aria-label="Settings" defaultOpen>
      <p>Choose your preferences.</p>
    </Dialog>
  ),
};

// Ids from elements outside the dialog name and describe it.
export const LabelledByAndDescribedBy: Story = {
  play: async () => {
    const dialog = await screen.findByRole('dialog');
    await expect(dialog).toHaveAccessibleName('Account');
    await expect(dialog).toHaveAccessibleDescription('Manage sign-in.');
  },
  render: () => (
    <>
      <p id="account-name">Account</p>
      <p id="account-description">Manage sign-in.</p>
      <Dialog
        aria-describedby="account-description"
        aria-labelledby="account-name"
        defaultOpen
      >
        <p>Sign-in options.</p>
      </Dialog>
    </>
  ),
};
