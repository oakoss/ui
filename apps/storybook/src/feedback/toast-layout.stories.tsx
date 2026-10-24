import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect } from 'storybook/test';

import { finished } from '#/overlays/overlay-test';

import { Demo, demoStore, findToast, resetDemoStore } from './toast-demo';

const meta = {
  beforeEach: resetDemoStore,
  component: Demo,
  title: 'Feedback/Toast/Layout',
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

// The text sits as far from the toast's top as from its bottom, and the
// icon and close button center on the title's line.
async function centersOnTitle(name: string, slots: readonly string[]) {
  const { box, part } = await settledToast(name);
  const title = part('toast-title');
  await expect(box.bottom - title.bottom).toBeCloseTo(title.top - box.top, 0);
  for (const slot of slots) {
    await expect(middle(part(slot))).toBeCloseTo(middle(title), 0);
  }
}

function middle(box: DOMRect) {
  return box.top + box.height / 2;
}

async function settledToast(name: string) {
  const toast = await findToast(name);
  await finished(toast);
  const part = (slot: string) => {
    const element = toast.querySelector(`[data-slot=${CSS.escape(slot)}]`);
    if (!element) throw new Error(`No ${slot} in the toast`);
    return element.getBoundingClientRect();
  };
  return { box: toast.getBoundingClientRect(), part };
}

// A one-line toast keeps even padding: its close button doesn't make it
// taller than its text.
export const OneLine: Story = {
  play: async () => {
    demoStore.show('Invite sent', { duration: Infinity }, 'success');
    await centersOnTitle('Invite sent', ['toast-icon', 'toast-close']);
  },
};

export const OneLineWithAction: Story = {
  play: async () => {
    demoStore.show('Thread archived', {
      action: { label: 'Undo', onPress: () => undefined },
    });
    await centersOnTitle('Thread archived', ['toast-action', 'toast-close']);
  },
};

// With a description, the icon and close button stay on the title's line.
export const WithDescription: Story = {
  play: async () => {
    demoStore.show(
      'Upload failed',
      {
        description: 'Check your connection and try again.',
        duration: Infinity,
      },
      'destructive',
    );
    const { part } = await settledToast('Upload failed');
    const title = middle(part('toast-title'));
    await expect(middle(part('toast-icon'))).toBeCloseTo(title, 0);
    await expect(middle(part('toast-close'))).toBeCloseTo(title, 0);
  },
};
