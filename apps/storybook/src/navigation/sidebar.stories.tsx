import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

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
  title: 'Navigation/Sidebar',
} satisfies Meta<SidebarDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// A named sidebar is a navigation landmark of lists; the trigger reports it
// open and names the panel it controls.
export const Default: Story = {
  play: async () => {
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const trigger = sidebarTrigger();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute(
      'aria-controls',
      sidebarContainer().id,
    );
    await expect(sidebarContainer().getBoundingClientRect().width).toBe(256);
    await expect(nav.querySelectorAll(':scope ul > li').length).toBeGreaterThan(
      0,
    );
    await expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  },
};

// Hidden off-canvas, the links leave the tab order and the accessibility tree;
// focus inside moves to the trigger first.
export const CollapseOffcanvas: Story = {
  play: async () => {
    const home = screen.getByRole('link', { name: 'Home' });
    home.focus();
    await userEvent.keyboard('{Control>}b{/Control}');
    const trigger = sidebarTrigger();
    await expect(trigger).toHaveFocus();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await settle();
    await expect(getComputedStyle(home).visibility).toBe('hidden');
    await expect(sidebarContainer().getBoundingClientRect().right).toBe(0);
    await userEvent.click(trigger);
    await settle();
    await expect(getComputedStyle(home).visibility).toBe('visible');
    await expect(sidebarContainer().getBoundingClientRect().left).toBe(0);
  },
};

// The rail stays at the page's edge while the sidebar is off-canvas, and
// opens it again.
export const Rail: Story = {
  play: async () => {
    const rail = screen
      .getAllByRole('button', { name: 'Toggle sidebar' })
      .find((element) => element.dataset.slot === 'sidebar-rail');
    if (!rail) throw new Error('No rail');
    await expect(rail).toHaveAttribute('tabindex', '-1');
    await userEvent.click(rail);
    await settle();
    await expect(sidebarTrigger()).toHaveAttribute('aria-expanded', 'false');
    await expect(getComputedStyle(rail).visibility).toBe('visible');
    await expect(rail.getBoundingClientRect().right).toBeGreaterThan(0);
    await userEvent.click(rail);
    await expect(sidebarTrigger()).toHaveAttribute('aria-expanded', 'true');
    await expect(rail).not.toHaveFocus();
  },
};

// The shortcut skips typing, where Cmd+B is bold, and other modifiers.
export const Shortcut: Story = {
  play: async () => {
    const trigger = sidebarTrigger();
    await userEvent.click(screen.getByRole('textbox', { name: 'Notes' }));
    await userEvent.keyboard('{Control>}b{/Control}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    trigger.focus();
    await userEvent.keyboard('{Meta>}b{/Meta}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{Control>}{Shift>}b{/Shift}{/Control}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{Control>}b{/Control}');
    await waitFor(async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  },
};

export const ShortcutOff: Story = {
  args: { keyboardShortcut: false },
  play: async () => {
    const trigger = sidebarTrigger();
    trigger.focus();
    await userEvent.keyboard('{Control>}b{/Control}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};

export const CustomShortcut: Story = {
  args: { keyboardShortcut: 'j' },
  play: async () => {
    const trigger = sidebarTrigger();
    trigger.focus();
    await userEvent.keyboard('{Control>}b{/Control}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Control>}j{/Control}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

// A rail's onPress runs before it toggles, as the trigger's does.
export const RailOnPress: Story = {
  args: { onRailPress: fn<() => void>() },
  play: async ({ args }) => {
    const rail = screen
      .getAllByRole('button', { name: 'Toggle sidebar' })
      .find((element) => element.dataset.slot === 'sidebar-rail');
    if (!rail) throw new Error('No rail');
    await userEvent.click(rail);
    await expect(args.onRailPress).toHaveBeenCalledTimes(1);
    await expect(sidebarTrigger()).toHaveAttribute('aria-expanded', 'false');
  },
};

// Groups open for the current page in browsers without Set's newer methods,
// such as Safari 16.
export const WithoutSetMethods: Story = {
  args: { start: '/projects/2' },
  beforeEach: () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      Set.prototype,
      'isSubsetOf',
    );
    Reflect.deleteProperty(Set.prototype, 'isSubsetOf');
    return () => {
      if (descriptor) {
        // oxlint-disable-next-line no-extend-native -- puts back the built-in this story removed
        Object.defineProperty(Set.prototype, 'isSubsetOf', descriptor);
      }
    };
  },
  play: async () => {
    await expect(
      screen.getByRole('button', { name: 'Projects' }),
    ).toHaveAttribute('aria-expanded', 'true');
  },
};

// A sidebar that can't collapse ignores the shortcut.
export const NotCollapsible: Story = {
  args: { collapsible: 'none' },
  play: async () => {
    const trigger = sidebarTrigger();
    trigger.focus();
    await userEvent.keyboard('{Control>}b{/Control}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  },
};
