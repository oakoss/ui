import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icon from '@oakoss/ui/components/icons';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  type EmptyMediaProps,
  EmptyTitle,
} from '@oakoss/ui/components/ui/feedback/empty';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { expect } from 'storybook/test';

import { part } from '../parts';

function EmptyDemo(props: EmptyMediaProps) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon" {...props}>
          <Icon.Search />
        </EmptyMedia>
        <EmptyTitle>No results</EmptyTitle>
        <EmptyDescription>
          Nothing matches your search. Try fewer words, or{' '}
          <a href="#filters">clear the filters</a>.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>New project</Button>
      </EmptyContent>
    </Empty>
  );
}

const meta = { component: EmptyDemo, title: 'Feedback/Empty' } satisfies Meta<
  typeof EmptyDemo
>;

export default meta;

type Story = StoryObj<typeof meta>;

// The title is a level-3 heading, so screen reader users can jump to it, and
// the description is a paragraph. The icon is decoration, hidden from them.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 3, name: 'No results' }),
    ).toBeVisible();
    await expect(part('empty-description').tagName).toBe('P');
    await expect(part('empty-media')).toHaveAttribute('aria-hidden', 'true');
    await expect(part('empty-media')).toHaveAttribute('data-variant', 'icon');
    await expect(canvas.queryByRole('img')).toBeNull();
    await expect(part('empty-media').getBoundingClientRect().width).toBe(40);
    // A border class draws the outline dashed.
    await expect(getComputedStyle(part('empty')).borderTopStyle).toBe('dashed');
  },
};

export const HeadingLevel: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'No messages' }),
    ).toBeVisible();
  },
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle level={2}>No messages</EmptyTitle>
      </EmptyHeader>
    </Empty>
  ),
};

// A named media is an image screen readers announce.
export const NamedMedia: Story = {
  args: { 'aria-label': 'Search' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Search' })).toBe(
      part('empty-media'),
    );
    await expect(part('empty-media')).not.toHaveAttribute('aria-hidden');
  },
};

// A blank name is no name: the media stays hidden rather than becoming an
// unnamed image.
export const EmptyName: Story = {
  args: { 'aria-label': ' ' },
  play: async ({ canvas }) => {
    await expect(part('empty-media')).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.queryByRole('img')).toBeNull();
  },
};

// A link in the description is underlined, so it doesn't rely on color.
export const DescriptionLink: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'clear the filters' });
    await expect(getComputedStyle(link).textDecorationLine).toBe('underline');
  },
};

// Nested in other text, a link is still underlined.
export const DescriptionNestedLink: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'the docs' });
    await expect(getComputedStyle(link).textDecorationLine).toBe('underline');
  },
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No results</EmptyTitle>
        <EmptyDescription>
          See{' '}
          <strong>
            <a href="#docs">the docs</a>
          </strong>
          .
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  ),
};

// Forced colors repaint the icon tile's fill as the page color; its border
// keeps the tile.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const style = getComputedStyle(part('empty-media'));
    await expect(style.borderTopWidth).toBe('1px');
    await expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
  },
  tags: ['forced-colors'],
};
