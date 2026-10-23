import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { part } from '#/helpers/parts';
import { settled } from '#/overlays/overlay-test';

import { Demo, demoStore, findToast, resetDemoStore } from './toast-demo';

const meta = {
  beforeEach: resetDemoStore,
  component: Demo,
  title: 'Feedback/Toast/Options',
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

const forever = { duration: Infinity } as const;

// messages replaces React Aria's labels for the close button, the pending
// action and the region.
export const Messages: Story = {
  args: {
    messages: {
      close: 'Dismiss',
      pending: 'Working',
      region: (count) => `Alerts (${String(count)})`,
    },
  },
  play: async () => {
    demoStore.show('Message archived', {
      action: { label: 'Undo', onPress: () => Promise.withResolvers().promise },
    });
    const toast = await findToast('Message archived');
    await expect(screen.getByRole('region')).toHaveAccessibleName('Alerts (1)');
    await expect(
      within(toast).getByRole('button', { name: 'Dismiss' }),
    ).toBeInTheDocument();
    await userEvent.click(within(toast).getByRole('button', { name: 'Undo' }));
    await waitFor(async () => {
      await expect(
        within(toast).getByRole('progressbar', { name: 'Working' }),
      ).toBeInTheDocument();
    });
  },
};

// icons replaces an intent's default icon, null hides it, and a toast's own
// icon still wins.
export const Icons: Story = {
  args: {
    icons: { success: <span data-testid="custom-success" />, warning: null },
  },
  play: async () => {
    demoStore.show('Saved', forever, 'success');
    const own = <span data-testid="own" />;
    demoStore.show('Sent', { ...forever, icon: own }, 'success');
    demoStore.show('Low storage', forever, 'warning');
    const saved = await findToast('Saved');
    const sent = await findToast('Sent');
    const warning = await findToast('Low storage');
    await expect(
      within(saved).getByTestId('custom-success'),
    ).toBeInTheDocument();
    await expect(within(sent).getByTestId('own')).toBeInTheDocument();
    await expect(within(sent).queryByTestId('custom-success')).toBeNull();
    await expect(warning.querySelector('[data-slot=toast-icon]')).toBeNull();
  },
};

// A blank close message keeps React Aria's label, so the button stays named.
export const BlankCloseMessage: Story = {
  args: { messages: { close: ' ' } },
  play: async () => {
    demoStore.show('Saved', forever);
    const toast = await findToast('Saved');
    await expect(
      within(toast).getByRole('button', { name: 'Close' }),
    ).toBeInTheDocument();
  },
};

// duration sets the default for toasts that don't set their own.
export const Duration: Story = {
  args: { duration: 8000 },
  play: async () => {
    demoStore.show('Saved');
    await findToast('Saved');
    await expect(demoStore.visibleToasts[0]?.content.duration).toBe(8000);
  },
};

// bottom center sits centred on the bottom edge, newest nearest it.
export const BottomCenter: Story = {
  args: { placement: 'bottom center' },
  play: async () => {
    demoStore.show('Older', forever);
    demoStore.show('Newer', forever);
    const older = await findToast('Older');
    const newer = await findToast('Newer');
    await settled(newer);
    const region = part('toast-viewport').getBoundingClientRect();
    await expect(region.bottom).toBe(innerHeight);
    await expect(
      Math.abs(region.left + region.width / 2 - innerWidth / 2),
    ).toBeLessThan(1);
    await expect(newer.getBoundingClientRect().top).toBeGreaterThan(
      older.getBoundingClientRect().top,
    );
  },
};

// top end stacks newest first from the top edge.
export const TopEnd: Story = {
  args: { placement: 'top end' },
  play: async () => {
    demoStore.show('Older', forever);
    demoStore.show('Newer', forever);
    const older = await findToast('Older');
    const newer = await findToast('Newer');
    await settled(newer);
    const region = part('toast-viewport').getBoundingClientRect();
    await expect(region.top).toBe(0);
    await expect(region.right).toBe(document.documentElement.clientWidth);
    await expect(newer.getBoundingClientRect().top).toBeLessThan(
      older.getBoundingClientRect().top,
    );
  },
};
