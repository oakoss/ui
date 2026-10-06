import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, screen, userEvent } from 'storybook/test';

import {
  PopoverDemo,
  type PopoverDemoProps,
  settledPopover,
} from './popover-demo';

const meta = {
  args: { defaultOpen: true },
  render: (args) => <PopoverDemo {...args} />,
  title: 'Overlays/Popover/Layout',
} satisfies Meta<PopoverDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

function arrowRotation() {
  return arrowStyle().rotate;
}

function arrowStyle() {
  const svg = document.querySelector('[data-slot=popover-arrow] svg');
  if (!(svg instanceof SVGElement)) throw new Error('No arrow');
  return getComputedStyle(svg);
}

// With an arrow the panel sits 12px out, and the arrow, filled like the panel,
// points at the trigger.
export const Arrow: Story = {
  args: { showArrow: true },
  play: async () => {
    const { box, panel, trigger } = await settledPopover();
    await expect(Math.round(box.top - trigger.bottom)).toBe(12);
    await expect(arrowRotation()).toBe('180deg');
    await expect(arrowStyle().fill).toBe(
      getComputedStyle(panel).backgroundColor,
    );
  },
};

export const ArrowOnLeft: Story = {
  args: { placement: 'left', showArrow: true },
  play: async () => {
    const { box, trigger } = await settledPopover();
    await expect(Math.abs(trigger.left - box.right - 12)).toBeLessThan(1);
    await expect(arrowRotation()).toBe('-90deg');
  },
};

export const ArrowOnTop: Story = {
  args: { placement: 'top', showArrow: true },
  play: async () => {
    const { box, trigger } = await settledPopover();
    await expect(Math.round(trigger.top - box.bottom)).toBe(12);
    await expect(arrowRotation()).toBe('none');
  },
};

// React Aria resolves `start` from the locale: right of the trigger in a
// right-to-left locale.
export const StartRightToLeft: Story = {
  args: { placement: 'start', showArrow: true },
  globals: { locale: 'ar-EG' },
  play: async () => {
    const { box, panel, trigger } = await settledPopover();
    await expect(panel).toHaveAttribute('data-placement', 'right');
    // React Aria rounds the position; the trigger's edge is fractional.
    await expect(Math.abs(box.left - trigger.right - 12)).toBeLessThan(1);
    await expect(arrowRotation()).toBe('90deg');
  },
};

// Tall content scrolls inside PopoverBody while the header stays put.
export const ScrollingBody: Story = {
  args: { rows: 60 },
  play: async () => {
    const { box, dialog, panel } = await settledPopover();
    const body = dialog.querySelector('[data-slot=dialog-body]');
    if (!(body instanceof HTMLElement)) throw new Error('No body');
    await expect(box.bottom).toBeLessThanOrEqual(innerHeight);
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    await expect(panel.scrollHeight).toBe(panel.clientHeight);
    // The body spans the dialog, so its focus ring isn't clipped and the
    // dialog itself doesn't scroll.
    body.focus();
    await expect(dialog.scrollWidth).toBe(dialog.clientWidth);
    await expect(dialog.scrollHeight).toBe(dialog.clientHeight);
    const bodyBox = body.getBoundingClientRect();
    const dialogBox = dialog.getBoundingClientRect();
    await expect(bodyBox.left).toBeGreaterThanOrEqual(dialogBox.left);
    await expect(bodyBox.right).toBeLessThanOrEqual(dialogBox.right);
    body.scrollTop = body.scrollHeight;
    await expect(
      screen.getByRole('heading', { name: 'Dimensions' }),
    ).toBeVisible();
  },
};

// Without PopoverBody, the whole popover scrolls inside the space React Aria
// gives it; tabbing to a control inside scrolls it into view.
export const TallWithoutBody: Story = {
  args: { rows: 60, withBody: false },
  play: async () => {
    const { box, dialog } = await settledPopover();
    await expect(box.bottom).toBeLessThanOrEqual(innerHeight);
    await userEvent.tab();
    const apply = screen.getByRole('button', { name: 'Apply' });
    await expect(apply).toHaveFocus();
    await expect(dialog.scrollTop).toBeGreaterThan(0);
    await expect(apply.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      dialog.getBoundingClientRect().bottom,
    );
  },
};

// Windows High Contrast drops the ring and shadow, so the panel keeps a border
// and the arrow takes system colors.
export const ForcedColors: Story = {
  args: { showArrow: true },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const { panel } = await settledPopover();
    const style = getComputedStyle(panel);
    await expect(style.borderTopWidth).toBe('1px');
    const svg = document.querySelector('[data-slot=popover-arrow] svg');
    if (!(svg instanceof SVGElement)) throw new Error('No arrow');
    const arrow = getComputedStyle(svg);
    await expect(arrow.fill).toBe(style.backgroundColor);
    await expect(arrow.stroke).toBe(style.borderTopColor);
  },
  tags: ['forced-colors'],
};
