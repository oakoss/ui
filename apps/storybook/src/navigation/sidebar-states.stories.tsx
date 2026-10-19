import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { valueUnderMedia } from '#/helpers/media';

import { hoverFresh, leave, slowTimeout, wait } from '../overlays/overlay-test';
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
  title: 'Navigation/Sidebar/States',
} satisfies Meta<SidebarDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

const cookie = 'sidebar_story';

function Remountable(args: SidebarDemoProps) {
  const [key, setKey] = useState(0);
  return (
    <>
      <Button onPress={() => setKey(key + 1)} variant="outline">
        Remount
      </Button>
      <SidebarDemo key={key} {...args} />
    </>
  );
}

// Collapsed to icons, items keep their names in tooltips, a collapsed group
// still shows its items, and labels leave the tab order.
export const IconMode: Story = {
  args: { collapsible: 'icon' },
  play: async () => {
    const home = screen.getByRole('link', { name: 'Home' });
    await hoverFresh(home);
    await wait(600);
    await expect(screen.queryByRole('tooltip')).toBeNull();
    await userEvent.unhover(home);
    await userEvent.click(sidebarTrigger());
    await settle();
    await expect(sidebarContainer().getBoundingClientRect().width).toBe(48);
    await expect(screen.queryByRole('button', { name: 'Projects' })).toBeNull();
    await expect(screen.getByRole('link', { name: 'Project 2' })).toBeVisible();
    await expect(screen.queryByRole('link', { name: 'Tasks' })).toBeNull();
    await expect(home.getBoundingClientRect().width).toBe(32);
    await hoverFresh(home);
    await expect(
      await screen.findByRole('tooltip', {}, { timeout: slowTimeout }),
    ).toHaveTextContent('Home');
    await leave(home, 'tooltip');
  },
};

// A link marked current, by the prop or by a router setting aria-current, is
// highlighted; navigating moves the mark.
export const Current: Story = {
  play: async () => {
    const home = screen.getByRole('link', { name: 'Home' });
    const inbox = screen.getByRole('link', { name: 'Inbox' });
    const rest = getComputedStyle(inbox).backgroundColor;
    await expect(getComputedStyle(home).backgroundColor).not.toBe(rest);
    await userEvent.click(inbox);
    await expect(inbox).toHaveAttribute('aria-current', 'page');
    await expect(home).not.toHaveAttribute('aria-current');
    await expect(getComputedStyle(home).backgroundColor).toBe(rest);
  },
};

// A collapsible group holding the current page starts open, without
// animating; one the router marks later opens then.
export const GroupOpensOnCurrent: Story = {
  args: { start: '/projects/2' },
  play: async () => {
    const label = screen.getByRole('button', { name: 'Projects' });
    await expect(label).toHaveAttribute('aria-expanded', 'true');
    const panel = document.querySelector('[data-slot=collapsible-content]');
    if (!panel) throw new Error('No group panel');
    await expect(panel.getAnimations()).toEqual([]);
    await userEvent.click(label);
    await expect(label).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(screen.getByRole('link', { name: 'Home' }));
    await userEvent.click(screen.getByRole('link', { name: 'Open project 2' }));
    await waitFor(async () => {
      await expect(label).toHaveAttribute('aria-expanded', 'true');
    });
  },
};

export const GroupClosedWithoutCurrent: Story = {
  play: async () => {
    await expect(
      screen.getByRole('button', { name: 'Projects' }),
    ).toHaveAttribute('aria-expanded', 'false');
  },
};

// The content scrolls the current page into view when it mounts.
export const CurrentScrolledIntoView: Story = {
  args: { projects: 40, start: '/projects/40' },
  play: async () => {
    const content = document.querySelector('[data-slot=sidebar-content]');
    if (!content) throw new Error('No content');
    const item = screen.getByRole('link', { name: 'Project 40' });
    await waitFor(async () => {
      await expect(content.scrollTop).toBeGreaterThan(0);
    });
    const box = content.getBoundingClientRect();
    const target = item.getBoundingClientRect();
    await expect(target.top).toBeGreaterThanOrEqual(box.top);
    await expect(target.bottom).toBeLessThanOrEqual(box.bottom);
    await expect(content).toHaveAttribute('tabindex', '0');
  },
};

// An uncontrolled sidebar keeps its state in a cookie and opens that way
// again.
export const Persisted: Story = {
  args: { persistKey: cookie },
  beforeEach: async () => {
    await cookieStore.delete(cookie);
    return () => cookieStore.delete(cookie);
  },
  play: async () => {
    await userEvent.click(sidebarTrigger());
    await waitFor(async () => {
      const stored = await cookieStore.get(cookie);
      await expect(stored?.value).toBe('false');
    });
    await userEvent.click(screen.getByRole('button', { name: 'Remount' }));
    await expect(sidebarTrigger()).toHaveAttribute('aria-expanded', 'false');
  },
  render: (args) => <Remountable {...args} />,
};

// A controlled sidebar reports changes and stores nothing.
export const Controlled: Story = {
  args: {
    isOpen: true,
    onOpenChange: fn<(isOpen: boolean) => void>(),
    persistKey: cookie,
  },
  beforeEach: async () => {
    await cookieStore.delete(cookie);
  },
  play: async ({ args }) => {
    await userEvent.click(sidebarTrigger());
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await expect(sidebarTrigger()).toHaveAttribute('aria-expanded', 'true');
    await expect(await cookieStore.get(cookie)).toBeNull();
  },
};

// A hover-only action shows while its item has focus, and always on touch.
export const ActionOnHover: Story = {
  play: async () => {
    const action = screen.getByRole('button', { name: 'More settings' });
    await expect(getComputedStyle(action).opacity).toBe('0');
    await expect(valueUnderMedia(action, '(pointer: coarse)', 'opacity')).toBe(
      '1',
    );
    action.focus();
    await settle();
    await expect(getComputedStyle(action).opacity).toBe('1');
  },
};
