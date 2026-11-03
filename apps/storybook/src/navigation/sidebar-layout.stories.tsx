import type { Meta, StoryObj } from '@storybook/react-vite';

import { SidebarInset } from '@oakoss/ui/components/ui/navigation/sidebar';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@oakoss/ui/components/ui/navigation/sidebar-menu';
import { SidebarProvider } from '@oakoss/ui/components/ui/navigation/sidebar-provider';
import { expect, screen, userEvent } from 'storybook/test';

import { computedColor } from '#/helpers/color';

import {
  settle,
  sidebarContainer,
  SidebarDemo,
  type SidebarDemoProps,
  sidebarTrigger,
} from './sidebar-demo';

const meta = {
  parameters: { layout: 'fullscreen' },
  render: (args) => <SidebarDemo {...args} />,
  title: 'Navigation/Sidebar/Layout',
} satisfies Meta<SidebarDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

function inset() {
  const element = document.querySelector('[data-slot=sidebar-inset]');
  if (!element) throw new Error('No inset');
  return element;
}

// An end sidebar sits at the far edge and slides off it; the page content
// stays before it.
export const SideEnd: Story = {
  args: { side: 'end' },
  play: async () => {
    await expect(sidebarContainer().getBoundingClientRect().right).toBe(
      innerWidth,
    );
    await expect(inset().getBoundingClientRect().right).toBeLessThanOrEqual(
      sidebarContainer().getBoundingClientRect().left,
    );
    await userEvent.click(sidebarTrigger());
    await settle();
    await expect(sidebarContainer().getBoundingClientRect().left).toBe(
      innerWidth,
    );
  },
};

export const SideEndCollapsed: Story = {
  args: { defaultOpen: false, side: 'end' },
  play: async () => {
    await expect(sidebarContainer().getBoundingClientRect().left).toBe(
      innerWidth,
    );
  },
};

// Start and end follow the text direction.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    await expect(sidebarContainer().getBoundingClientRect().right).toBe(
      innerWidth,
    );
    await userEvent.click(sidebarTrigger());
    await settle();
    await expect(sidebarContainer().getBoundingClientRect().left).toBe(
      innerWidth,
    );
  },
};

export const RightToLeftCollapsed: Story = {
  args: { defaultOpen: false },
  globals: { locale: 'ar-EG' },
  play: async () => {
    await expect(sidebarContainer().getBoundingClientRect().left).toBe(
      innerWidth,
    );
  },
};

// A floating panel is inset from the edge with a border and rounded corners,
// and its icon rail is wider by that padding.
export const Floating: Story = {
  args: { collapsible: 'icon', variant: 'floating' },
  play: async () => {
    const inner = document.querySelector('[data-slot=sidebar-inner]');
    if (!inner) throw new Error('No inner panel');
    const style = getComputedStyle(inner);
    await expect(style.borderTopWidth).toBe('1px');
    await expect(style.borderTopLeftRadius).not.toBe('0px');
    await expect(inner.getBoundingClientRect().left).toBe(8);
    await userEvent.click(sidebarTrigger());
    await settle();
    await expect(sidebarContainer().getBoundingClientRect().width).toBe(66);
  },
};

export const FloatingCollapsed: Story = {
  args: { collapsible: 'icon', defaultOpen: false, variant: 'floating' },
  play: async () => {
    await expect(sidebarContainer().getBoundingClientRect().width).toBe(66);
  },
};

// An inset sidebar's page content is a card beside it, flush on the sidebar's
// side until it collapses.
export const Inset: Story = {
  args: { variant: 'inset' },
  play: async () => {
    const style = getComputedStyle(inset());
    await expect(style.marginTop).toBe('8px');
    await expect(style.marginLeft).toBe('0px');
    await expect(style.borderTopLeftRadius).not.toBe('0px');
    await userEvent.click(sidebarTrigger());
    await settle();
    await expect(getComputedStyle(inset()).marginLeft).toBe('8px');
  },
};

export const InsetCollapsed: Story = {
  args: { defaultOpen: false, variant: 'inset' },
  play: async () => {
    await expect(getComputedStyle(inset()).marginLeft).toBe('8px');
  },
};

// Forced colors repaint the current item's fill, so it takes Highlight.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const home = screen.getByRole('link', { name: 'Home' });
    const inbox = screen.getByRole('link', { name: 'Inbox' });
    await expect(getComputedStyle(home).backgroundColor).toBe(
      computedColor('Highlight'),
    );
    await expect(getComputedStyle(home).color).toBe(
      computedColor('HighlightText'),
    );
    await expect(getComputedStyle(inbox).backgroundColor).not.toBe(
      computedColor('Highlight'),
    );
  },
  tags: ['forced-colors'],
};

// The inset is the page's main landmark, or a div inside a layout that has
// one.
export const InsetElement: Story = {
  play: async () => {
    await expect(screen.getByRole('main')).toBe(inset());
  },
};

export const InsetAsDiv: Story = {
  play: async () => {
    await expect(screen.queryByRole('main')).toBeNull();
    await expect(inset().tagName).toBe('DIV');
  },
  render: () => (
    <SidebarProvider persistKey={false}>
      <SidebarInset elementType="div">Content</SidebarInset>
    </SidebarProvider>
  ),
};

// Each row's share of its width, by the bar's own item.
function skeletonShares(item: string) {
  return [
    ...document.querySelectorAll<HTMLElement>(
      `[data-slot=${CSS.escape(item)}] > [data-slot=sidebar-menu-skeleton]`,
    ),
  ].map((row) => {
    const style = getComputedStyle(row);
    const room =
      row.clientWidth -
      Number(style.paddingInlineStart.replace('px', '')) -
      Number(style.paddingInlineEnd.replace('px', ''));
    const bar = row.lastElementChild?.getBoundingClientRect().width ?? 0;
    return Math.round((bar / room) * 100);
  });
}

// Placeholder rows vary in width by their item's place in the list, without
// an inline style, so the server and the client render the same classes and
// rows in a submenu vary like the menu's.
export const Skeleton: Story = {
  play: async () => {
    const menu = skeletonShares('sidebar-menu-item');
    await expect(new Set(menu).size).toBeGreaterThan(1);
    await expect(skeletonShares('sidebar-menu-sub-item')).toEqual(menu);
    await expect(
      document.querySelector(
        '[data-slot=sidebar-menu-skeleton][style], [data-slot=sidebar-menu-skeleton] [style]',
      ),
    ).toBeNull();
  },
  render: () => (
    <SidebarProvider persistKey={false}>
      <SidebarMenu className="w-64">
        {Array.from({ length: 5 }, (_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuSkeleton />
            {index === 3 ? (
              <SidebarMenuSub>
                {Array.from({ length: 5 }, (_, subIndex) => (
                  <SidebarMenuSubItem key={subIndex}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            ) : null}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarProvider>
  ),
};
