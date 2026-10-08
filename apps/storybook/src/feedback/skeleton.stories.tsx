import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from '@oakoss/ui/components/ui/feedback/skeleton';
import { expect } from 'storybook/test';

const meta = {
  args: { className: 'h-4 w-48' },
  component: Skeleton,
  title: 'Feedback/Skeleton',
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

function skeleton() {
  const element = document.querySelector('[data-slot=skeleton]');
  if (!(element instanceof HTMLElement)) throw new Error('No skeleton');
  return element;
}

// Hidden from screen readers, filled with the muted color, and pulsing.
export const Default: Story = {
  play: async () => {
    const element = skeleton();
    await expect(element).toHaveAttribute('aria-hidden', 'true');
    const style = getComputedStyle(element);
    await expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(style.animationName).toBe('pulse');
    const { height, width } = element.getBoundingClientRect();
    await expect(height).toBe(16);
    await expect(width).toBe(192);
  },
};

// className sets the shape, over the default radius.
export const Circle: Story = {
  args: { className: 'size-10 rounded-full' },
  play: async () => {
    const element = skeleton();
    const radius = getComputedStyle(element).borderTopLeftRadius;
    await expect(Number(radius.replace('px', ''))).toBeGreaterThanOrEqual(20);
    await expect(element.getBoundingClientRect().width).toBe(40);
  },
};

// Forced colors repaint the fill as the page color; the border keeps the
// shape visible.
export const ForcedColors: Story = {
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const style = getComputedStyle(skeleton());
    await expect(style.borderTopWidth).toBe('1px');
    await expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    await expect(style.borderTopColor).not.toBe(style.backgroundColor);
  },
  tags: ['forced-colors'],
};

// The region that's loading tells screen readers it's busy; the shapes inside
// stay silent.
export const LoadingRegion: Story = {
  play: async ({ canvas }) => {
    const region = canvas.getByRole('region', { name: 'Profile' });
    await expect(region).toHaveAttribute('aria-busy', 'true');
    await expect(region).toHaveAccessibleName('Profile');
  },
  render: () => (
    <section aria-busy="true" aria-label="Profile" className="flex gap-4">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    </section>
  ),
};
