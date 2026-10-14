import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icon from '@oakoss/ui/components/icons';
import {
  Tag,
  TagGroup,
  type TagGroupProps,
} from '@oakoss/ui/components/ui/data/tag-group';
import { expect } from 'storybook/test';

import { tokenColor } from '#/helpers/color';
import { part } from '#/helpers/parts';

type Item = { id: string; name: string };

const TagGroupItems = TagGroup<Item>;

const meta = {
  args: { label: 'Categories' },
  component: TagGroupItems,
  title: 'Data/TagGroup',
} satisfies Meta<typeof TagGroupItems>;

export default meta;

type Story = StoryObj<typeof meta>;

const categories: Item[] = [
  { id: 'news', name: 'News' },
  { id: 'travel', name: 'Travel' },
  { id: 'gaming', name: 'Gaming' },
];

// A grid named by its label, with a row per tag named by its text and the
// description below. Tags are 24px and neutral soft at rest.
export const Default: Story = {
  args: { description: 'Shown on your profile.' },
  play: async ({ canvas }) => {
    const grid = canvas.getByRole('grid', { name: 'Categories' });
    await expect(grid).toHaveAccessibleDescription('Shown on your profile.');
    await expect(canvas.getAllByRole('row')).toHaveLength(3);
    await expect(canvas.getByRole('row', { name: 'Travel' })).toBeVisible();
    const tag = part('tag');
    await expect(tag.getBoundingClientRect().height).toBe(24);
    await expect(getComputedStyle(tag).backgroundColor).toBe(
      tokenColor('--color-secondary'),
    );
    await expect(getComputedStyle(tag).color).toBe(
      tokenColor('--color-foreground'),
    );
  },
  render: (args) => (
    <TagGroupItems {...args} items={categories}>
      {(item) => <Tag>{item.name}</Tag>}
    </TagGroupItems>
  ),
};

// A tag whose content isn't plain text takes its name from textValue; an
// interpolated label is still read as one string. An icon sits on the text's
// line inside the 24px tag, at the size of the text.
export const TextValue: Story = {
  play: async ({ canvas }) => {
    const verified = canvas.getByRole('row', { name: 'Verified' });
    // React Aria sets each row's aria-label from its textValue.
    await expect(verified).toHaveAttribute('aria-label', 'Verified');
    await expect(canvas.getByRole('row', { name: '3 unread' })).toHaveAttribute(
      'aria-label',
      '3 unread',
    );
    const tag = verified.getBoundingClientRect();
    const svg = verified.querySelector('svg')?.getBoundingClientRect();
    if (!svg) throw new Error('No icon');
    await expect(tag.height).toBe(24);
    await expect(svg.width).toBe(12);
    await expect(svg.top).toBeGreaterThanOrEqual(tag.top);
    await expect(svg.bottom).toBeLessThanOrEqual(tag.bottom);
  },
  render: (args) => {
    const count = 3;
    return (
      <TagGroupItems {...groupArgs(args)}>
        <Tag intent="success" textValue="Verified">
          <Icon.Check aria-hidden />
          Verified
        </Tag>
        <Tag>{count} unread</Tag>
      </TagGroupItems>
    );
  },
};

// A long tag stays on one line; className caps its width and the text
// truncates, while its name stays whole.
export const LongText: Story = {
  play: async ({ canvas }) => {
    const row = canvas.getByRole('row', {
      name: 'Quarterly planning and roadmap review',
    });
    const text = row.querySelector('span');
    if (!text) throw new Error('No text');
    await expect(row.getBoundingClientRect().width).toBeLessThanOrEqual(128);
    await expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    await expect(getComputedStyle(text).textOverflow).toBe('ellipsis');
  },
  render: (args) => (
    <TagGroupItems {...groupArgs(args)}>
      <Tag className="max-w-32">Quarterly planning and roadmap review</Tag>
    </TagGroupItems>
  ),
};

// A tag with href is a link, underlined so it doesn't rely on color.
export const Link: Story = {
  play: async ({ canvas }) => {
    const link = getComputedStyle(canvas.getByRole('row', { name: 'Docs' }));
    const plain = getComputedStyle(canvas.getByRole('row', { name: 'Draft' }));
    await expect(link.textDecorationLine).toBe('underline');
    await expect(link.cursor).toBe('pointer');
    await expect(plain.textDecorationLine).toBe('none');
  },
  render: (args) => (
    <TagGroupItems {...groupArgs(args)}>
      <Tag href="/docs" id="docs">
        Docs
      </Tag>
      <Tag id="draft">Draft</Tag>
    </TagGroupItems>
  ),
};

// emptyLabel shows when there are no tags; a blank one mounts nothing.
export const Empty: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('No categories yet')).toBeVisible();
    const blank = document.querySelectorAll('[data-slot=tag-list]')[1];
    if (!blank) throw new Error('No second list');
    await expect(blank).toBeEmptyDOMElement();
  },
  render: () => (
    <div className="grid gap-4">
      <TagGroupItems emptyLabel="No categories yet" label="Categories" />
      <TagGroupItems emptyLabel=" " label="Labels" />
    </div>
  ),
};

// errorMessage shows below the tags and describes the group.
export const ErrorMessage: Story = {
  args: { errorMessage: 'Pick at least one category.' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('grid', { name: 'Categories' }),
    ).toHaveAccessibleDescription('Pick at least one category.');
    await expect(getComputedStyle(part('tag-group-error')).color).toBe(
      tokenColor('--color-destructive-text'),
    );
  },
  render: (args) => (
    <TagGroupItems {...args} items={categories}>
      {(item) => <Tag>{item.name}</Tag>}
    </TagGroupItems>
  ),
};

// A story's args without the tag items, so a render can pass its own tags.
function groupArgs({
  children: _children,
  dependencies: _dependencies,
  items: _items,
  ...args
}: Partial<TagGroupProps<Item>>) {
  return args;
}
