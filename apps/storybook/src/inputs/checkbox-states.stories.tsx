import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from '@oakoss/ui/components/ui/inputs/checkbox';
import { expect, userEvent } from 'storybook/test';

import { contrast, tokenColor } from '../color';
import { part } from '../parts';

const meta = {
  args: { children: 'Sync folders' },
  component: Checkbox,
  title: 'Inputs/Checkbox/States',
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

function box() {
  return getComputedStyle(part('checkbox-indicator'));
}

// The box's border meets 3:1 against the page, so it reads as a control.
export const Border: Story = {
  play: async () => {
    await expect(
      contrast(
        box().borderTopColor,
        getComputedStyle(document.body).backgroundColor,
      ),
    ).toBeGreaterThan(3);
  },
};

// Keyboard focus draws the ring around the box.
export const FocusRing: Story = {
  play: async () => {
    await expect(box().outlineStyle).toBe('none');
    await userEvent.tab();
    await expect(box().outlineStyle).toBe('solid');
  },
};

// A checked box that's invalid keeps its error border.
export const InvalidChecked: Story = {
  args: { defaultSelected: true, isInvalid: true },
  play: async ({ canvasElement }) => {
    await expect(box().borderTopColor).toBe(
      tokenColor('--color-destructive-text', canvasElement),
    );
    await expect(box().backgroundColor).toBe(
      tokenColor('--color-primary', canvasElement),
    );
  },
};

// The box's hit area grows to 44px, and turns off where checkboxes sit
// closer than that.
export const TargetSize: Story = {
  play: async () => {
    const area = getComputedStyle(part('checkbox-indicator'), '::after');
    await expect(area.minWidth).toBe('44px');
    await expect(area.minHeight).toBe('44px');
  },
};

export const TargetSizeOff: Story = {
  args: { targetSize: false },
  play: async () => {
    await expect(
      getComputedStyle(part('checkbox-indicator'), '::after').minWidth,
    ).not.toBe('44px');
    // The row still meets the 24px minimum.
    await expect(
      part('checkbox').getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(24);
  },
};

// Forced colors keep the box's outline and repaint a checked box in a
// system color, with the check in another, so checked still reads.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const page = getComputedStyle(document.body).backgroundColor;
    await expect(box().borderTopColor).not.toBe(page);
    await userEvent.click(part('checkbox'));
    await Promise.all(
      part('checkbox-indicator')
        .getAnimations()
        .map((animation) => animation.finished),
    );
    const fill = box().backgroundColor;
    await expect(contrast(fill, page)).toBeGreaterThan(3);
    const check = part('checkbox-indicator').querySelector('svg');
    if (!check) throw new Error('No check');
    await expect(contrast(getComputedStyle(check).color, fill)).toBeGreaterThan(
      3,
    );
  },
  tags: ['forced-colors'],
};

// An invalid box stays visible in forced colors, where the error text says
// why.
export const ForcedColorsInvalid: Story = {
  args: { isInvalid: true },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    await expect(
      contrast(
        box().borderTopColor,
        getComputedStyle(document.body).backgroundColor,
      ),
    ).toBeGreaterThan(3);
  },
  tags: ['forced-colors'],
};
