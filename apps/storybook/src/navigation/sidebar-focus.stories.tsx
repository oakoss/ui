import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { Sidebar } from '@oakoss/ui/components/ui/navigation/sidebar';
import {
  SidebarHeader,
  SidebarInput,
} from '@oakoss/ui/components/ui/navigation/sidebar-layout';
import { SidebarProvider } from '@oakoss/ui/components/ui/navigation/sidebar-provider';
import { SidebarTrigger } from '@oakoss/ui/components/ui/navigation/sidebar-trigger';
import { useLayoutEffect, useRef, useState } from 'react';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { atViewportWidth } from '#/helpers/viewport';

import {
  settle,
  SidebarDemo,
  type SidebarDemoProps,
  sidebarTrigger,
} from './sidebar-demo';

const meta = {
  parameters: { layout: 'fullscreen' },
  render: (args) => <SidebarDemo {...args} />,
  title: 'Navigation/Sidebar/Focus',
} satisfies Meta<SidebarDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

function ControlledDemo() {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <Button onPress={() => setIsOpen(false)} variant="outline">
        Close from outside
      </Button>
      <SidebarDemo isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

// The input takes focus in its own layout effect, which runs before the
// sidebar's.
function FocusOnMount() {
  const ref = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => ref.current?.focus(), []);
  return <SidebarInput aria-label="Search" ref={ref} />;
}

function MountedWithFocus({
  collapsible,
  defaultOpen,
}: Pick<SidebarDemoProps, 'collapsible' | 'defaultOpen'>) {
  return (
    <SidebarProvider defaultOpen={defaultOpen} persistKey={false}>
      <Sidebar aria-label="Main" collapsible={collapsible}>
        <SidebarHeader>
          <FocusOnMount />
        </SidebarHeader>
      </Sidebar>
      <SidebarTrigger aria-label="Other" label="Menu" />
    </SidebarProvider>
  );
}

function TriggerInside() {
  return (
    <SidebarProvider persistKey={false}>
      <Sidebar aria-label="Main">
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
      </Sidebar>
    </SidebarProvider>
  );
}

// Focus a part took as it mounted still hands off when the window narrows.
// The trigger's name comes from label, whatever aria-label says.
export const MountFocusMovesOnPhoneWidth: Story = {
  play: async () => {
    const search = screen.getByRole('textbox', { name: 'Search' });
    await expect(search).toHaveFocus();
    await atViewportWidth(375, async () => {
      await waitFor(async () => {
        await expect(
          screen.getByRole('button', { name: 'Menu' }),
        ).toHaveFocus();
      });
    });
  },
  render: () => <MountedWithFocus />,
};

// A sidebar that starts collapsed to icons keeps focus a part took on mount.
export const IconModeMountKeepsFocus: Story = {
  play: async () => {
    const search = screen.getByRole('textbox', { name: 'Search' });
    await settle();
    await expect(search).toHaveFocus();
  },
  render: () => <MountedWithFocus collapsible="icon" defaultOpen={false} />,
};

// Collapsed to icons, the sidebar stays on screen, so focus stays put.
export const IconModeKeepsFocus: Story = {
  args: { collapsible: 'icon' },
  play: async () => {
    const home = screen.getByRole('link', { name: 'Home' });
    home.focus();
    await userEvent.keyboard('{Control>}b{/Control}');
    await expect(sidebarTrigger()).toHaveAttribute('aria-expanded', 'false');
    await expect(home).toHaveFocus();
  },
};

// A parent closing a controlled sidebar moves focus out, like the trigger does.
export const ControlledCloseMovesFocus: Story = {
  play: async () => {
    const home = screen.getByRole('link', { name: 'Home' });
    home.focus();
    screen.getByRole('button', { name: 'Close from outside' }).click();
    await waitFor(async () => {
      await expect(sidebarTrigger()).toHaveFocus();
    });
  },
  render: () => <ControlledDemo />,
};

// Narrowing to a phone unmounts the desktop panel; focus goes to the trigger.
export const PhoneWidthMovesFocus: Story = {
  play: async () => {
    const home = screen.getByRole('link', { name: 'Home' });
    home.focus();
    await atViewportWidth(375, async () => {
      await waitFor(async () => {
        await expect(sidebarTrigger()).toHaveFocus();
      });
      sidebarTrigger().blur();
    });
  },
};

// With no trigger outside it, collapsing leaves focus on the page rather than
// on a control that's about to hide.
export const TriggerOnlyInside: Story = {
  play: async () => {
    const trigger = screen.getByRole('button', { name: 'Toggle sidebar' });
    trigger.focus();
    await userEvent.keyboard('{Control>}b{/Control}');
    await settle();
    await expect(trigger).not.toHaveFocus();
    await expect(document.activeElement).toBe(document.body);
  },
  render: () => <TriggerInside />,
};
