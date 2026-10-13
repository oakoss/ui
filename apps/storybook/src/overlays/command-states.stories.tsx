import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
  type CommandProps,
  CommandSeparator,
} from '@oakoss/ui/components/ui/overlays/command';
import { DialogTrigger } from '@oakoss/ui/components/ui/overlays/dialog';
import { useFilter } from 'react-aria-components';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { settled } from './overlay-test';

const count = 3;

function Labels(props: Omit<CommandProps, 'children'>) {
  return (
    <Command {...props}>
      <CommandInput />
      <CommandList aria-label="Commands">
        <CommandItem id="delete">Delete {count} files</CommandItem>
        <CommandItem id="rename" textValue="Rename">
          <b>Edit name</b>
        </CommandItem>
        <CommandItem id="copy" textValue="">
          Copy
        </CommandItem>
        <CommandSeparator />
        <CommandItem id="help">Help</CommandItem>
      </CommandList>
    </Command>
  );
}

const meta = {
  component: Labels,
  decorators: [
    (Story) => (
      <div className="w-96 rounded-panel border border-border">
        <Story />
      </div>
    ),
  ],
  title: 'Overlays/Command/States',
} satisfies Meta<typeof Labels>;

export default meta;

type Story = StoryObj<typeof meta>;

async function search(text: string) {
  const input = screen.getByRole('searchbox');
  await userEvent.clear(input);
  await userEvent.type(input, text);
  const menu = screen.getByRole('menu');
  await waitFor(async () => {
    await expect(within(menu).getAllByRole('menuitem')).toHaveLength(1);
  });
  return within(menu).getByRole('menuitem');
}

// An interpolated label is searchable as one string, a textValue wins over
// rich children, and a blank textValue falls back to a text label.
export const ItemText: Story = {
  play: async () => {
    await expect(await search('delete 3 f')).toHaveAccessibleName(
      'Delete 3 files',
    );
    await expect(await search('rename')).toHaveAccessibleName('Edit name');
    await expect(await search('copy')).toHaveAccessibleName('Copy');
  },
};

// A separator sits between items, and filtering hides it with them.
export const Separator: Story = {
  play: async ({ canvas }) => {
    const separator = canvas.getByRole('separator');
    await expect(separator).toHaveAttribute('data-slot', 'command-separator');
    await search('help');
    await expect(canvas.queryByRole('separator')).toBeNull();
  },
};

function StartsWith() {
  const { startsWith } = useFilter({ sensitivity: 'base' });
  return <Labels filter={startsWith} />;
}

// A filter passed in replaces the default contains match.
export const CustomFilter: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('searchbox'), 'files');
    await expect(await canvas.findByText('No results')).toBeVisible();
    await expect(await search('del')).toHaveAccessibleName('Delete 3 files');
  },
  render: () => <StartsWith />,
};

// A blank name falls back to Search, a label elsewhere replaces it, and a
// blank empty label shows nothing.
export const BlankLabels: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('searchbox', { name: 'Find a page' }),
    ).not.toHaveAttribute('aria-label');
    await userEvent.type(
      canvas.getByRole('searchbox', { name: 'Search' }),
      'zzz',
    );
    const menu = canvas.getByRole('menu', { name: 'Commands' });
    await waitFor(async () => {
      await expect(within(menu).queryByText('Help')).toBeNull();
    });
    await expect(menu).toHaveTextContent('');
    await expect(within(menu).queryByRole('menuitem')).toBeNull();
  },
  render: () => (
    <div className="grid gap-2">
      <Command>
        <CommandInput aria-label=" " />
        <CommandList aria-label="Commands" emptyLabel=" ">
          <CommandItem id="help">Help</CommandItem>
        </CommandList>
      </Command>
      <Command>
        <span id="pages-label">Find a page</span>
        <CommandInput aria-labelledby="pages-label" />
        <CommandList aria-label="Pages">
          <CommandItem id="home">Home</CommandItem>
        </CommandList>
      </Command>
    </div>
  ),
};

// The dialog takes its name from title, falls back on a blank one, and sits
// flush and near the top from sm up.
export const DialogTitle: Story = {
  decorators: [(Story) => <Story />],
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Go to' }));
    const dialog = await screen.findByRole('dialog', { name: 'Go to page' });
    const panel = dialog.closest<HTMLElement>(
      '[data-slot=command-dialog-content]',
    );
    if (!panel) throw new Error('No dialog panel');
    await settled(panel);
    await expect(getComputedStyle(panel).paddingTop).toBe('0px');
    await expect(getComputedStyle(panel).alignSelf).toBe('flex-start');
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(screen.queryByRole('dialog')).toBeNull();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Blank' }));
    await expect(
      await screen.findByRole('dialog', { name: 'Command palette' }),
    ).toBeInTheDocument();
  },
  render: () => (
    <div className="flex gap-2">
      <DialogTrigger>
        <Button variant="outline">Go to</Button>
        <CommandDialog title="Go to page">
          <Labels />
        </CommandDialog>
      </DialogTrigger>
      <DialogTrigger>
        <Button variant="outline">Blank</Button>
        <CommandDialog title=" ">
          <Labels />
        </CommandDialog>
      </DialogTrigger>
    </div>
  ),
};
