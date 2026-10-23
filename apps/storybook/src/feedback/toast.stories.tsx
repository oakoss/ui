import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { part } from '#/helpers/parts';

import {
  Demo,
  demoStore,
  findToast,
  gone,
  liveRegion,
  messages,
  resetDemoStore,
} from './toast-demo';

const meta = {
  beforeEach: resetDemoStore,
  component: Demo,
  title: 'Feedback/Toast',
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

const forever = { duration: Infinity } as const;

// A non-modal alertdialog in a landmark named for its count, announced once
// through the polite live region rather than as an alert.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(screen.queryByRole('region')).toBeNull();
    // The live regions wait, empty, before the first toast.
    const polite = liveRegion('polite');
    await expect(messages('polite')).toEqual([]);
    await expect(messages('assertive')).toEqual([]);
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    const toast = await findToast('Changes saved');
    await expect(toast).toHaveAccessibleDescription(
      'All files are up to date.',
    );
    await expect(screen.getByRole('region')).toHaveAccessibleName(
      '1 notification.',
    );
    await expect(within(toast).queryByRole('alert')).toBeNull();
    await expect(
      within(toast).getByRole('button', { name: 'Close' }),
    ).toHaveAttribute('data-slot', 'toast-close');
    await waitFor(async () => {
      await expect(messages('polite')).toEqual([
        'Changes saved. All files are up to date.',
      ]);
    });
    await expect(liveRegion('polite')).toBe(polite);
    await expect(messages('assertive')).toEqual([]);
  },
};

// With no description, nothing points at one.
export const TitleOnly: Story = {
  play: async () => {
    demoStore.show('Draft kept', forever);
    const toast = await findToast('Draft kept');
    await expect(toast).not.toHaveAttribute('aria-describedby');
    await expect(toast).toHaveAccessibleDescription('');
  },
};

// Updating by id with the same text only restarts its timer, so it isn't
// announced again.
export const SameTextNotReannounced: Story = {
  play: async () => {
    demoStore.show('Saved', { ...forever, id: 'save' });
    await findToast('Saved');
    await waitFor(async () => {
      await expect(messages('polite')).toEqual(['Saved.']);
    });
    demoStore.show('Saved', { ...forever, id: 'save' });
    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });
    await expect(messages('polite')).toEqual(['Saved.']);
  },
};

// Each intent shows its icon, hidden from screen readers; only destructive
// interrupts, through the assertive region.
export const Intents: Story = {
  play: async () => {
    demoStore.show('Draft kept', forever, 'neutral');
    demoStore.show('Sync scheduled', forever, 'info');
    demoStore.show('Profile updated', forever, 'success');
    await findToast('Profile updated');
    for (const name of ['Sync scheduled', 'Profile updated']) {
      const icon = part('toast-icon', await findToast(name));
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
    }
    const neutral = await findToast('Draft kept');
    await expect(neutral.querySelector('[data-slot=toast-icon]')).toBeNull();
    demoStore.setLimit(5);
    demoStore.show('Storage almost full', forever, 'warning');
    demoStore.show('Upload failed', forever, 'destructive');
    await findToast('Upload failed');
    await waitFor(async () => {
      await expect(messages('assertive')).toEqual(['Upload failed.']);
    });
    await expect(messages('polite')).not.toContain('Upload failed.');
  },
};

// The close button closes it, the exit plays, and it leaves the page.
export const CloseButton: Story = {
  play: async () => {
    const onClose = (reason: string) => {
      reasons.push(reason);
    };
    const reasons: string[] = [];
    demoStore.show('Changes saved', { ...forever, onClose });
    const toast = await findToast('Changes saved');
    await userEvent.click(within(toast).getByRole('button', { name: 'Close' }));
    await gone('Changes saved');
    await expect(reasons).toEqual(['user']);
    await expect(screen.queryByRole('region')).toBeNull();
  },
};

// Escape closes the focused toast; focus moves to the one beside it.
export const EscapeCloses: Story = {
  play: async () => {
    demoStore.show('First', forever);
    demoStore.show('Second', forever);
    const second = await findToast('Second');
    second.focus();
    await userEvent.keyboard('{Escape}');
    await gone('Second');
    await waitFor(async () => {
      await expect(await findToast('First')).toHaveFocus();
    });
  },
};

// Updating by id announces the new content again.
export const UpdateAnnounces: Story = {
  play: async () => {
    demoStore.show('Saving', { id: 'save' }, 'loading');
    await findToast('Saving');
    demoStore.show('Saved', { ...forever, id: 'save' }, 'success');
    await findToast('Saved');
    await waitFor(async () => {
      await expect(messages('polite')).toEqual(['Saving.', 'Saved.']);
    });
    await expect(screen.getAllByRole('alertdialog')).toHaveLength(1);
  },
};

// Past the limit the oldest closes.
export const Limit: Story = {
  args: { limit: 1 },
  play: async () => {
    demoStore.show('One', forever);
    demoStore.show('Two', forever);
    await findToast('Two');
    await gone('One');
    await expect(screen.getAllByRole('alertdialog')).toHaveLength(1);
  },
};

// A custom toast draws itself and is named and announced by its title.
export const Custom: Story = {
  play: async () => {
    demoStore.show('Invite sent', {
      ...forever,
      custom: () => <p className="text-sm">Ana can now edit this file.</p>,
    });
    const toast = await findToast('Invite sent');
    await expect(toast).toHaveTextContent('Ana can now edit this file.');
    await expect(toast).not.toHaveAttribute('aria-describedby');
    await waitFor(async () => {
      await expect(messages('polite')).toEqual(['Invite sent.']);
    });
  },
};

// A custom toast without a string title, or with a blank one, is named and
// announced by its own text.
export const CustomWithoutTitle: Story = {
  play: async () => {
    demoStore.show(null, {
      ...forever,
      custom: () => <p className="text-sm">Ana joined the file</p>,
    });
    demoStore.show(' ', {
      ...forever,
      custom: () => <p className="text-sm">Ben left the file</p>,
    });
    const joined = await findToast('Ana joined the file');
    await findToast('Ben left the file');
    await expect(joined).not.toHaveAttribute('aria-describedby');
    await waitFor(async () => {
      await expect(messages('polite')).toHaveLength(2);
    });
    await expect(messages('polite')).toEqual(
      expect.arrayContaining(['Ana joined the file.', 'Ben left the file.']),
    );
  },
};
