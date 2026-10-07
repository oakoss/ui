import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@oakoss/ui/components/ui/overlays/alert-dialog';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { AlertDemo, type AlertDemoProps, openAlert } from './alert-dialog-demo';
import { closed, dialogParts, stayedOpen } from './dialog-demo';

const meta = {
  render: (args) => <AlertDemo {...args} />,
  title: 'Overlays/Alert Dialog',
} satisfies Meta<AlertDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

function slotOf(dialog: HTMLElement, slot: string) {
  const element = dialog.querySelector(`[data-slot=${CSS.escape(slot)}]`);
  if (!(element instanceof HTMLElement)) throw new Error(`No ${slot}`);
  return element;
}

// The description is linked, focus starts on Cancel (the least destructive
// choice), and there's no close button.
export const Default: Story = {
  play: async () => {
    const dialog = await openAlert();
    await expect(dialog).toHaveAccessibleDescription(
      'Its files and history are removed for everyone.',
    );
    await waitFor(async () => {
      await expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toHaveFocus();
    });
    await expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    for (const slot of [
      'alert-dialog-action',
      'alert-dialog-cancel',
      'alert-dialog-description',
      'alert-dialog-footer',
      'alert-dialog-header',
      'alert-dialog-title',
    ]) {
      await expect(slotOf(dialog, slot)).toBeInTheDocument();
    }
    // Upstream's part names, not Dialog's.
    const { content, overlay } = dialogParts(dialog, 'alert-dialog');
    await expect(dialog).toHaveAttribute('data-slot', 'alert-dialog');
    await expect(overlay).toBeInTheDocument();
    await expect(content).toHaveAttribute('data-size', 'md');
    await expect(
      getComputedStyle(slotOf(dialog, 'alert-dialog-footer')).display,
    ).not.toBe('grid');
  },
};

// autoFocus={false} leaves focus on the dialog itself. A bare action is a
// solid primary button.
export const WithoutCancelFocus: Story = {
  play: async () => {
    const dialog = await openAlert();
    await waitFor(async () => {
      await expect(dialog).toHaveFocus();
    });
    const action = screen.getByRole('button', { name: 'Delete' });
    await expect(action).toHaveAttribute('data-intent', 'primary');
    await expect(action).toHaveAttribute('data-variant', 'solid');
  },
  render: () => (
    <AlertDialogTrigger>
      <Button variant="outline">Delete project</Button>
      <AlertDialog>
        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        <AlertDialogFooter>
          <AlertDialogCancel autoFocus={false}>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  ),
};

// A click outside doesn't dismiss it; Escape does.
export const Dismissal: Story = {
  play: async () => {
    const { overlay } = dialogParts(await openAlert(), 'alert-dialog');
    await userEvent.click(overlay, { skipHover: true });
    await stayedOpen(overlay);
    await userEvent.keyboard('{Escape}');
    await closed('alertdialog');
  },
};

export const CancelCloses: Story = {
  play: async () => {
    await openAlert();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await closed('alertdialog');
  },
};

// The small size lays the two buttons out side by side at every width.
export const Small: Story = {
  args: { size: 'sm' },
  play: async () => {
    const dialog = await openAlert();
    const footer = getComputedStyle(slotOf(dialog, 'alert-dialog-footer'));
    await expect(footer.display).toBe('grid');
    await expect(footer.gridTemplateColumns.split(' ')).toHaveLength(2);
  },
};

// Media holds an icon above the title, sized up when the icon has no size.
export const Media: Story = {
  play: async () => {
    const dialog = await screen.findByRole('alertdialog');
    const media = slotOf(dialog, 'alert-dialog-media');
    await expect(media.offsetWidth).toBe(64);
    const icon = media.querySelector('svg');
    if (!icon) throw new Error('No icon');
    await expect(getComputedStyle(icon).width).toBe('32px');
  },
  render: () => (
    <AlertDialogTrigger defaultOpen>
      <Button variant="outline">Delete project</Button>
      <AlertDialog size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <svg aria-hidden viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialog>
    </AlertDialogTrigger>
  ),
};
