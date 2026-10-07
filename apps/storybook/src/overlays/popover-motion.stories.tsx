import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect } from 'storybook/test';

import { expectSlide } from './overlay-test';
import {
  PopoverDemo,
  type PopoverDemoProps,
  settledPopover,
} from './popover-demo';

const meta = {
  args: { defaultOpen: true },
  render: (args) => <PopoverDemo {...args} />,
  title: 'Overlays/Popover/Motion',
} satisfies Meta<PopoverDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// The panel enters from, and exits toward, 4px nearer the trigger.
export const Bottom: Story = {
  play: async () => {
    const { panel } = await settledPopover();
    await expectSlide(panel, '0px -4px');
  },
};

export const Top: Story = {
  args: { placement: 'top' },
  play: async () => {
    const { panel } = await settledPopover();
    await expectSlide(panel, '0px 4px');
  },
};

export const Left: Story = {
  args: { placement: 'left' },
  play: async () => {
    const { panel } = await settledPopover();
    await expectSlide(panel, '4px');
  },
};

export const Right: Story = {
  args: { placement: 'right' },
  play: async () => {
    const { panel } = await settledPopover();
    await expectSlide(panel, '-4px');
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
