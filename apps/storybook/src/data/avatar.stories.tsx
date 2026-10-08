import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, waitFor } from 'storybook/test';

import { part } from '../parts';
import { AvatarDemo, type AvatarDemoProps, photo } from './avatar-demo';

const meta = {
  args: { src: photo },
  render: (args) => <AvatarDemo {...args} />,
  title: 'Data/Avatar',
} satisfies Meta<AvatarDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  play: async ({ canvasElement }) => {
    const sizes = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-slot=avatar]'),
    ].map((avatar) => [
      avatar.dataset.size,
      avatar.getBoundingClientRect().width,
      getComputedStyle(part('avatar-fallback', avatar)).fontSize,
    ]);
    await expect(sizes).toEqual([
      ['sm', 24, '12px'],
      ['md', 32, '14px'],
      ['lg', 40, '14px'],
    ]);
  },
  render: () => (
    <div className="flex items-center gap-3">
      <AvatarDemo size="sm" />
      <AvatarDemo />
      <AvatarDemo size="lg" />
    </div>
  ),
};

// Inline in a block of text, an avatar adds no space below itself: on the
// text baseline it measured 37px here.
export const InlineHeight: Story = {
  play: async ({ canvasElement }) => {
    const block = canvasElement.querySelector('[data-testid=block]');
    if (!block) throw new Error('No block');
    await waitFor(async () => {
      await expect(part('avatar-image')).toHaveAttribute(
        'data-status',
        'loaded',
      );
    });
    await expect(block.getBoundingClientRect().height).toBe(32);
  },
  render: () => (
    <div className="text-sm" data-testid="block">
      <AvatarDemo src={photo} />
    </div>
  ),
};

// An avatar on its own names its person: role="img" with a label, so the
// image and initials inside aren't read separately.
export const Named: Story = {
  args: { 'aria-label': 'Ada Lovelace', role: 'img', src: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Ada Lovelace' })).toBe(
      part('avatar'),
    );
  },
};

// Spans throughout, so an avatar fits inside a link.
// Once the image loads, the hidden initials drop out of the link's name.
export const InLink: Story = {
  play: async ({ canvas }) => {
    const link = await canvas.findByRole('link', { name: 'Ada Lovelace' });
    await expect(link).toContainElement(part('avatar'));
    for (const slot of ['avatar', 'avatar-image']) {
      await expect(part(slot).tagName).not.toBe('DIV');
    }
  },
  render: () => (
    <a className="inline-flex items-center gap-2 text-sm" href="#ada">
      <AvatarDemo src={photo} />
      Ada Lovelace
    </a>
  ),
};
