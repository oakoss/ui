import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@oakoss/ui/components/ui/inputs/toggle-group';
import { expect } from 'storybook/test';

import { contrast } from '../color';

const meta = {
  args: { 'aria-label': 'Text style', selectionMode: 'multiple' },
  component: ToggleGroup,
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem id="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem id="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem id="underline">Underline</ToggleGroupItem>
    </ToggleGroup>
  ),
  title: 'Inputs/Toggle Group/States',
} satisfies Meta<typeof ToggleGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

function page() {
  return getComputedStyle(document.body).backgroundColor;
}

async function settled(name: string) {
  const item = document.querySelector<HTMLElement>(
    `[data-slot=toggle-group-item]:nth-child(${name})`,
  );
  if (!item) throw new Error(`No item ${name}`);
  delete item.dataset.hovered;
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished),
  );
  return getComputedStyle(item);
}

// A selected item takes Toggle's solid fill, with readable text.
export const Selected: Story = {
  args: { defaultSelectedKeys: ['bold'] },
  play: async () => {
    const style = await settled('1');
    await expect(contrast(style.backgroundColor, page())).toBeGreaterThan(3);
    await expect(contrast(style.color, style.backgroundColor)).toBeGreaterThan(
      4.5,
    );
    const off = await settled('2');
    await expect(off.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  },
};

// Joined, two selected neighbors keep a page-colored line between them
// rather than merging into one block.
export const JoinedSelectedNeighbors: Story = {
  args: {
    defaultSelectedKeys: ['bold', 'italic'],
    joined: true,
    variant: 'outline',
  },
  play: async () => {
    const second = await settled('2');
    await expect(second.borderInlineStartColor).toBe(page());
    await expect(
      contrast(second.borderInlineStartColor, second.backgroundColor),
    ).toBeGreaterThan(3);
  },
};

// Forced colors give a selected item the system's selection colors, and
// joined neighbors stay apart by a text-colored border.
export const ForcedColors: Story = {
  args: {
    defaultSelectedKeys: ['bold', 'italic'],
    joined: true,
    variant: 'outline',
  },
  // In High Contrast the user's system colors set contrast, and axe's rule
  // misreads the forced colors.
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const second = await settled('2');
    const off = await settled('3');
    await expect(second.backgroundColor).not.toBe(off.backgroundColor);
    await expect(
      contrast(second.color, second.backgroundColor),
    ).toBeGreaterThan(4.5);
    await expect(
      contrast(second.borderInlineStartColor, second.backgroundColor),
    ).toBeGreaterThan(3);
  },
  tags: ['forced-colors'],
};
