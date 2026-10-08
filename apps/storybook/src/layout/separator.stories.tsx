import type { Meta, StoryObj } from '@storybook/react-vite';

import { Separator } from '@oakoss/ui/components/ui/layout/separator';
import { SeparatorContext } from 'react-aria-components';
import { expect } from 'storybook/test';

const meta = { component: Separator, title: 'Layout/Separator' } satisfies Meta<
  typeof Separator
>;

export default meta;

type Story = StoryObj<typeof meta>;

function separator() {
  const element = document.querySelector('[data-slot=separator]');
  if (!(element instanceof HTMLElement)) throw new Error('No separator');
  return element;
}

// One line high, the border color, and as wide as a centering flex column,
// where a block's automatic width would collapse to nothing.
export const Horizontal: Story = {
  play: async ({ canvas }) => {
    const element = canvas.getByRole('separator');
    await expect(element.tagName).toBe('HR');
    const { height, width } = element.getBoundingClientRect();
    await expect(height).toBe(1);
    await expect(width).toBe(200);
    const style = getComputedStyle(element);
    await expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(style.borderTopColor).not.toBe(style.color);
  },
  render: (args) => (
    <div className="flex w-50 flex-col items-center">
      <Separator {...args} />
    </div>
  ),
};

// React Aria leaves aria-orientation off a horizontal separator, so the line
// must not depend on it.
export const HorizontalDiv: Story = {
  args: { elementType: 'div' },
  play: async ({ canvas }) => {
    const element = canvas.getByRole('separator');
    await expect(element.tagName).toBe('DIV');
    await expect(element).not.toHaveAttribute('aria-orientation');
    await expect(element).toHaveAttribute('data-orientation', 'horizontal');
    await expect(element.getBoundingClientRect().height).toBe(1);
  },
};

// A vertical separator stretches to its row and draws only its start edge.
export const Vertical: Story = {
  args: { orientation: 'vertical' },
  play: async ({ canvas }) => {
    const element = canvas.getByRole('separator');
    await expect(element).toHaveAttribute('aria-orientation', 'vertical');
    const { height, width } = element.getBoundingClientRect();
    await expect(width).toBe(1);
    await expect(height).toBe(40);
    const style = getComputedStyle(element);
    await expect(style.borderInlineStartWidth).toBe('1px');
    await expect(style.borderTopWidth).toBe('0px');
  },
  render: (args) => (
    <div className="flex h-10 items-center gap-4 text-sm">
      Docs
      <Separator {...args} />
      Source
    </div>
  ),
};

// The orientation a container provides applies when the prop is unset.
export const ContextOrientation: Story = {
  play: async ({ canvas }) => {
    const element = canvas.getByRole('separator');
    await expect(element).toHaveAttribute('aria-orientation', 'vertical');
    await expect(element).toHaveAttribute('data-orientation', 'vertical');
    await expect(element.getBoundingClientRect().width).toBe(1);
  },
  render: (args) => (
    <SeparatorContext value={{ orientation: 'vertical' }}>
      <div className="flex h-10 items-center gap-4 text-sm">
        Docs
        <Separator {...args} />
        Source
      </div>
    </SeparatorContext>
  ),
};

// A consumer's class wins over the base class it conflicts with.
export const ClassName: Story = {
  args: { className: 'w-1/2' },
  play: async () => {
    await expect(separator().getBoundingClientRect().width).toBe(100);
  },
  render: (args) => (
    <div className="w-50">
      <Separator {...args} />
    </div>
  ),
};

// Forced colors repaint a border, so both lines stay visible; a div, unlike
// an <hr>, has no border of its own.
export const ForcedColors: Story = {
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const [horizontal, vertical] = document.querySelectorAll(
      '[data-slot=separator]',
    );
    if (!(horizontal instanceof HTMLElement && vertical instanceof HTMLElement))
      throw new Error('No separators');
    for (const [element, side] of [
      [horizontal, 'borderTop'],
      [vertical, 'borderInlineStart'],
    ] as const) {
      const style = getComputedStyle(element);
      await expect(style[`${side}Width`]).toBe('1px');
      await expect(style[`${side}Style`]).toBe('solid');
      await expect(style[`${side}Color`]).not.toBe('rgba(0, 0, 0, 0)');
    }
  },
  render: () => (
    <div className="flex h-10 items-center gap-4">
      <div className="w-20">
        <Separator elementType="div" />
      </div>
      <Separator orientation="vertical" />
    </div>
  ),
  tags: ['forced-colors'],
};
