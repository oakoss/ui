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

import { tokenColor } from '#/color';
import { part } from '#/parts';

import {
  DropdownMenuDemo,
  type DropdownMenuDemoProps,
} from './dropdown-menu-demo';
import { openMenu } from './menu-test';
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
  args: { children: view },
  play: async () => {
    const { menu } = await openMenu();
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
    await userEvent.click(guides);
    await expect(guides).toHaveAttribute('aria-checked', 'true');
    await expect(mark(guides)).not.toBeNull();
  },
};

// A destructive item reads in the destructive color, and keeps it on its
// subtle fill while focused.
export const Destructive: Story = {
  args: {
    children: (
      <>
        <DropdownMenuItem id="rename">Rename</DropdownMenuItem>
        <DropdownMenuItem id="delete" intent="destructive">
          Delete
        </DropdownMenuItem>
      </>
    ),
  },
  play: async () => {
    const { menu } = await openMenu();
    const remove = within(menu).getByRole('menuitem', { name: 'Delete' });
    await expect(getComputedStyle(remove).color).toBe(
      tokenColor('--color-destructive-text'),
    );
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await waitFor(async () => {
      await expect(remove).toHaveFocus();
    });
    await Promise.all(remove.getAnimations().map((a) => a.finished));
    await expect(getComputedStyle(remove).backgroundColor).toBe(
      tokenColor('--color-destructive-subtle'),
    );
    await expect(getComputedStyle(remove).color).toBe(
      tokenColor('--color-destructive-text'),
    );
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
  },
  play: async () => {
    const { menu } = await openMenu();
    const docs = within(menu).getByRole('menuitem', { name: 'Documentation' });
    await expect(docs.tagName).toBe('A');
    await expect(docs).toHaveAttribute('href', '/docs');
  },
};

// The focused item takes the system's selection colors in forced colors,
// destructive or not.
export const ForcedColors: Story = {
  args: {
    children: (
      <DropdownMenuItem id="delete" intent="destructive">
        Delete
      </DropdownMenuItem>
    ),
  },
  play: async () => {
    screen.getByRole('button', { name: 'Options' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    const menu = await screen.findByRole('menu');
    const remove = within(menu).getByRole('menuitem', { name: 'Delete' });
    await waitFor(async () => {
      await expect(remove).toHaveFocus();
    });
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'Highlight';
    probe.style.color = 'HighlightText';
    document.body.append(probe);
    await expect(getComputedStyle(remove).backgroundColor).toBe(
      getComputedStyle(probe).backgroundColor,
    );
    await expect(getComputedStyle(remove).color).toBe(
      getComputedStyle(probe).color,
    );
    probe.remove();
  },
  tags: ['forced-colors'],
};
