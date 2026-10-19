import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { Sidebar } from '@oakoss/ui/components/ui/navigation/sidebar';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from '@oakoss/ui/components/ui/navigation/sidebar-group';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@oakoss/ui/components/ui/navigation/sidebar-menu';
import { SidebarProvider } from '@oakoss/ui/components/ui/navigation/sidebar-provider';
import { SidebarTrigger } from '@oakoss/ui/components/ui/navigation/sidebar-trigger';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { hoverFresh, leave, slowTimeout, wait } from '../overlays/overlay-test';
import {
  settle,
  SidebarDemo,
  type SidebarDemoProps,
  sidebarTrigger,
} from './sidebar-demo';

const meta = {
  parameters: { layout: 'fullscreen' },
  render: (args) => <SidebarDemo {...args} />,
  title: 'Navigation/Sidebar/Parts',
} satisfies Meta<SidebarDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

function ChangingGroup() {
  const [items, setItems] = useState(['Current', 'Other']);
  return (
    <RouterProvider navigate={() => undefined}>
      <SidebarProvider persistKey={false}>
        <Button onPress={() => setItems([...items, 'Added'])} variant="outline">
          Add item
        </Button>
        <Button onPress={() => setItems(items.toReversed())} variant="outline">
          Reorder
        </Button>
        <Sidebar aria-label="Main" collapsible="none">
          <SidebarGroup isCollapsible>
            <SidebarGroupLabel>Projects</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item}>
                    <SidebarMenuButton
                      href={`/${item}`}
                      isCurrent={item === 'Current'}
                    >
                      {item}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>
    </RouterProvider>
  );
}

function Parts() {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <RouterProvider navigate={() => undefined}>
      <SidebarProvider persistKey={false}>
        <Button onPress={() => setIsLoaded(true)} variant="outline">
          Load projects
        </Button>
        <Sidebar aria-label="Main" collapsible="none">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isCurrent>Overview</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>Reports</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton aria-current="page" href="/routed">
                Routed
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarGroup isCollapsible>
            <SidebarGroupLabel>Loaded</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {isLoaded ? (
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/loaded" isCurrent>
                      Loaded project
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </Sidebar>
        <SidebarTrigger label=" " />
      </SidebarProvider>
    </RouterProvider>
  );
}

// A group the user closed stays closed when items are added or reordered
// around a link that stays current.
export const ClosedGroupStaysClosed: Story = {
  play: async () => {
    const label = screen.getByRole('button', { name: 'Projects' });
    await expect(label).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(label);
    await expect(label).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'Add item' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reorder' }));
    await wait(100);
    await expect(label).toHaveAttribute('aria-expanded', 'false');
    // React Aria hides the closed panel once its transition ends.
    await settle();
    await waitFor(async () => {
      await expect(
        document.querySelector('[data-slot=collapsible-content]'),
      ).toHaveAttribute('hidden');
    });
  },
  render: () => <ChangingGroup />,
};

// A current button takes data-current itself, and a router link that sets
// aria-current is current without the prop; both take the current look.
export const CurrentButtonAndRouterLink: Story = {
  play: async () => {
    const overview = screen.getByRole('button', { name: 'Overview' });
    const reports = screen.getByRole('button', { name: 'Reports' });
    const routed = screen.getByRole('link', { name: 'Routed' });
    await expect(overview).toHaveAttribute('aria-current', 'true');
    await expect(overview).toHaveAttribute('data-current');
    await expect(routed).toHaveAttribute('data-current');
    const rest = getComputedStyle(reports).backgroundColor;
    await expect(getComputedStyle(overview).backgroundColor).not.toBe(rest);
    await expect(getComputedStyle(routed).backgroundColor).not.toBe(rest);
  },
  render: () => <Parts />,
};

// A group opens when a current link is added to it after it mounts.
export const GroupOpensOnAddedCurrent: Story = {
  play: async () => {
    const label = screen.getByRole('button', { name: 'Loaded' });
    await expect(label).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(
      screen.getByRole('button', { name: 'Load projects' }),
    );
    await waitFor(async () => {
      await expect(label).toHaveAttribute('aria-expanded', 'true');
    });
  },
  render: () => <Parts />,
};

// A blank label falls back to the default name, and the tooltip shows no
// shortcut for a sidebar that can't collapse.
export const BlankLabelAndNoShortcut: Story = {
  play: async () => {
    const trigger = screen.getByRole('button', { name: 'Toggle sidebar' });
    await hoverFresh(trigger);
    const tooltip = await screen.findByRole(
      'tooltip',
      {},
      { timeout: slowTimeout },
    );
    await expect(tooltip.querySelector('kbd')).toBeNull();
    await leave(trigger, 'tooltip');
  },
  render: () => <Parts />,
};

// The trigger's tooltip shows the shortcut for the platform.
export const ShortcutInTooltip: Story = {
  play: async () => {
    const trigger = sidebarTrigger();
    await hoverFresh(trigger);
    const tooltip = await screen.findByRole(
      'tooltip',
      {},
      { timeout: slowTimeout },
    );
    await expect(tooltip.querySelector('kbd')?.textContent).toMatch(
      /^(⌘|Ctrl\+)B$/u,
    );
    await leave(trigger, 'tooltip');
  },
};

// Alt or a held key doesn't toggle, and a blank shortcut turns it off.
export const ShortcutModifiers: Story = {
  play: async () => {
    const trigger = sidebarTrigger();
    trigger.focus();
    await userEvent.keyboard('{Control>}{Alt>}b{/Alt}{/Control}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    trigger.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        ctrlKey: true,
        key: 'b',
        repeat: true,
      }),
    );
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};

export const BlankShortcut: Story = {
  args: { keyboardShortcut: ' ' },
  play: async () => {
    await userEvent.keyboard('{Control>} {/Control}');
    await expect(sidebarTrigger()).toHaveAttribute('aria-expanded', 'true');
  },
};

// A group told to start closed stays closed though it holds the current page.
export const DefaultExpandedWins: Story = {
  args: { projectsExpanded: false, start: '/projects/2' },
  play: async () => {
    await expect(
      screen.getByRole('button', { name: 'Projects' }),
    ).toHaveAttribute('aria-expanded', 'false');
  },
};

// Once the user presses in the sidebar, a current page that shows up later
// doesn't scroll it.
export const RevealStopsOnInteraction: Story = {
  args: { projects: 40, projectsExpanded: false, start: '/projects/40' },
  play: async () => {
    const content = document.querySelector('[data-slot=sidebar-content]');
    if (!content) throw new Error('No content');
    const label = screen.getByRole('button', { name: 'Projects' });
    await userEvent.click(label);
    await settle();
    await expect(label).toHaveAttribute('aria-expanded', 'true');
    await expect(content.scrollTop).toBe(0);
  },
};

// persistKey={false} stores nothing.
export const NoPersistence: Story = {
  beforeEach: async () => {
    await cookieStore.delete('sidebar_state');
  },
  play: async () => {
    await userEvent.click(sidebarTrigger());
    await expect(sidebarTrigger()).toHaveAttribute('aria-expanded', 'false');
    await expect(await cookieStore.get('sidebar_state')).toBeNull();
  },
};

// A page that can't read cookies, such as a sandboxed iframe, starts the
// sidebar from defaultOpen instead of failing to render.
export const BlockedCookies: Story = {
  args: { defaultOpen: false, persistKey: 'sidebar_blocked' },
  beforeEach: () => {
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get() {
        throw new DOMException('Blocked', 'SecurityError');
      },
    });
    return () => {
      Reflect.deleteProperty(document, 'cookie');
    };
  },
  play: async () => {
    await expect(sidebarTrigger()).toHaveAttribute('aria-expanded', 'false');
  },
};
