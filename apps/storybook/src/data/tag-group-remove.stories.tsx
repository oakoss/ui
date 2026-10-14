import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tag, TagGroup } from '@oakoss/ui/components/ui/data/tag-group';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';

import { part } from '#/helpers/parts';

type Item = { id: string; name: string };

const categories: Item[] = [
  { id: 'news', name: 'News' },
  { id: 'travel', name: 'Travel' },
];

function Removable() {
  const [items, setItems] = useState(categories);
  return (
    <TagGroup
      items={items}
      label="Categories"
      onRemove={(keys) => {
        setItems((current) => current.filter(({ id }) => !keys.has(id)));
      }}
    >
      {(item) => <Tag>{item.name}</Tag>}
    </TagGroup>
  );
}

const meta = {
  component: Removable,
  title: 'Data/TagGroup/Remove',
} satisfies Meta<typeof Removable>;

export default meta;

type Story = StoryObj<typeof meta>;

// onRemove adds a remove button to each tag, named by React Aria with the
// tag's text, and Delete removes the focused tag. Once the last is gone,
// focus lands on the list, which shows the outline and the empty label.
export const Default: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Remove News' }));
    await expect(canvas.queryByRole('row', { name: 'News' })).toBeNull();
    // React Aria moves focus to the next tag.
    await expect(canvas.getByRole('row', { name: 'Travel' })).toHaveFocus();
    await userEvent.keyboard('{Delete}');
    await expect(canvas.queryByRole('row')).toBeNull();
    const list = part('tag-list');
    await expect(list).toHaveFocus();
    await expect(getComputedStyle(list).outlineStyle).toBe('solid');
    await expect(list).toHaveTextContent('No tags');
  },
};

// The remove button fills the tag's height at its end: a 24px target that
// meets WCAG 2.2 AA without overlapping the next tag.
export const Target: Story = {
  play: async ({ canvas }) => {
    const tag = canvas.getByRole('row', { name: 'News' });
    const button = canvas
      .getByRole('button', { name: 'Remove News' })
      .getBoundingClientRect();
    await expect(button.width).toBe(24);
    await expect(button.height).toBe(24);
    await expect(button.right).toBe(innerEdges(tag).right);
  },
};

// In a right-to-left locale the remove button sits at the tag's left end.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const tag = canvas.getByRole('row', { name: 'News' });
    const button = canvas.getByRole('button', { name: /News/u });
    await expect(button.getBoundingClientRect().left).toBe(
      innerEdges(tag).left,
    );
  },
};

// Keyboard focus draws the outline on a tag and on its remove button.
export const Focus: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    const tag = canvas.getByRole('row', { name: 'News' });
    await expect(tag).toHaveFocus();
    await expect(getComputedStyle(tag).outlineStyle).toBe('solid');
    await userEvent.tab();
    const remove = canvas.getByRole('button', { name: 'Remove News' });
    await expect(remove).toHaveFocus();
    await expect(getComputedStyle(remove).outlineStyle).toBe('solid');
  },
};

// The remove button tints on hover and more on press.
export const Tint: Story = {
  play: async ({ canvas }) => {
    const remove = canvas.getByRole('button', { name: 'Remove News' });
    delete remove.dataset.hovered;
    delete remove.dataset.pressed;
    const rest = getComputedStyle(remove).backgroundColor;
    remove.toggleAttribute('data-pressed', true);
    const pressed = getComputedStyle(remove).backgroundColor;
    delete remove.dataset.pressed;
    remove.toggleAttribute('data-hovered', true);
    const hovered = getComputedStyle(remove).backgroundColor;
    await expect(rest).toBe('rgba(0, 0, 0, 0)');
    await expect(hovered).not.toBe(rest);
    await expect(pressed).not.toBe(rest);
    await expect(pressed).not.toBe(hovered);
  },
};

// An element's box inside its border.
function innerEdges(element: HTMLElement) {
  const box = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return {
    left: box.left + Number(style.borderLeftWidth.replace('px', '')),
    right: box.right - Number(style.borderRightWidth.replace('px', '')),
  };
}
