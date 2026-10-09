import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch } from '@oakoss/ui/components/ui/inputs/switch';
import { expect, userEvent } from 'storybook/test';

import { contrast } from '../color';
import { part } from '../parts';

const meta = {
  args: { children: 'Airplane mode' },
  component: Switch,
  title: 'Inputs/Switch/States',
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

function page() {
  return getComputedStyle(document.body).backgroundColor;
}

function rect(slot: string) {
  return part(slot).getBoundingClientRect();
}

async function settle() {
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished),
  );
}

function style(slot: string) {
  return getComputedStyle(part(slot));
}

// The off track meets 3:1 against the page, so it reads as a control.
export const Track: Story = {
  play: async () => {
    const fill = style('switch-track').backgroundColor;
    await expect(contrast(fill, page())).toBeGreaterThan(3);
    await expect(rect('switch-track').width).toBe(36);
    await expect(rect('switch-track').height).toBe(20);
  },
};

export const Small: Story = {
  args: { size: 'sm' },
  play: async () => {
    await expect(rect('switch-track').width).toBe(28);
    await expect(rect('switch-thumb').width).toBe(12);
  },
};

// On, the thumb travels to the track's far end and stays inside it, in
// either direction.
export const Thumb: Story = {
  play: async () => {
    const off = rect('switch-thumb');
    await expect(Math.round(off.left - rect('switch-track').left)).toBe(3);
    await userEvent.click(part('switch'));
    await settle();
    const track = rect('switch-track');
    const on = rect('switch-thumb');
    await expect(Math.round(track.right - on.right)).toBe(3);
  },
};

export const ThumbRightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    await userEvent.click(part('switch'));
    await settle();
    const track = rect('switch-track');
    const on = rect('switch-thumb');
    await expect(Math.round(on.left - track.left)).toBe(3);
    await expect(on.left).toBeGreaterThanOrEqual(track.left);
  },
};

export const ThumbSmall: Story = {
  args: { defaultSelected: true, size: 'sm' },
  play: async () => {
    const track = rect('switch-track');
    await expect(Math.round(track.right - rect('switch-thumb').right)).toBe(3);
  },
};

export const FocusRing: Story = {
  play: async () => {
    await userEvent.tab();
    await expect(getComputedStyle(part('switch-track')).outlineStyle).toBe(
      'solid',
    );
  },
};

export const TargetSize: Story = {
  play: async () => {
    const area = getComputedStyle(part('switch-track'), '::after');
    await expect(area.minWidth).toBe('44px');
  },
};

export const TargetSizeOff: Story = {
  args: { targetSize: false },
  play: async () => {
    const area = getComputedStyle(part('switch-track'), '::after');
    await expect(area.minWidth).not.toBe('44px');
    await expect(rect('switch').height).toBeGreaterThanOrEqual(24);
  },
};

// Forced colors keep the track outlined and the thumb visible against it,
// off and on.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const border = style('switch-track').borderTopColor;
    await expect(contrast(border, page())).toBeGreaterThan(3);
    const offThumb = style('switch-thumb').backgroundColor;
    await expect(contrast(offThumb, page())).toBeGreaterThan(3);
    await userEvent.click(part('switch'));
    await settle();
    const onThumb = style('switch-thumb').backgroundColor;
    const onTrack = style('switch-track').backgroundColor;
    await expect(contrast(onThumb, onTrack)).toBeGreaterThan(3);
  },
  tags: ['forced-colors'],
};
