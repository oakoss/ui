import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandHeader,
  CommandInput,
  CommandItem,
  CommandList,
} from '@oakoss/ui/components/ui/overlays/command';
import { DialogTrigger } from '@oakoss/ui/components/ui/overlays/dialog';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { tokenColor } from '#/color';
import { isPseudoHidden } from '#/pseudo';

import { settled } from './overlay-test';

const onAction = fn<(key: unknown) => void>();

function Palette() {
  return (
    <Command>
      <CommandInput placeholder="Type a command" />
      <CommandList aria-label="Commands" onAction={onAction}>
        <CommandGroup>
          <CommandHeader>Files</CommandHeader>
          <CommandItem id="new" keywords={['create']} shortcut="⌘N">
            New file
          </CommandItem>
          <CommandItem id="open">Open file</CommandItem>
        </CommandGroup>
        <CommandGroup>
          <CommandHeader>View</CommandHeader>
          <CommandItem id="theme" keywords={['dark', 'light']}>
            Toggle theme
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

const meta = {
  beforeEach: () => {
    onAction.mockClear();
  },
  component: Palette,
  decorators: [
    (Story) => (
      <div className="w-96 rounded-panel border border-border">
        <Story />
      </div>
    ),
  ],
  title: 'Overlays/Command',
} satisfies Meta<typeof Palette>;

export default meta;

type Story = StoryObj<typeof meta>;

// Typing filters the list, ignoring case; the arrow keys move a highlight
// while focus stays in the input, and Enter runs the highlighted command.
export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('searchbox', { name: 'Search' });
    await expect(input).toHaveAttribute('placeholder', 'Type a command');
    await expect(canvas.queryByText('No results')).toBeNull();
    await userEvent.type(input, 'FILE');
    // WebKit's own clear button and decoration are hidden.
    await expect(isPseudoHidden(input, '::-webkit-search-cancel-button')).toBe(
      true,
    );
    await expect(isPseudoHidden(input, '::-webkit-search-decoration')).toBe(
      true,
    );
    const menu = canvas.getByRole('menu', { name: 'Commands' });
    await waitFor(async () => {
      await expect(within(menu).getAllByRole('menuitem')).toHaveLength(2);
    });
    await userEvent.keyboard('{ArrowDown}');
    const open = within(menu).getByRole('menuitem', { name: 'Open file' });
    await expect(input).toHaveFocus();
    await waitFor(async () => {
      await expect(input).toHaveAttribute('aria-activedescendant', open.id);
    });
    await expect(getComputedStyle(open).backgroundColor).toBe(
      tokenColor('--color-accent'),
    );
    await userEvent.keyboard('{Enter}');
    await expect(onAction.mock.lastCall?.[0]).toBe('open');
  },
};

// Keywords find an item without appearing in it, and accents and case don't
// matter.
export const Keywords: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('searchbox'), 'DÁRK');
    const menu = canvas.getByRole('menu');
    await waitFor(async () => {
      await expect(within(menu).getAllByRole('menuitem')).toHaveLength(1);
    });
    const theme = within(menu).getByRole('menuitem', { name: 'Toggle theme' });
    await expect(theme).toHaveTextContent('Toggle theme');
    await expect(theme).not.toHaveTextContent(/dark/iu);
  },
};

// The empty label shows only when nothing matches, and Escape clears the
// search.
export const Empty: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('searchbox');
    await userEvent.type(input, 'zzz');
    const empty = await canvas.findByText('No results');
    await expect(empty).toBeVisible();
    await expect(getComputedStyle(empty).textAlign).toBe('center');
    await expect(getComputedStyle(empty).paddingBlock).toBe('24px');
    await expect(canvas.queryByText('New file')).toBeNull();
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
    await expect(canvas.getAllByRole('menuitem')).toHaveLength(3);
  },
};

// Groups are named by their header and divide themselves; a shortcut
// describes its item.
export const Groups: Story = {
  play: async ({ canvas }) => {
    const files = canvas.getByRole('group', { name: 'Files' });
    const view = canvas.getByRole('group', { name: 'View' });
    await expect(files).toHaveAttribute('data-slot', 'command-group');
    await expect(within(files).getByText('Files')).toHaveAttribute(
      'data-slot',
      'command-label',
    );
    await expect(getComputedStyle(files).borderTopWidth).toBe('0px');
    await expect(getComputedStyle(view).borderTopWidth).toBe('1px');
    await expect(
      canvas.getByRole('menuitem', { name: 'New file' }),
    ).toHaveAccessibleDescription('⌘N');
  },
};

// The dialog is named by its title and focuses the input; Escape first
// clears the search, then closes the dialog and returns focus.
export const InDialog: Story = {
  decorators: [(Story) => <Story />],
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Open palette' });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', {
      name: 'Command palette',
    });
    const panel = dialog.closest<HTMLElement>(
      '[data-slot=command-dialog-content]',
    );
    if (!panel) throw new Error('No dialog panel');
    await settled(panel);
    const input = within(dialog).getByRole('searchbox');
    await waitFor(async () => {
      await expect(input).toHaveFocus();
    });
    await expect(within(dialog).queryByRole('button')).toBeNull();
    await userEvent.type(input, 'new');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
    await expect(dialog).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(screen.queryByRole('dialog')).toBeNull();
    });
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });
  },
  render: () => (
    <DialogTrigger>
      <Button variant="outline">Open palette</Button>
      <CommandDialog>
        <Palette />
      </CommandDialog>
    </DialogTrigger>
  ),
};

// In forced colors the highlighted item takes the system's selection colors.
export const ForcedColors: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('searchbox'), 'file');
    await userEvent.keyboard('{ArrowDown}');
    const open = canvas.getByRole('menuitem', { name: 'Open file' });
    await waitFor(async () => {
      await expect(open).toHaveAttribute('data-focused', 'true');
    });
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'Highlight';
    document.body.append(probe);
    await expect(getComputedStyle(open).backgroundColor).toBe(
      getComputedStyle(probe).backgroundColor,
    );
    probe.remove();
  },
  tags: ['forced-colors'],
};
