import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect } from 'storybook/test';

import { freezeDate } from './date';

const meta = { render: () => <></>, title: 'Internal/Date' } satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const recent = new Date(2020, 0, 1).getTime();

// Each restore puts back the real clock, not the one before it, so a story's
// freeze over its meta's unwinds in either order.
export const Restore: Story = {
  play: async () => {
    const outer = freezeDate(new Date(2000, 0, 1));
    const inner = freezeDate(new Date(2001, 0, 1));
    try {
      outer();
      await expect(Date.now()).toBeGreaterThan(recent);
    } finally {
      inner();
    }
    await expect(Date.now()).toBeGreaterThan(recent);
  },
};

export const InvalidDate: Story = {
  play: async () => {
    await expect(() => freezeDate(new Date('not a date'))).toThrow(
      'freezeDate needs a valid date',
    );
  },
};
