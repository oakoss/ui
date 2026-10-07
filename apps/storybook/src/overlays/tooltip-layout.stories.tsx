import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect } from 'storybook/test';

import { expectSlide } from './overlay-test';
import {
  settledTooltip,
  tooltipArrow,
  TooltipDemo,
  type TooltipDemoProps,
} from './tooltip-demo';

const meta = {
  args: { defaultOpen: true },
  render: (args) => <TooltipDemo {...args} />,
  title: 'Overlays/Tooltip/Layout',
} satisfies Meta<TooltipDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// Above the trigger by default, inverted against the page, with an arrow in
// the tooltip's color pointing down at the trigger.
export const Default: Story = {
  play: async () => {
    const { box, tooltip, trigger } = await settledTooltip();
    const style = getComputedStyle(tooltip);
    const page = getComputedStyle(document.body);
    await expect(tooltip).toHaveAttribute('data-placement', 'top');
    await expect(Math.abs(trigger.top - box.bottom - 10)).toBeLessThan(1);
    await expect(style.backgroundColor).toBe(page.color);
    await expect(style.color).toBe(page.backgroundColor);
    await expect(tooltipArrow().rotate).toBe('none');
    await expect(tooltipArrow().fill).toBe(style.backgroundColor);
    await expect(tooltipArrow().stroke).toBe('none');
    // The border only shows in forced colors.
    await expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)');
  },
};

export const Bottom: Story = {
  args: { placement: 'bottom' },
  play: async () => {
    await settledTooltip();
    await expect(tooltipArrow().rotate).toBe('180deg');
  },
};

export const Left: Story = {
  args: { placement: 'left' },
  play: async () => {
    await settledTooltip();
    await expect(tooltipArrow().rotate).toBe('-90deg');
  },
};

export const Right: Story = {
  args: { placement: 'right' },
  play: async () => {
    await settledTooltip();
    await expect(tooltipArrow().rotate).toBe('90deg');
  },
};

// Long text wraps at 20rem.
export const Wraps: Story = {
  args: {
    text: 'Saves every open document and uploads them to the shared workspace, replacing older copies.',
  },
  play: async () => {
    const { box } = await settledTooltip();
    await expect(box.width).toBe(320);
  },
};

// The tooltip enters from, and exits toward, 4px nearer the trigger.
export const Slide: Story = {
  play: async () => {
    const { tooltip } = await settledTooltip();
    await expectSlide(tooltip, '0px 4px');
  },
};

export const SlideBottom: Story = {
  args: { placement: 'bottom' },
  play: async () => {
    const { tooltip } = await settledTooltip();
    await expectSlide(tooltip, '0px -4px');
  },
};

export const SlideLeft: Story = {
  args: { placement: 'left' },
  play: async () => {
    const { tooltip } = await settledTooltip();
    await expectSlide(tooltip, '4px');
  },
};

export const SlideRight: Story = {
  args: { placement: 'right' },
  play: async () => {
    const { tooltip } = await settledTooltip();
    await expectSlide(tooltip, '-4px');
  },
};

// Windows High Contrast keeps a border, and the arrow takes the tooltip's
// system colors.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const { tooltip } = await settledTooltip();
    const style = getComputedStyle(tooltip);
    await expect(style.borderTopWidth).toBe('1px');
    await expect(tooltipArrow().fill).toBe(style.backgroundColor);
    await expect(tooltipArrow().stroke).toBe(style.borderTopColor);
  },
  tags: ['forced-colors'],
};
