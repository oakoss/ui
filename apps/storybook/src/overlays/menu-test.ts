import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { settled } from './overlay-test';

// Resolves once the menu has unmounted, after its exit transition.
export async function menuClosed() {
  await waitFor(async () => {
    await expect(screen.queryByRole('menu')).toBeNull();
  });
}

// Returns the settled menu and panel of a menu already open, such as one
// rendered with defaultOpen.
export async function openedMenu() {
  const menu = await screen.findByRole('menu');
  const panel = menu.closest<HTMLElement>('[data-slot$=menu-content]');
  if (!panel) throw new Error('No menu panel');
  await settled(panel);
  return { menu, panel };
}

// Opens the menu from its trigger and returns the settled menu and panel.
export async function openMenu(name = 'Options') {
  await userEvent.click(screen.getByRole('button', { name }));
  return openedMenu();
}
