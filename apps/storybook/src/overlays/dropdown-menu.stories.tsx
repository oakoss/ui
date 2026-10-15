import type { Meta, StoryObj } from '@storybook/react-vite';

import { Kbd, KbdGroup } from '@oakoss/ui/components/ui/data/kbd';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '@oakoss/ui/components/ui/navigation/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@oakoss/ui/components/ui/overlays/dropdown-menu';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import {
  DropdownMenuDemo,
  type DropdownMenuDemoProps,
} from './dropdown-menu-demo';
import { menuClosed, openMenu } from './menu-test';

const onAction = fn<(key: unknown) => void>();

const meta = {
  args: { onAction },
  beforeEach: () => {
    onAction.mockClear();
  },
  render: (args) => <DropdownMenuDemo {...args} />,
  title: 'Overlays/DropdownMenu',
} satisfies Meta<DropdownMenuDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// The menu opens 4px below the trigger's start edge on the popover layer;
// choosing an item runs its action, closes the menu and returns focus.
export const Default: Story = {
  play: async () => {
    const trigger = screen.getByRole('button', { name: 'Options' });
    await expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    const { menu, panel } = await openMenu();
    await expect(trigger).toHaveAttribute('aria-controls', menu.id);
    await expect(panel).toHaveAttribute('data-slot', 'dropdown-menu-content');
    await expect(panel).toHaveAttribute('data-placement', 'bottom');
    const box = panel.getBoundingClientRect();
    const anchor = trigger.getBoundingClientRect();
    await expect(Math.round(box.top - anchor.bottom)).toBe(4);
    await expect(Math.round(box.left)).toBe(Math.round(anchor.left));
    await expect(getComputedStyle(panel).zIndex).toBe('1400');
    // The trigger stays full size while React Aria holds it pressed.
    await expect(getComputedStyle(trigger).scale).toBe('1');
    const item = within(menu).getByRole('menuitem', { name: 'Duplicate' });
    await expect(item).toHaveAttribute('data-slot', 'dropdown-menu-item');
    await userEvent.click(item);
    await menuClosed();
    await expect(onAction.mock.lastCall?.[0]).toBe('duplicate');
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });
  },
};

// Arrow keys open the menu on its first item, and typing jumps to an item.
export const Keyboard: Story = {
  play: async () => {
    screen.getByRole('button', { name: 'Options' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    const menu = await screen.findByRole('menu');
    await waitFor(async () => {
      await expect(
        within(menu).getByRole('menuitem', { name: 'Edit' }),
      ).toHaveFocus();
    });
    await userEvent.keyboard('a');
    await expect(
      within(menu).getByRole('menuitem', { name: 'Archive' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await menuClosed();
    await expect(onAction.mock.lastCall?.[0]).toBe('archive');
  },
};

// A blank textValue falls back to a text label, so typeahead still reaches
// the item.
export const BlankTextValue: Story = {
  args: {
    children: (
      <>
        <DropdownMenuItem id="edit">Edit</DropdownMenuItem>
        <DropdownMenuItem id="copy" textValue=" ">
          Copy
        </DropdownMenuItem>
      </>
    ),
  },
  play: async () => {
    screen.getByRole('button', { name: 'Options' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    const menu = await screen.findByRole('menu');
    await waitFor(async () => {
      await expect(
        within(menu).getByRole('menuitem', { name: 'Edit' }),
      ).toHaveFocus();
    });
    await userEvent.keyboard('c');
    await expect(
      within(menu).getByRole('menuitem', { name: 'Copy' }),
    ).toHaveFocus();
  },
};

// A shortcut describes its item instead of joining its name, including one
// built from several keys.
export const Shortcuts: Story = {
  args: {
    children: (
      <>
        <DropdownMenuItem id="copy" shortcut="⌘C">
          Copy
        </DropdownMenuItem>
        <DropdownMenuItem
          id="paste"
          shortcut={
            <KbdGroup>
              <Kbd label="Command">⌘</Kbd>
              <Kbd>V</Kbd>
            </KbdGroup>
          }
        >
          Paste
        </DropdownMenuItem>
        <DropdownMenuItem description={null} id="cut" shortcut={null}>
          Cut
        </DropdownMenuItem>
      </>
    ),
  },
  play: async () => {
    const { menu } = await openMenu();
    const copy = within(menu).getByRole('menuitem', { name: 'Copy' });
    await expect(copy).toHaveAccessibleDescription('⌘C');
    await expect(
      copy.querySelector('[data-slot=dropdown-menu-shortcut]'),
    ).toBeVisible();
    const paste = within(menu).getByRole('menuitem', { name: 'Paste' });
    await expect(paste).toHaveAccessibleDescription(/Command\s*V/u);
    const ids = [...menu.querySelectorAll('[id]')].map(({ id }) => id);
    await expect(new Set(ids).size).toBe(ids.length);
    // A null shortcut or description renders nothing to describe the item.
    const cut = within(menu).getByRole('menuitem', { name: 'Cut' });
    await expect(cut).not.toHaveAttribute('aria-describedby');
    await expect(cut.querySelector('kbd, [slot=description]')).toBeNull();
  },
};

// A description describes its item, and stays muted until its item has
// focus.
export const Descriptions: Story = {
  args: {
    children: (
      <>
        <DropdownMenuItem description="Visible to your team" id="share">
          Share
        </DropdownMenuItem>
        <DropdownMenuItem id="rename">Rename</DropdownMenuItem>
      </>
    ),
  },
  play: async () => {
    const { menu } = await openMenu();
    const share = within(menu).getByRole('menuitem', { name: 'Share' });
    await expect(share).toHaveAccessibleDescription('Visible to your team');
  },
};

// A menu with nothing in it says so.
export const Empty: Story = {
  args: { children: [], emptyLabel: 'No actions available' },
  play: async () => {
    const { menu } = await openMenu();
    const empty = within(menu).getByText('No actions available');
    await expect(empty).toBeVisible();
    await expect(getComputedStyle(empty).paddingInline).toBe('8px');
    await expect(getComputedStyle(empty).paddingBlock).toBe('6px');
  },
};

// A blank empty label shows nothing, rather than an unnamed row.
export const BlankEmptyLabel: Story = {
  args: { children: [], emptyLabel: ' ' },
  play: async () => {
    const { menu } = await openMenu();
    await expect(within(menu).queryByRole('menuitem')).toBeNull();
    await expect(menu).toBeEmptyDOMElement();
  },
};

// A passed placement wins, and an undefined offset keeps the 4px default.
export const Placement: Story = {
  play: async () => {
    const { panel } = await openMenu();
    const box = panel.getBoundingClientRect();
    const anchor = screen
      .getByRole('button', { name: 'Options' })
      .getBoundingClientRect();
    await expect(Math.round(box.right)).toBe(Math.round(anchor.right));
    await expect(Math.round(box.top - anchor.bottom)).toBe(4);
  },
  render: (args) => (
    <DropdownMenuDemo {...args} offset={undefined} placement="bottom end" />
  ),
};

// The menu sizes to its items, at least 8rem, rather than the trigger.
export const Width: Story = {
  args: {
    children: (
      <DropdownMenuItem id="long">
        A noticeably longer action than the trigger
      </DropdownMenuItem>
    ),
    triggerLabel: 'Go',
  },
  play: async () => {
    const { menu, panel } = await openMenu('Go');
    const item = within(menu).getByRole('menuitem');
    await expect(item.scrollWidth).toBeLessThanOrEqual(item.clientWidth);
    await expect(panel.getBoundingClientRect().width).toBeGreaterThan(
      screen.getByRole('button', { name: 'Go' }).getBoundingClientRect().width,
    );
    await expect(getComputedStyle(panel).minWidth).toBe('128px');
  },
};

// A breadcrumb's collapsed crumbs open from a menu inside a crumb, and its
// items are links.
export const InBreadcrumb: Story = {
  play: async () => {
    const { menu } = await openMenu('Show more');
    const docs = within(menu).getByRole('menuitem', { name: 'Documentation' });
    await expect(docs.tagName).toBe('A');
    await expect(screen.getByRole('navigation').contains(menu)).toBe(false);
  },
  render: () => (
    <Breadcrumb aria-label="Breadcrumbs">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <DropdownMenuTrigger>
            <Button aria-label="Show more" size="icon-sm" variant="ghost">
              <BreadcrumbEllipsis />
            </Button>
            <DropdownMenu aria-label="Hidden pages">
              <DropdownMenuItem href="/docs" id="docs">
                Documentation
              </DropdownMenuItem>
              <DropdownMenuItem href="/docs/components" id="components">
                Components
              </DropdownMenuItem>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Dropdown Menu</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
