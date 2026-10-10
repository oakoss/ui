import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icon from '@oakoss/ui/components/icons';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@oakoss/ui/components/ui/data/item';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { expect, fn, userEvent } from 'storybook/test';

import { part } from '../parts';

const onArchive = fn();

const meta = {
  component: Item,
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemMedia variant="icon">
        <Icon.Info />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Billing updated</ItemTitle>
        <ItemDescription>
          Your card ending 4242 is now the default.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          onPress={() => {
            onArchive();
          }}
          size="sm"
          variant="outline"
        >
          Archive
        </Button>
      </ItemActions>
    </Item>
  ),
  title: 'Data/Item',
} satisfies Meta<typeof Item>;

export default meta;

type Story = StoryObj<typeof meta>;

// The element a pointer hits at another element's center.
function atCenter(element: Element) {
  const box = element.getBoundingClientRect();
  return document.elementFromPoint(
    box.left + box.width / 2,
    box.top + box.height / 2,
  );
}

// A plain Item is a row of parts: no link, no list role, and decorative media.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(canvas.queryByRole('listitem')).toBeNull();
    await expect(part('item-media')).toHaveAttribute('aria-hidden', 'true');
    await expect(part('item-title').tagName).toBe('DIV');
  },
};

// A group is a list whose Items are its list items; the separator between
// them is hidden, since a list allows only list items.
export const Group: Story = {
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    const roles = [...list.children].map((child) =>
      child.tagName === 'HR'
        ? child.getAttribute('aria-hidden')
        : child.getAttribute('role'),
    );
    await expect(roles).toEqual(['listitem', 'true', 'listitem']);
  },
  render: () => (
    <ItemGroup className="w-96">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Ada Lovelace</ItemTitle>
        </ItemContent>
      </Item>
      <ItemSeparator />
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Grace Hopper</ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
};

// A linked Item's title is its link, named by the title alone and stretched
// over the row; the row's actions and the description's links sit above it.
export const Linked: Story = {
  args: { href: '#billing' },
  play: async ({ canvas }) => {
    onArchive.mockClear();
    const link = canvas.getByRole('link', { name: 'Billing updated' });
    const row = part('item').getBoundingClientRect();
    await expect(document.elementFromPoint(row.left + 4, row.top + 4)).toBe(
      link,
    );
    await expect(document.elementFromPoint(row.right - 4, row.bottom - 4)).toBe(
      link,
    );
    const archive = canvas.getByRole('button', { name: 'Archive' });
    await expect(atCenter(archive)).toBe(archive);
    await userEvent.click(archive);
    await expect(onArchive).toHaveBeenCalledOnce();
    const inline = canvas.getByRole('link', { name: 'terms' });
    await expect(atCenter(inline)).toBe(inline);
    const more = canvas.getByRole('link', { name: 'History' });
    await expect(atCenter(more)).toBe(more);
  },
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemContent>
        <ItemTitle>Billing updated</ItemTitle>
        <ItemDescription>
          Read the <a href="#terms">terms</a>.
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button
          onPress={() => {
            onArchive();
          }}
          size="sm"
          variant="outline"
        >
          Archive
        </Button>
        <a className="text-sm underline" href="#history">
          History
        </a>
      </ItemActions>
    </Item>
  ),
};

// An undefined href links nowhere, so the Item stays a plain row.
export const UndefinedHref: Story = {
  args: { href: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('link')).toBeNull();
  },
};

export const TitleHeading: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 3, name: 'Billing updated' }),
    ).toBeVisible();
  },
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemContent>
        <ItemTitle level={3}>Billing updated</ItemTitle>
      </ItemContent>
    </Item>
  ),
};

// Named media is an image.
export const NamedMedia: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Ada' })).toBeVisible();
  },
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemMedia aria-label="Ada" variant="image">
        <span className="size-full bg-muted" />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>Ada Lovelace</ItemTitle>
      </ItemContent>
    </Item>
  ),
};

// A long title stays on one line.
export const Truncate: Story = {
  play: async () => {
    const [short, long] = [
      ...document.querySelectorAll<HTMLElement>('[data-slot=item-title]'),
    ].map((title) => title.getBoundingClientRect().height);
    await expect(long).toBe(short);
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <Item {...args} className="w-40" variant="outline">
        <ItemContent>
          <ItemTitle>Short</ItemTitle>
        </ItemContent>
      </Item>
      <Item {...args} className="w-40" variant="outline">
        <ItemContent>
          <ItemTitle>A title much too long to fit on one line</ItemTitle>
        </ItemContent>
      </Item>
    </div>
  ),
};

// Each size has its own spacing.
export const Sizes: Story = {
  play: async () => {
    const paddings = [
      ...document.querySelectorAll<HTMLElement>('[data-slot=item]'),
    ].map((item) => getComputedStyle(item).paddingTop);
    await expect(new Set(paddings).size).toBe(3);
  },
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      {(['md', 'sm', 'xs'] as const).map((size) => (
        <Item key={size} size={size} variant="outline">
          <ItemContent>
            <ItemTitle>{size}</ItemTitle>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
};

// Every part takes a consumer's className.
export const ClassNames: Story = {
  play: async () => {
    await expect(part('item-group')).toHaveClass('mt-2');
    await expect(part('item')).toHaveClass('shadow-sm');
    await expect(part('item-media')).toHaveClass('opacity-90');
    await expect(part('item-content')).toHaveClass('italic');
    await expect(part('item-title')).toHaveClass('tracking-wide');
    await expect(part('item-description')).toHaveClass('opacity-80');
    await expect(part('item-actions')).toHaveClass('opacity-70');
    await expect(part('item-separator')).toHaveClass('my-4');
  },
  render: () => (
    <ItemGroup className="mt-2 w-96">
      <Item className="shadow-sm">
        <ItemMedia className="opacity-90" />
        <ItemContent className="italic">
          <ItemTitle className="tracking-wide">Title</ItemTitle>
          <ItemDescription className="opacity-80">Text</ItemDescription>
        </ItemContent>
        <ItemActions className="opacity-70" />
      </Item>
      <ItemSeparator className="my-4" />
    </ItemGroup>
  ),
};
