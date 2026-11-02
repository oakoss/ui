import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@oakoss/ui/components/ui/overlays/dropdown-menu';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { tokenColor } from '#/helpers/color';
import { part } from '#/helpers/parts';

import {
  DropdownMenuDemo,
  type DropdownMenuDemoProps,
} from './dropdown-menu-demo';
import { openedMenu, openMenu } from './menu-test';
import { settled } from './overlay-test';

const meta = {
  render: (args) => <DropdownMenuDemo {...args} />,
  title: 'Overlays/DropdownMenu/Items',
} satisfies Meta<DropdownMenuDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

const view = (
  <>
    <DropdownMenuGroup>
      <DropdownMenuLabel inset>Edit</DropdownMenuLabel>
      <DropdownMenuItem id="undo">Undo</DropdownMenuItem>
      <DropdownMenuItem id="redo" inset>
        Redo
      </DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuGroup defaultSelectedKeys={['grid']} selectionMode="single">
      <DropdownMenuLabel>View</DropdownMenuLabel>
      <DropdownMenuItem id="grid">Grid</DropdownMenuItem>
      <DropdownMenuItem id="list">List</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuGroup
      defaultSelectedKeys={['rulers']}
      selectionMode="multiple"
    >
      <DropdownMenuLabel>Show</DropdownMenuLabel>
      <DropdownMenuItem id="rulers">Rulers</DropdownMenuItem>
      <DropdownMenuItem id="guides">Guides</DropdownMenuItem>
    </DropdownMenuGroup>
  </>
);

const mark = (item: HTMLElement) =>
  item.querySelector(':scope [data-slot$=-item-indicator] svg');

// Action and selection groups mix in one menu: single selection marks with a
// dot, multiple with a check, and only selecting items leave room for it.
export const Selection: Story = {
  args: { children: view, defaultOpen: true },
  play: async () => {
    const { menu } = await openedMenu();
    const undo = within(menu).getByRole('menuitem', { name: 'Undo' });
    const grid = within(menu).getByRole('menuitemradio', { name: 'Grid' });
    const rulers = within(menu).getByRole('menuitemcheckbox', {
      name: 'Rulers',
    });
    await expect(grid).toHaveAttribute('aria-checked', 'true');
    await expect(rulers).toHaveAttribute('aria-checked', 'true');
    await expect(part('dropdown-menu-radio-item-indicator', grid)).toBeTruthy();
    await expect(
      part('dropdown-menu-checkbox-item-indicator', rulers),
    ).toBeTruthy();
    await expect(mark(grid)?.getBoundingClientRect().width).toBe(8);
    await expect(mark(rulers)?.getBoundingClientRect().width).toBe(16);
    const guides = within(menu).getByRole('menuitemcheckbox', {
      name: 'Guides',
    });
    await expect(
      mark(within(menu).getByRole('menuitemradio', { name: 'List' })),
    ).toBeNull();
    await expect(mark(guides)).toBeNull();
    await expect(getComputedStyle(undo).paddingInlineStart).toBe('8px');
    await expect(getComputedStyle(grid).paddingInlineStart).toBe('32px');
    // inset lines an item or label up with the selecting items' labels.
    await expect(
      getComputedStyle(within(menu).getByRole('menuitem', { name: 'Redo' }))
        .paddingInlineStart,
    ).toBe('32px');
    await expect(
      getComputedStyle(part('dropdown-menu-label', menu)).paddingInlineStart,
    ).toBe('32px');
    await expect(
      within(menu).getByRole('group', { name: 'View' }),
    ).toHaveAttribute('data-slot', 'dropdown-menu-group');
    await expect(
      menu.querySelector('[data-slot=dropdown-menu-separator]'),
    ).toHaveAttribute('role', 'separator');
  },
};

// Choosing an unchecked item checks it and marks it.
export const SelectionToggles: Story = {
  args: { children: view },
  play: async () => {
    const { menu } = await openMenu();
    const guides = within(menu).getByRole('menuitemcheckbox', {
      name: 'Guides',
    });
    await userEvent.click(guides);
    await expect(guides).toHaveAttribute('aria-checked', 'true');
    await expect(mark(guides)).not.toBeNull();
  },
};

const share = (
  <>
    <DropdownMenuItem id="copy">Copy link</DropdownMenuItem>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
      <DropdownMenuSubContent aria-label="Share">
        <DropdownMenuItem id="email">Email</DropdownMenuItem>
        <DropdownMenuItem id="message">Message</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </>
);

// The arrow key opens a submenu beside its item, with its first item level
// with the trigger, and the trigger stays highlighted while focus is inside.
export const Submenu: Story = {
  args: { children: share },
  play: async () => {
    const { menu } = await openMenu();
    const trigger = within(menu).getByRole('menuitem', { name: 'Share' });
    await expect(trigger).toHaveAttribute(
      'data-slot',
      'dropdown-menu-sub-trigger',
    );
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowRight}');
    const sub = await screen.findByRole('menu', { name: 'Share' });
    const panel = sub.closest<HTMLElement>(
      '[data-slot=dropdown-menu-sub-content]',
    );
    if (!panel) throw new Error('No submenu panel');
    await settled(panel);
    const email = within(sub).getByRole('menuitem', { name: 'Email' });
    await waitFor(async () => {
      await expect(email).toHaveFocus();
    });
    await expect(
      Math.abs(
        panel.getBoundingClientRect().left -
          trigger.getBoundingClientRect().right,
      ),
    ).toBeLessThanOrEqual(1);
    await expect(
      Math.abs(
        email.getBoundingClientRect().top - trigger.getBoundingClientRect().top,
      ),
    ).toBeLessThanOrEqual(1);
    await expect(trigger).toHaveAttribute('data-open', 'true');
    await expect(getComputedStyle(trigger).backgroundColor).toBe(
      tokenColor('--color-accent'),
    );
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });
  },
};

// Right to left, a submenu opens on the left and its chevron points there.
export const SubmenuRightToLeft: Story = {
  args: { children: share },
  globals: { locale: 'ar-EG' },
  play: async () => {
    const { menu } = await openMenu();
    const trigger = within(menu).getByRole('menuitem', { name: 'Share' });
    const chevron = trigger.querySelector('svg');
    if (!chevron) throw new Error('No chevron');
    await expect(getComputedStyle(chevron).rotate).toBe('180deg');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowLeft}');
    const sub = await screen.findByRole('menu', { name: 'Share' });
    const panel = sub.closest<HTMLElement>(
      '[data-slot=dropdown-menu-sub-content]',
    );
    if (!panel) throw new Error('No submenu panel');
    await settled(panel);
    await expect(panel.getBoundingClientRect().right).toBeLessThanOrEqual(
      trigger.getBoundingClientRect().left + 1,
    );
  },
};

// An item with an href is a link.
export const Links: Story = {
  args: {
    children: (
      <DropdownMenuItem href="/docs" id="docs">
        Documentation
      </DropdownMenuItem>
    ),
    defaultOpen: true,
  },
  play: async () => {
    const { menu } = await openedMenu();
    const docs = within(menu).getByRole('menuitem', { name: 'Documentation' });
    await expect(docs.tagName).toBe('A');
    await expect(docs).toHaveAttribute('href', '/docs');
  },
};
