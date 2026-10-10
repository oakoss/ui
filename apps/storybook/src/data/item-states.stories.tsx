import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@oakoss/ui/components/ui/data/item';
import { expect, userEvent } from 'storybook/test';

import { part } from '../parts';

const meta = {
  args: { href: '#billing' },
  component: Item,
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemContent>
        <ItemTitle>Billing updated</ItemTitle>
      </ItemContent>
    </Item>
  ),
  title: 'Data/Item/States',
} satisfies Meta<typeof Item>;

export default meta;

type Story = StoryObj<typeof meta>;

const forcedColors = {
  a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
};

function AllLooks() {
  return (
    <div className="flex w-96 flex-col gap-2">
      {(['default', 'outline', 'muted'] as const).map((variant) => (
        <Item key={variant} variant={variant}>
          <ItemContent>
            <ItemTitle>{variant}</ItemTitle>
          </ItemContent>
        </Item>
      ))}
    </div>
  );
}

function ringColor() {
  const probe = document.createElement('div');
  probe.style.color = 'var(--ring)';
  document.body.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color;
}

async function settle() {
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished),
  );
}

// Hovering anywhere on a linked row hovers its title link, which tints the
// row; the story ends hovered so axe checks that state.
export const Hover: Story = {
  play: async ({ canvas }) => {
    const row = part('item');
    const link = canvas.getByRole('link', { name: 'Billing updated' });
    delete link.dataset.hovered;
    await settle();
    const rest = getComputedStyle(row).backgroundColor;
    link.dataset.hovered = 'true';
    await settle();
    await expect(getComputedStyle(row).backgroundColor).not.toBe(rest);
  },
};

// Keyboard focus on the title link outlines the whole row, not the title.
export const FocusRing: Story = {
  play: async ({ canvas }) => {
    const row = part('item');
    await expect(getComputedStyle(row).outlineStyle).toBe('none');
    await userEvent.tab();
    const link = canvas.getByRole('link', { name: 'Billing updated' });
    await expect(link).toHaveFocus();
    await settle();
    const style = getComputedStyle(row);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.outlineOffset).toBe('2px');
    await expect(style.outlineColor).toBe(ringColor());
    await expect(getComputedStyle(link).outlineStyle).toBe('none');
  },
};

// Only the group's own Items are its list items: an Item nested in one isn't.
export const NestedInGroup: Story = {
  args: { href: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(1);
  },
  render: () => (
    <ItemGroup className="w-96">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Outer</ItemTitle>
          <Item size="xs">
            <ItemContent>
              <ItemTitle>Nested</ItemTitle>
            </ItemContent>
          </Item>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
};

// Outside a group, a consumer's role stands.
export const ConsumerRole: Story = {
  args: { href: undefined, role: 'article' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('article')).toBeVisible();
  },
};

// The outline look has a visible border and the muted one a fill; each Item
// reports its look and size.
export const Looks: Story = {
  args: { href: undefined },
  play: async () => {
    const [plain, outline, muted] = [
      ...document.querySelectorAll<HTMLElement>('[data-slot=item]'),
    ];
    await expect(outline).toHaveAttribute('data-variant', 'outline');
    await expect(muted).toHaveAttribute('data-size', 'md');
    const clear = 'rgba(0, 0, 0, 0)';
    await expect(getComputedStyle(plain ?? document.body).borderTopColor).toBe(
      clear,
    );
    await expect(
      getComputedStyle(outline ?? document.body).borderTopColor,
    ).not.toBe(clear);
    await expect(
      getComputedStyle(muted ?? document.body).backgroundColor,
    ).not.toBe(clear);
  },
  render: () => <AllLooks />,
};

// Image media shrinks with the Item's size, and is named by aria-labelledby
// as well as aria-label.
export const ImageMedia: Story = {
  args: { href: undefined },
  play: async ({ canvas }) => {
    const widths = [
      ...document.querySelectorAll<HTMLElement>('[data-slot=item-media]'),
    ].map((media) => media.getBoundingClientRect().width);
    await expect(widths).toEqual([40, 32, 24]);
    await expect(canvas.getByRole('img', { name: 'md' })).toBeVisible();
  },
  render: () => (
    <div className="flex w-96 flex-col gap-2">
      {(['md', 'sm', 'xs'] as const).map((size) => (
        <Item key={size} size={size}>
          <ItemMedia aria-labelledby={`${size}-title`} variant="image">
            <span className="size-full bg-muted" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle id={`${size}-title`}>{size}</ItemTitle>
          </ItemContent>
        </Item>
      ))}
    </div>
  ),
};

// In forced colors the default look stays borderless, so a list doesn't
// become a stack of boxes, while outline and muted rows keep a visible
// border.
export const ForcedColors: Story = {
  args: { href: undefined },
  parameters: forcedColors,
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const page = getComputedStyle(document.body).backgroundColor;
    const [plain, outline, muted] = [
      ...document.querySelectorAll<HTMLElement>('[data-slot=item]'),
    ].map((item) => getComputedStyle(item).borderTopColor);
    await expect(plain).toBe(page);
    await expect(outline).not.toBe(page);
    await expect(muted).not.toBe(page);
  },
  render: () => <AllLooks />,
  tags: ['forced-colors'],
};

// The row's focus outline shows in forced colors too.
export const ForcedColorsFocus: Story = {
  parameters: forcedColors,
  play: async () => {
    await userEvent.tab();
    const row = getComputedStyle(part('item'));
    await expect(row.outlineStyle).toBe('solid');
    await expect(row.outlineColor).not.toBe(
      getComputedStyle(document.body).backgroundColor,
    );
  },
  tags: ['forced-colors'],
};
