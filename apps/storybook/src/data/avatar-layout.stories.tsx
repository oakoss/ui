import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@oakoss/ui/components/ui/data/avatar';
import { expect, waitFor } from 'storybook/test';

import { part } from '../parts';
import { AvatarDemo, type AvatarDemoProps, broken, photo } from './avatar-demo';

const meta = {
  render: (args) => <AvatarDemo {...args} />,
  title: 'Data/Avatar/Layout',
} satisfies Meta<AvatarDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

function badged(args: AvatarDemoProps) {
  return (
    <AvatarDemo {...args}>
      <AvatarBadge aria-hidden />
    </AvatarDemo>
  );
}

// The badge sits on the avatar's end edge, at the bottom.
export const Badge: Story = {
  play: async () => {
    const avatar = part('avatar').getBoundingClientRect();
    const badge = part('avatar-badge').getBoundingClientRect();
    await expect(Math.round(badge.right)).toBe(Math.round(avatar.right));
    await expect(Math.round(badge.bottom)).toBe(Math.round(avatar.bottom));
    await expect(badge.width).toBe(10);
  },
  render: badged,
};

export const BadgeRightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    const avatar = part('avatar').getBoundingClientRect();
    const badge = part('avatar-badge').getBoundingClientRect();
    await expect(Math.round(badge.left)).toBe(Math.round(avatar.left));
  },
  render: badged,
};

// A group is a named group of overlapping avatars, and its count matches
// their size.
export const Group: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Editors' });
    const [first, second] = group.querySelectorAll('[data-slot=avatar]');
    if (!first || !second) throw new Error('No avatars');
    await expect(second.getBoundingClientRect().left).toBeLessThan(
      first.getBoundingClientRect().right,
    );
    await expect(part('avatar-group-count').getBoundingClientRect().width).toBe(
      40,
    );
  },
  render: () => (
    <AvatarGroup aria-label="Editors">
      <AvatarDemo size="lg" />
      <AvatarDemo size="lg" />
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
};

// A loaded image hides only its own avatar's initials, in either direction
// when one avatar sits inside another.
export const Nested: Story = {
  play: async ({ canvas, canvasElement }) => {
    const images = [
      ...canvasElement.querySelectorAll<HTMLElement>(
        '[data-slot=avatar-image]',
      ),
    ];
    await waitFor(async () => {
      await expect(
        images
          .map((image) => image.dataset.status ?? '')
          .toSorted((a, b) => a.localeCompare(b)),
      ).toEqual(['error', 'error', 'loaded', 'loaded']);
    });
    for (const text of ['Outer, inner loaded', 'Inner, outer loaded']) {
      await expect(canvas.getByText(text)).toBeVisible();
    }
    for (const text of ['Inner, inner loaded', 'Outer, outer loaded']) {
      await expect(canvas.getByText(text)).not.toBeVisible();
    }
  },
  render: () => (
    <div className="flex gap-8">
      <Avatar size="lg">
        <AvatarImage src={broken} />
        <AvatarFallback>Outer, inner loaded</AvatarFallback>
        <AvatarBadge>
          <Avatar size="sm">
            <AvatarImage src={photo} />
            <AvatarFallback>Inner, inner loaded</AvatarFallback>
          </Avatar>
        </AvatarBadge>
      </Avatar>
      <Avatar size="lg">
        <AvatarImage src={photo} />
        <AvatarFallback>Outer, outer loaded</AvatarFallback>
        <AvatarBadge>
          <Avatar size="sm">
            <AvatarImage src={broken} />
            <AvatarFallback>Inner, outer loaded</AvatarFallback>
          </Avatar>
        </AvatarBadge>
      </Avatar>
    </div>
  ),
};

// Forced colors turn the fallback's fill into the page color; the border
// overlay keeps the circle visible.
export const ForcedColors: Story = {
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const ring = getComputedStyle(part('avatar'), '::after');
    await expect(ring.borderTopWidth).toBe('1px');
    await expect(ring.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
  },
  tags: ['forced-colors'],
};
