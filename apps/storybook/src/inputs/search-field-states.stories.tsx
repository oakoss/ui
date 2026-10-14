import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import { InputGroup } from '@oakoss/ui/components/ui/inputs/input-group';
import {
  SearchField,
  SearchFieldClear,
} from '@oakoss/ui/components/ui/inputs/search-field';
import {
  Dialog,
  DialogTitle,
  DialogTrigger,
} from '@oakoss/ui/components/ui/overlays/dialog';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

const onFormSubmit = fn<() => void>();
const onSubmit = fn<(value: string) => void>();

const meta = {
  args: { className: 'w-72', label: 'Recipes', onSubmit },
  beforeEach: () => {
    onFormSubmit.mockClear();
    onSubmit.mockClear();
  },
  component: SearchField,
  title: 'Inputs/Search Field/States',
} satisfies Meta<typeof SearchField>;

export default meta;

type Story = StoryObj<typeof meta>;

// Without a name of its own, a field is named Search; a blank label or
// aria-label counts as none. A name of its own, from aria-label,
// aria-labelledby or a layout's label, replaces Search rather than adding to
// it.
export const Names: Story = {
  play: async ({ canvas }) => {
    const names = [
      'Search',
      'Search',
      'Search',
      'Find a recipe',
      'Recipes',
      'Ingredients',
    ];
    const inputs = canvas.getAllByRole('searchbox');
    await expect(inputs).toHaveLength(names.length);
    for (const [index, name] of names.entries()) {
      await expect(inputs[index]).toHaveAccessibleName(name);
    }
  },
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <h2 id="recipes-heading">Recipes</h2>
      <SearchField />
      <SearchField label="   " />
      <SearchField aria-label="  " />
      <SearchField aria-label="Find a recipe" />
      <SearchField aria-labelledby="recipes-heading" />
      <SearchField>
        <FieldLabel>Ingredients</FieldLabel>
        <Input />
      </SearchField>
    </div>
  ),
};

// Children replace the layout, and SearchFieldClear brings the clear button
// to it: hidden while the field is empty, then clearing it.
export const CustomLayout: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('searchbox', { name: 'Recipes' });
    await expect(canvas.queryByRole('button')).toBeNull();
    await userEvent.type(input, 'soup');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear search' }));
    await expect(input).toHaveValue('');
  },
  render: ({ className }) => (
    <SearchField className={className}>
      <FieldLabel>Recipes</FieldLabel>
      <InputGroup className="overflow-hidden">
        <Input />
        <SearchFieldClear />
      </InputGroup>
    </SearchField>
  ),
};

// With onSubmit, Enter doesn't also submit the form around the field.
export const InForm: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('searchbox', { name: 'Recipes' });
    await userEvent.type(input, 'soup{Enter}');
    await expect(onSubmit).toHaveBeenCalledWith('soup');
    await expect(onFormSubmit).not.toHaveBeenCalled();
  },
  render: (args) => (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onFormSubmit();
      }}
    >
      <SearchField {...args} />
    </form>
  ),
};

// In a dialog, Escape first clears what's typed, then, with the field
// empty, passes through and closes the dialog.
export const InDialog: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Find' }));
    const dialog = await screen.findByRole('dialog', { name: 'Find' });
    const input = within(dialog).getByRole('searchbox', { name: 'Recipes' });
    await userEvent.type(input, 'soup');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
    await expect(dialog).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(screen.queryByRole('dialog')).toBeNull();
    });
  },
  render: (args) => (
    <DialogTrigger>
      <Button variant="outline">Find</Button>
      <Dialog>
        <DialogTitle>Find</DialogTitle>
        <SearchField {...args} />
      </Dialog>
    </DialogTrigger>
  ),
};
