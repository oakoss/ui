import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Item,
  ItemContent,
  ItemGroup,
  ItemTitle,
} from '@oakoss/ui/components/ui/data/item';
import { expect } from 'storybook/test';

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
  title: 'Data/Item/Links',
} satisfies Meta<typeof Item>;

export default meta;

type Story = StoryObj<typeof meta>;

// Each row's stretched link stays inside its own row, so in a list a click
// lands on the row it's on.
export const ContainedInRow: Story = {
  play: async ({ canvas }) => {
    const [first] = document.querySelectorAll('[data-slot=item]');
    const box = first?.getBoundingClientRect();
    if (!box) throw new Error('No row');
    await expect(document.elementFromPoint(box.left + 4, box.top + 4)).toBe(
      canvas.getByRole('link', { name: 'Ada Lovelace' }),
    );
  },
  render: () => (
    <ItemGroup className="w-96">
      <Item href="#ada" variant="outline">
        <ItemContent>
          <ItemTitle>Ada Lovelace</ItemTitle>
        </ItemContent>
      </Item>
      <Item href="#grace" variant="outline">
        <ItemContent>
          <ItemTitle>Grace Hopper</ItemTitle>
        </ItemContent>
      </Item>
    </ItemGroup>
  ),
};

// A heading title still carries the link, and only the link takes the slot.
export const LinkedHeading: Story = {
  play: async ({ canvas }) => {
    const heading = canvas.getByRole('heading', { level: 3 });
    await expect(heading).toContainElement(
      canvas.getByRole('link', { name: 'Billing updated' }),
    );
    await expect(
      document.querySelectorAll('[data-slot=item-title]'),
    ).toHaveLength(1);
  },
  render: (args) => (
    <Item {...args} className="w-96">
      <ItemContent>
        <ItemTitle level={3}>Billing updated</ItemTitle>
      </ItemContent>
    </Item>
  ),
};

// The Item's link props reach the title link.
export const LinkProps: Story = {
  args: { rel: 'noreferrer', target: '_blank' },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Billing updated' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noreferrer');
    await expect(
      document.querySelectorAll('[data-slot=item-title]'),
    ).toHaveLength(1);
  },
};

// `render` hands the title link to a router's own link component.
export const RouterLink: Story = {
  args: {
    render: ({ children, ...props }) =>
      'href' in props ? (
        <a {...props} data-router="true">
          {children}
        </a>
      ) : (
        <span {...props}>{children}</span>
      ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Billing updated' }),
    ).toHaveAttribute('data-router', 'true');
  },
};
