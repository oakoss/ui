import type { Meta, StoryObj } from '@storybook/react-vite';

import { DropdownMenuItem } from '@oakoss/ui/components/ui/overlays/dropdown-menu';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { computedColor, tokenColor } from '#/helpers/color';

import {
  DropdownMenuDemo,
  type DropdownMenuDemoProps,
} from './dropdown-menu-demo';
import { openedMenu, openMenu } from './menu-test';

const meta = {
  render: (args) => <DropdownMenuDemo {...args} />,
  title: 'Overlays/DropdownMenu/Intents',
} satisfies Meta<DropdownMenuDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

const destructive = (
  <>
    <DropdownMenuItem id="rename">Rename</DropdownMenuItem>
    <DropdownMenuItem id="delete" intent="destructive">
      Delete
    </DropdownMenuItem>
  </>
);

// A destructive item reads in the destructive color.
export const Destructive: Story = {
  args: { children: destructive, defaultOpen: true },
  play: async () => {
    const { menu } = await openedMenu();
    const remove = within(menu).getByRole('menuitem', { name: 'Delete' });
    await expect(getComputedStyle(remove).color).toBe(
      tokenColor('--color-destructive-text'),
    );
  },
};

// A focused destructive item keeps its color on its subtle fill.
export const DestructiveFocused: Story = {
  args: { children: destructive },
  play: async () => {
    const { menu } = await openMenu();
    const remove = within(menu).getByRole('menuitem', { name: 'Delete' });
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await waitFor(async () => {
      await expect(remove).toHaveFocus();
    });
    await Promise.all(remove.getAnimations().map((a) => a.finished));
    await expect(getComputedStyle(remove).backgroundColor).toBe(
      tokenColor('--color-destructive-subtle'),
    );
    await expect(getComputedStyle(remove).color).toBe(
      tokenColor('--color-destructive-text'),
    );
  },
};

// The focused item takes the system's selection colors in forced colors,
// destructive or not, and a disabled one stays at full opacity in GrayText.
export const ForcedColors: Story = {
  args: {
    children: (
      <>
        <DropdownMenuItem id="delete" intent="destructive">
          Delete
        </DropdownMenuItem>
        <DropdownMenuItem id="archive" isDisabled>
          Archive
        </DropdownMenuItem>
      </>
    ),
  },
  play: async () => {
    screen.getByRole('button', { name: 'Options' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    const menu = await screen.findByRole('menu');
    const remove = within(menu).getByRole('menuitem', { name: 'Delete' });
    await waitFor(async () => {
      await expect(remove).toHaveFocus();
    });
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'Highlight';
    probe.style.color = 'HighlightText';
    document.body.append(probe);
    await expect(getComputedStyle(remove).backgroundColor).toBe(
      getComputedStyle(probe).backgroundColor,
    );
    await expect(getComputedStyle(remove).color).toBe(
      getComputedStyle(probe).color,
    );
    probe.remove();
    // Opted out, so no backplate covers the Highlight fill.
    await expect(getComputedStyle(remove).forcedColorAdjust).toBe('none');
    const archive = within(menu).getByRole('menuitem', { name: 'Archive' });
    await expect(getComputedStyle(archive).opacity).toBe('1');
    await expect(getComputedStyle(archive).color).toBe(
      computedColor('GrayText'),
    );
  },
  tags: ['forced-colors'],
};
