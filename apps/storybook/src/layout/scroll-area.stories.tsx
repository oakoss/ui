import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScrollArea } from '@oakoss/ui/components/ui/layout/scroll-area';
import { expect, userEvent } from 'storybook/test';

import { contrast, tokenColor } from '../color';
import { part } from '../parts';

const tags = Array.from({ length: 30 }, (_, index) => `v1.${index}.0`);

const meta = {
  args: {
    'aria-label': 'Tags',
    children: (
      <ul className="p-4 text-sm">
        {tags.map((tag) => (
          <li className="py-1" key={tag}>
            {tag}
          </li>
        ))}
      </ul>
    ),
    className: 'h-48 w-48 rounded-md border',
    role: 'region',
  },
  component: ScrollArea,
  title: 'Layout/ScrollArea',
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

// Keyboard users reach the region and scroll it with the arrow keys, which
// browsers handle once it has focus; the ring sits inside its edge, where a
// clipping parent can't hide it.
export const Default: Story = {
  play: async ({ canvas }) => {
    const area = canvas.getByRole('region', { name: 'Tags' });
    await expect(area.scrollHeight).toBeGreaterThan(area.clientHeight);
    await expect(getComputedStyle(area).outlineStyle).toBe('none');
    await userEvent.tab();
    await expect(area).toHaveFocus();
    const style = getComputedStyle(area);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.outlineOffset).toBe('-3px');
  },
};

// A thin native scrollbar on a transparent track, its thumb the input border
// color, which meets 3:1 against the page.
export const Scrollbar: Story = {
  play: async ({ canvasElement }) => {
    const thumb = tokenColor('--color-input', canvasElement);
    const style = getComputedStyle(part('scroll-area'));
    await expect(style.scrollbarWidth).toBe('thin');
    await expect(style.scrollbarColor).toBe(`${thumb} rgba(0, 0, 0, 0)`);
    await expect(
      contrast(thumb, getComputedStyle(document.body).backgroundColor),
    ).toBeGreaterThan(3);
  },
};

// Content wider than the area scrolls only along the orientation.
export const Vertical: Story = {
  args: { children: <div className="size-96" />, orientation: 'vertical' },
  play: async () => {
    const style = getComputedStyle(part('scroll-area'));
    await expect(style.overflowY).toBe('auto');
    await expect(style.overflowX).toBe('hidden');
    await expect(part('scroll-area')).toHaveAttribute(
      'data-orientation',
      'vertical',
    );
  },
};

export const Horizontal: Story = {
  args: { children: <div className="size-96" />, orientation: 'horizontal' },
  play: async () => {
    const style = getComputedStyle(part('scroll-area'));
    await expect(style.overflowX).toBe('auto');
    await expect(style.overflowY).toBe('hidden');
  },
};

export const Both: Story = {
  args: { children: <div className="size-96" /> },
  play: async () => {
    const style = getComputedStyle(part('scroll-area'));
    await expect(style.overflowX).toBe('auto');
    await expect(style.overflowY).toBe('auto');
    await expect(part('scroll-area')).toHaveAttribute(
      'data-orientation',
      'both',
    );
  },
};

// Forced colors hand the scrollbar back to the system's colors and keep the
// focus outline, repainted in a system color.
export const ForcedColors: Story = {
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    await expect(getComputedStyle(part('scroll-area')).scrollbarColor).toBe(
      'auto',
    );
    await userEvent.tab();
    const area = canvas.getByRole('region', { name: 'Tags' });
    await expect(area).toHaveFocus();
    const style = getComputedStyle(area);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.outlineColor).not.toBe('rgba(0, 0, 0, 0)');
  },
  tags: ['forced-colors'],
};
