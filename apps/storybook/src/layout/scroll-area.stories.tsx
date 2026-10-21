import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScrollArea } from '@oakoss/ui/components/ui/layout/scroll-area';
import { expect, userEvent } from 'storybook/test';

import { contrast, tokenColor } from '#/helpers/color';
import { part } from '#/helpers/parts';

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
  },
  component: ScrollArea,
  title: 'Layout/ScrollArea',
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}

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

// Content that fits needs no scrolling, so the area is neither a tab stop nor
// a landmark until it overflows. With no scrollbar taking space, as with
// overlay scrollbars, overflowing doesn't resize the area.
export const Fits: Story = {
  args: {
    children: <p className="p-4 text-sm">v1.0.0</p>,
    style: { scrollbarWidth: 'none' },
  },
  play: async ({ canvas }) => {
    const area = part('scroll-area');
    await expect(area).not.toHaveAttribute('tabindex');
    await expect(canvas.queryByRole('region')).toBeNull();
    // A name on a div with no role fails axe, so it waits for the region.
    await expect(area).not.toHaveAttribute('aria-label');
    // Past the observers' first callbacks, which would measure anyway.
    await nextFrame();
    await nextFrame();
    // Content added outside React, as content that loads late would be.
    const block = document.createElement('div');
    block.style.height = '24rem';
    area.append(block);
    await expect(
      await canvas.findByRole('region', { name: 'Tags' }),
    ).toHaveAttribute('tabindex', '0');
  },
};

// A ref reaches the area's element, as it would a div's.
const refs: (HTMLDivElement | null)[] = [];
export const Ref: Story = {
  args: {
    ref: (node: HTMLDivElement | null) => {
      refs.push(node);
    },
  },
  play: async () => {
    await expect(refs.at(-1)).toBe(part('scroll-area'));
  },
};

// A role the caller sets keeps their name, so a region that fits isn't an
// unnamed landmark.
export const OwnRole: Story = {
  args: { children: <p className="p-4 text-sm">v1.0.0</p>, role: 'region' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('region', { name: 'Tags' })).toBe(
      part('scroll-area'),
    );
  },
};

// The area keeps a caller's scroll padding, which clears content scrolled
// into view from a header of their own.
export const ScrollPadding: Story = {
  args: { style: { scrollPaddingTop: '12px' } },
  play: async () => {
    await nextFrame();
    await expect(getComputedStyle(part('scroll-area')).scrollPaddingTop).toBe(
      '12px',
    );
  },
};

// Content spilling out of an area that can't scroll scrolls the page, so the
// area doesn't take focus for it.
export const NotScrolling: Story = {
  args: { style: { overflow: 'visible' } },
  play: async () => {
    const area = part('scroll-area');
    await expect(area.scrollHeight).toBeGreaterThan(area.clientHeight);
    await expect(area).not.toHaveAttribute('tabindex');
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
