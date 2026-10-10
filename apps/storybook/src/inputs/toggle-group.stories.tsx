import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ToggleGroup,
  ToggleGroupItem,
} from '@oakoss/ui/components/ui/inputs/toggle-group';
import { expect, userEvent } from 'storybook/test';

const meta = {
  args: { 'aria-label': 'Alignment' },
  component: ToggleGroup,
  render: (args) => (
    <ToggleGroup {...args}>
      <ToggleGroupItem id="start">Start</ToggleGroupItem>
      <ToggleGroupItem id="center">Center</ToggleGroupItem>
      <ToggleGroupItem id="end">End</ToggleGroupItem>
    </ToggleGroup>
  ),
  title: 'Inputs/Toggle Group',
} satisfies Meta<typeof ToggleGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

// The items, whichever role the selection mode gives them.
function controls() {
  return [
    ...document.querySelectorAll<HTMLElement>('[data-slot=toggle-group-item]'),
  ];
}

function items() {
  return controls().map((item) => item.getBoundingClientRect());
}

function styles() {
  return controls().map((item) => getComputedStyle(item));
}

// Single selection is a radio group with one Tab stop; arrows move focus
// without selecting.
export const Single: Story = {
  args: { selectionMode: 'single' },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('radiogroup', { name: 'Alignment' });
    await expect(group).toHaveAttribute('data-slot', 'toggle-group');
    await userEvent.click(canvas.getByRole('radio', { name: 'Center' }));
    await expect(canvas.getByRole('radio', { name: 'Center' })).toBeChecked();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('radio', { name: 'End' })).toHaveFocus();
    await expect(canvas.getByRole('radio', { name: 'End' })).not.toBeChecked();
  },
};

// Pressing the selected item again clears it, as in React Aria, unless
// disallowEmptySelection is set.
export const Deselect: Story = {
  args: { defaultSelectedKeys: ['center'], selectionMode: 'single' },
  play: async ({ canvas }) => {
    const center = canvas.getByRole('radio', { name: 'Center' });
    await userEvent.click(center);
    await expect(center).not.toBeChecked();
  },
};

export const DisallowEmptySelection: Story = {
  args: {
    defaultSelectedKeys: ['center'],
    disallowEmptySelection: true,
    selectionMode: 'single',
  },
  play: async ({ canvas }) => {
    const center = canvas.getByRole('radio', { name: 'Center' });
    await userEvent.click(center);
    await expect(center).toBeChecked();
  },
};

// Multiple selection is a toolbar of pressed buttons.
export const Multiple: Story = {
  args: { 'aria-label': 'Text style', selectionMode: 'multiple' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('toolbar', { name: 'Text style' }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Start' }));
    await userEvent.click(canvas.getByRole('button', { name: 'End' }));
    for (const name of ['Start', 'End']) {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    }
  },
};

// Items take the group's size and variant, unless they set their own.
export const SizeAndVariant: Story = {
  play: async () => {
    const [start, center] = controls();
    await expect(start).toHaveAttribute('data-size', 'sm');
    await expect(start).toHaveAttribute('data-variant', 'outline');
    await expect(center).toHaveAttribute('data-size', 'lg');
    await expect(center).toHaveAttribute('data-variant', 'ghost');
    // Attributes alone would pass with the group's styles on every item.
    const [startBox, centerBox] = items();
    await expect(startBox?.height).toBeLessThan(centerBox?.height ?? 0);
    const [startStyle, centerStyle] = styles();
    await expect(startStyle?.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(centerStyle?.borderTopColor).toBe('rgba(0, 0, 0, 0)');
  },
  render: (args) => (
    <ToggleGroup {...args} size="sm" variant="outline">
      <ToggleGroupItem id="start">Start</ToggleGroupItem>
      <ToggleGroupItem id="center" size="lg" variant="ghost">
        Center
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

// Items sit 8px apart, and a consumer's style keeps that gap. Their 44px hit
// areas would overlap there, so they're off.
export const Spacing: Story = {
  args: { style: { color: 'inherit' } },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radiogroup').style.color).toBe('inherit');
    const [start, center] = items();
    if (!start || !center) throw new Error('No items');
    await expect(center.left - start.right).toBe(8);
    const [first] = controls();
    if (!first) throw new Error('No items');
    await expect(getComputedStyle(first, '::after').minWidth).not.toBe('44px');
  },
};

// The group and its items take a consumer's className.
export const ConsumerClassName: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radiogroup')).toHaveClass('p-1');
    const [start] = controls();
    await expect(start).toHaveClass('rounded-full');
    await expect(start).not.toHaveClass('rounded-control');
  },
  render: (args) => (
    <ToggleGroup {...args} className="p-1">
      <ToggleGroupItem className="rounded-full" id="start">
        Start
      </ToggleGroupItem>
      <ToggleGroupItem id="center">Center</ToggleGroupItem>
    </ToggleGroup>
  ),
};

// Joined items share their borders and keep only the outer corners.
export const Joined: Story = {
  args: { joined: true, variant: 'outline' },
  play: async () => {
    const [start, center, end] = items();
    if (!start || !center || !end) throw new Error('No items');
    await expect(center.left).toBe(start.right - 1);
    const [first, middle, last] = styles();
    await expect(first?.borderTopLeftRadius).not.toBe('0px');
    await expect(first?.borderTopRightRadius).toBe('0px');
    await expect(middle?.borderTopLeftRadius).toBe('0px');
    await expect(last?.borderTopRightRadius).not.toBe('0px');
  },
};

// A pressed joined item keeps its size, so it doesn't pull away from its
// neighbors.
export const JoinedPress: Story = {
  args: { joined: true, variant: 'outline' },
  play: async () => {
    const center = document.querySelectorAll<HTMLElement>(
      '[data-slot=toggle-group-item]',
    )[1];
    if (!center) throw new Error('No item');
    const rest = center.getBoundingClientRect().width;
    center.dataset.pressed = 'true';
    await Promise.all(center.getAnimations().map((a) => a.finished));
    await expect(center.getBoundingClientRect().width).toBe(rest);
  },
};

// Right to left, the first item's rounded corners are on the right.
export const JoinedRightToLeft: Story = {
  args: { joined: true, variant: 'outline' },
  globals: { locale: 'ar-EG' },
  play: async () => {
    const [first] = styles();
    await expect(first?.borderTopRightRadius).not.toBe('0px');
    await expect(first?.borderTopLeftRadius).toBe('0px');
  },
};

export const JoinedVertical: Story = {
  args: { joined: true, orientation: 'vertical', variant: 'outline' },
  play: async () => {
    const [start, center] = items();
    if (!start || !center) throw new Error('No items');
    await expect(center.top).toBe(start.bottom - 1);
    await expect(center.width).toBe(start.width);
    const [first, , last] = styles();
    await expect(first?.borderTopLeftRadius).not.toBe('0px');
    await expect(first?.borderBottomLeftRadius).toBe('0px');
    await expect(last?.borderTopLeftRadius).toBe('0px');
    await expect(last?.borderBottomLeftRadius).not.toBe('0px');
  },
};

// The focused item rises over its joined neighbors, so its outline shows.
export const JoinedFocus: Story = {
  args: { joined: true, variant: 'outline' },
  play: async () => {
    await userEvent.tab();
    const [first] = controls();
    if (!first) throw new Error('No items');
    await expect(first).toHaveFocus();
    await expect(getComputedStyle(first).zIndex).toBe('10');
  },
};

export const Disabled: Story = {
  args: { isDisabled: true, selectionMode: 'single' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radiogroup')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    for (const radio of canvas.getAllByRole('radio')) {
      await expect(radio).toBeDisabled();
    }
  },
};
