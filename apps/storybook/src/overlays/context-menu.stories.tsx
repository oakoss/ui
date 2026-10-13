import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@oakoss/ui/components/ui/overlays/context-menu';
import { Pressable } from 'react-aria-components';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { menuClosed } from './dropdown-menu-demo';
import { settled } from './overlay-test';

const onAction = fn<(key: unknown) => void>();

// The target is focusable inside Pressable, so the keyboard can open the
// menu too.
function ContextMenuDemo() {
  return (
    <div className="grid min-h-96 place-items-center">
      <ContextMenuTrigger>
        <Pressable>
          <div
            aria-label="report.pdf"
            className="grid h-40 w-96 place-items-center rounded-panel border border-dashed border-input text-sm text-muted-foreground"
            role="button"
            tabIndex={0}
          >
            Right-click the file
          </div>
        </Pressable>
        <ContextMenu onAction={onAction}>
          <ContextMenuItem id="open">Open</ContextMenuItem>
          <ContextMenuItem id="rename">Rename</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem id="delete" intent="destructive">
            Delete
          </ContextMenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    </div>
  );
}

const meta = {
  beforeEach: () => {
    onAction.mockClear();
  },
  component: ContextMenuDemo,
  title: 'Overlays/ContextMenu',
} satisfies Meta<typeof ContextMenuDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

// The menu takes its target's name.
async function settledMenu() {
  const menu = await screen.findByRole('menu', { name: 'report.pdf' });
  const panel = menu.closest<HTMLElement>('[data-slot=context-menu-content]');
  if (!panel) throw new Error('No menu panel');
  await settled(panel);
  return { menu, panel };
}

// A right-click opens the menu with its corner on the pointer, sized to its
// items rather than the target. The target announces no popup, since a
// context menu isn't its main action.
export const RightClick: Story = {
  play: async ({ canvas }) => {
    const target = canvas.getByRole('button', { name: 'report.pdf' });
    await expect(target).not.toHaveAttribute('aria-haspopup');
    const { left, top } = target.getBoundingClientRect();
    const point = { clientX: left + 40, clientY: top + 30 };
    await userEvent.pointer({ coords: point, keys: '[MouseRight]', target });
    const { menu, panel } = await settledMenu();
    const box = panel.getBoundingClientRect();
    await expect(Math.abs(box.left - point.clientX)).toBeLessThanOrEqual(1);
    await expect(Math.abs(box.top - point.clientY)).toBeLessThanOrEqual(1);
    await expect(box.width).toBeLessThan(target.getBoundingClientRect().width);
    await userEvent.click(
      within(menu).getByRole('menuitem', { name: 'Rename' }),
    );
    await menuClosed();
    await expect(onAction.mock.lastCall?.[0]).toBe('rename');
  },
};

// Shift+F10 and the context menu key make the browser fire contextmenu on
// the focused target, which tests can't press, so the story sends that
// event. The menu opens on its first item, and Escape returns focus.
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    const target = canvas.getByRole('button', { name: 'report.pdf' });
    await userEvent.tab();
    await expect(target).toHaveFocus();
    const { left, top } = target.getBoundingClientRect();
    target.dispatchEvent(
      new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        clientX: left,
        clientY: top,
      }),
    );
    const { menu } = await settledMenu();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(async () => {
      await expect(
        within(menu).getByRole('menuitem', { name: 'Open' }),
      ).toHaveFocus();
    });
    await userEvent.keyboard('{Escape}');
    await menuClosed();
    await waitFor(async () => {
      await expect(target).toHaveFocus();
    });
  },
};
