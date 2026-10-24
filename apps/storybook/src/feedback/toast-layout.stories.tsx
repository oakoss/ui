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

// The close button's X sits as far from the end edge as the icon does from
// the start, in either reading direction.
async function evenEdges() {
  demoStore.show('Invite sent', { duration: Infinity }, 'success');
  const toast = await findToast('Invite sent');
  await finished(toast);
  const box = toast.getBoundingClientRect();
  const icon = toast.querySelector('[data-slot=toast-icon]');
  const x = toast.querySelector(':scope [data-slot=toast-close] svg');
  if (!icon || !x) throw new Error('No icon or close glyph in the toast');
  const start = icon.getBoundingClientRect();
  const end = x.getBoundingClientRect();
  const isRtl = getComputedStyle(toast).direction === 'rtl';
  const [iconGap, xGap] = isRtl
    ? [box.right - start.right, end.left - box.left]
    : [start.left - box.left, box.right - end.right];
  await expect(xGap).toBeCloseTo(iconGap, 0);
}

export const EvenEdges: Story = { play: evenEdges };

export const EvenEdgesRightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: evenEdges,
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
