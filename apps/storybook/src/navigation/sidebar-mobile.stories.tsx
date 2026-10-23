import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { atViewportWidth, phoneWidth } from '#/helpers/viewport';

import { closed } from '../overlays/dialog-demo';
import { settled } from '../overlays/overlay-test';
import {
  SidebarDemo,
  type SidebarDemoProps,
  sidebarTrigger,
} from './sidebar-demo';

const meta = {
  parameters: { layout: 'fullscreen' },
  render: (args) => <SidebarDemo {...args} />,
  title: 'Navigation/Sidebar/Mobile',
} satisfies Meta<SidebarDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

function Deferred(args: SidebarDemoProps) {
  const [isShown, setIsShown] = useState(false);
  return isShown ? (
    <SidebarDemo {...args} />
  ) : (
    <Button onPress={() => setIsShown(true)}>Show sidebar</Button>
  );
}

function hasContainer() {
  return document.querySelector('[data-slot=sidebar-container]') !== null;
}

// The media query reports the new width a render after the resize.
async function phoneLayout() {
  await waitFor(async () => {
    await expect(hasContainer()).toBe(false);
  });
}

// Below Tailwind's `md`, the sidebar is a sheet named like the nav. A link
// closes it as it navigates, and focus goes back to the trigger.
export const Sheet: Story = {
  play: async () => {
    await atViewportWidth(375, async () => {
      await waitFor(async () => {
        await expect(hasContainer()).toBe(false);
      });
      const trigger = sidebarTrigger();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await expect(trigger).not.toHaveAttribute('aria-controls');
      await userEvent.click(trigger);
      const dialog = await screen.findByRole('dialog', { name: 'Main' });
      await settled(dialog);
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      const nav = within(dialog).getByRole('navigation', { name: 'Main' });
      await expect(nav).toBeVisible();
      await expect(nav.getBoundingClientRect().width).toBe(288);
      await expect(
        within(dialog).queryByRole('button', { name: 'Toggle sidebar' }),
      ).toBeNull();
      await userEvent.click(
        within(dialog).getByRole('link', { name: 'Inbox' }),
      );
      await closed();
      await waitFor(async () => {
        await expect(trigger).toHaveFocus();
      });
      await expect(screen.getByText('/inbox')).toBeVisible();
    });
  },
};

// An unnamed sidebar's sheet takes mobileLabel, or Sidebar when it's blank,
// and mobileDescription describes it.
export const UnnamedSheet: Story = {
  args: {
    'aria-label': '',
    mobileDescription: 'Pages in this workspace',
    mobileLabel: ' ',
  },
  play: async () => {
    await atViewportWidth(375, async () => {
      await phoneLayout();
      await userEvent.click(sidebarTrigger());
      const dialog = await screen.findByRole('dialog', { name: 'Sidebar' });
      await expect(dialog).toHaveAccessibleDescription(
        'Pages in this workspace',
      );
    });
  },
};

export const MobileLabel: Story = {
  args: { 'aria-label': '', mobileLabel: 'Menu' },
  play: async () => {
    await atViewportWidth(375, async () => {
      await phoneLayout();
      await userEvent.click(sidebarTrigger());
      await screen.findByRole('dialog', { name: 'Menu' });
    });
  },
};

// Ends with the sheet open at a phone's width, so the Visual run captures
// the phone layout.
export const PhoneOpen: Story = {
  beforeEach: phoneWidth,
  play: async () => {
    await phoneLayout();
    await userEvent.click(sidebarTrigger());
    await settled(await screen.findByRole('dialog', { name: 'Main' }));
  },
};

// The shortcut opens and closes the sheet; Escape closes it too.
export const SheetShortcut: Story = {
  play: async () => {
    await atViewportWidth(375, async () => {
      await waitFor(async () => {
        await expect(hasContainer()).toBe(false);
      });
      const trigger = sidebarTrigger();
      trigger.focus();
      await userEvent.keyboard('{Control>}b{/Control}');
      await screen.findByRole('dialog', { name: 'Main' });
      await userEvent.keyboard('{Escape}');
      await closed();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await waitFor(async () => {
        await expect(trigger).toHaveFocus();
      });
      trigger.blur();
    });
  },
};

// A sidebar that first renders on a phone never mounts the desktop panel.
export const FirstRenderOnPhone: Story = {
  play: async () => {
    await atViewportWidth(375, async () => {
      let isDesktopSeen = false;
      const observer = new MutationObserver(() => {
        isDesktopSeen ||= hasContainer();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      await userEvent.click(
        screen.getByRole('button', { name: 'Show sidebar' }),
      );
      await expect(sidebarTrigger()).toBeVisible();
      observer.disconnect();
      await expect(isDesktopSeen).toBe(false);
    });
  },
  render: (args) => <Deferred {...args} />,
};

// The phone layout and the panel's CSS switch at the same width.
export const Breakpoint: Story = {
  play: async () => {
    await atViewportWidth(767, async () => {
      await waitFor(async () => {
        await expect(hasContainer()).toBe(false);
      });
    });
    await atViewportWidth(768, async () => {
      await waitFor(async () => {
        await expect(hasContainer()).toBe(true);
      });
      const root = document.querySelector('[data-slot=sidebar]');
      if (!root) throw new Error('No sidebar');
      await expect(getComputedStyle(root).display).toBe('block');
    });
  },
};
