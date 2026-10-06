import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect } from 'storybook/test';

import {
  PopoverDemo,
  type PopoverDemoProps,
  settledPopover,
  stateStyle,
} from './popover-demo';

const meta = {
  args: { defaultOpen: true },
  render: (args) => <PopoverDemo {...args} />,
  title: 'Overlays/Popover/Motion',
} satisfies Meta<PopoverDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// The panel enters from, and exits toward, 4px nearer the trigger, fading and
// scaling from 95%.
async function expectSlide(translate: string) {
  const { panel } = await settledPopover();
  for (const state of ['entering', 'exiting'] as const) {
    await expect({ state, ...(await stateStyle(panel, state)) }).toEqual({
      opacity: '0',
      scale: '0.95',
      state,
      translate,
    });
  }
}

export const Bottom: Story = {
  play: async () => {
    await expectSlide('0px -4px');
  },
};

export const Top: Story = {
  args: { placement: 'top' },
  play: async () => {
    await expectSlide('0px 4px');
  },
};

export const Left: Story = {
  args: { placement: 'left' },
  play: async () => {
    await expectSlide('4px');
  },
};

export const Right: Story = {
  args: { placement: 'right' },
  play: async () => {
    await expectSlide('-4px');
  },
};

export const Transition: Story = {
  play: async () => {
    const { panel } = await settledPopover();
    const style = getComputedStyle(panel);
    await expect(style.transitionDuration).toBe('0.15s');
    await expect(style.transitionProperty).toMatch(/translate/u);
  },
};
