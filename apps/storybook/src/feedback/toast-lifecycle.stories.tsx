import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Demo, demoStore, findToast, resetDemoStore } from './toast-demo';

const meta = {
  beforeEach: resetDemoStore,
  component: Demo,
  title: 'Feedback/Toast/Lifecycle',
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

function showArchive(title: string, work?: Promise<undefined>) {
  return demoStore.show(title, {
    action: { label: 'Undo', onPress: () => work },
    closeOnAction: false,
    id: 'archive',
  });
}

// An update in place keeps the action button, so keyboard focus stays on it.
export const UpdateKeepsFocus: Story = {
  play: async () => {
    showArchive('Archived');
    const toast = await findToast('Archived');
    within(toast).getByRole('button', { name: 'Undo' }).focus();
    showArchive('Archived 2 messages');
    await findToast('Archived 2 messages');
    await expect(document.activeElement).toHaveAccessibleName('Undo');
    await expect(document.activeElement).toHaveAttribute(
      'data-slot',
      'toast-action',
    );
  },
};

// An old action settling after an update in place leaves the newer action's
// pending state alone.
export const OldActionKeepsNewPending: Story = {
  play: async () => {
    const first = Promise.withResolvers<undefined>();
    const second = Promise.withResolvers<undefined>();
    showArchive('Archiving', first.promise);
    const toast = await findToast('Archiving');
    const undo = within(toast).getByRole('button', { name: 'Undo' });
    await userEvent.click(undo);
    showArchive('Archiving 2 messages', second.promise);
    await waitFor(async () => {
      await expect(undo).not.toHaveAttribute('data-pending');
    });
    await userEvent.click(undo);
    await waitFor(async () => {
      await expect(undo).toHaveAttribute('data-pending', 'true');
    });
    first.resolve(undefined);
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
    await expect(undo).toHaveAttribute('data-pending', 'true');
    second.resolve(undefined);
    await waitFor(async () => {
      await expect(undo).not.toHaveAttribute('data-pending');
    });
  },
};

// A toast whose exit never settles, here under an endless animation, still
// leaves.
export const ExitWithoutEnd: Story = {
  play: async () => {
    const key = demoStore.show('Saved', { duration: Infinity });
    const toast = await findToast('Saved');
    toast.animate([{ opacity: 1 }, { opacity: 0.9 }], {
      duration: 1000,
      iterations: Infinity,
    });
    demoStore.close(key);
    await waitFor(
      async () => {
        await expect(toast).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  },
};
