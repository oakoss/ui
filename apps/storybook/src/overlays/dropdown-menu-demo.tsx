import type { ReactNode } from 'react';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  type DropdownMenuProps,
  DropdownMenuTrigger,
} from '@oakoss/ui/components/ui/overlays/dropdown-menu';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { settled } from './overlay-test';

export type DropdownMenuDemoProps = {
  children?: ReactNode;
  defaultOpen?: boolean;
  triggerLabel?: string;
} & Omit<DropdownMenuProps, 'children' | 'items'>;

const actions = (
  <>
    <DropdownMenuItem id="edit">Edit</DropdownMenuItem>
    <DropdownMenuItem id="duplicate">Duplicate</DropdownMenuItem>
    <DropdownMenuItem id="archive">Archive</DropdownMenuItem>
  </>
);

export function DropdownMenuDemo({
  children = actions,
  defaultOpen = false,
  triggerLabel = 'Options',
  ...props
}: DropdownMenuDemoProps) {
  return (
    <div className="grid min-h-96 place-items-center">
      <DropdownMenuTrigger defaultOpen={defaultOpen}>
        <Button variant="outline">{triggerLabel}</Button>
        <DropdownMenu aria-label={triggerLabel} {...props}>
          {children}
        </DropdownMenu>
      </DropdownMenuTrigger>
    </div>
  );
}

// Resolves once the menu has unmounted, after its exit transition.
export async function menuClosed() {
  await waitFor(async () => {
    await expect(screen.queryByRole('menu')).toBeNull();
  });
}

// Opens the menu from its trigger and returns the settled menu and panel.
export async function openMenu(name = 'Options') {
  await userEvent.click(screen.getByRole('button', { name }));
  const menu = await screen.findByRole('menu');
  const panel = menu.closest<HTMLElement>('[data-slot$=menu-content]');
  if (!panel) throw new Error('No menu panel');
  await settled(panel);
  return { menu, panel };
}

// A color resolved from a CSS variable, for comparing computed styles.
export function resolvedColor(variable: string, property = 'color') {
  const probe = document.createElement('div');
  probe.style.setProperty(property, `var(${variable})`);
  document.body.append(probe);
  const value = getComputedStyle(probe).getPropertyValue(property);
  probe.remove();
  return value;
}
