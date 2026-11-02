import type { Meta, StoryObj } from '@storybook/react-vite';

import { Select, SelectItem } from '@oakoss/ui/components/ui/inputs/select';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

const MultipleSelect = Select<object, 'multiple'>;

const fruits = (
  <>
    <SelectItem id="apple">Apple</SelectItem>
    <SelectItem id="banana">Banana</SelectItem>
    <SelectItem id="pear">Pear</SelectItem>
  </>
);

const meta = {
  args: { children: fruits, label: 'Fruit', selectionMode: 'multiple' },
  component: MultipleSelect,
  title: 'Inputs/Select/Multiple',
} satisfies Meta<typeof MultipleSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

function trigger(canvas: { getByRole: typeof screen.getByRole }) {
  return canvas.getByRole('button', { name: /Fruit/u });
}

// Several picks show as a list in the user's language, and the list stays
// open between picks.
export const Multiple: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(trigger(canvas));
    const list = await screen.findByRole('listbox');
    await expect(list).toHaveAttribute('aria-multiselectable', 'true');
    await userEvent.click(within(list).getByRole('option', { name: 'Apple' }));
    await userEvent.click(within(list).getByRole('option', { name: 'Pear' }));
    await expect(list).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await expect(trigger(canvas)).toHaveTextContent('Apple and Pear');
    await waitFor(() => expect(trigger(canvas)).toHaveFocus());
  },
};

// The open list checks each pick, and the trigger lists them.
export const MultipleSelected: Story = {
  args: { defaultOpen: true, defaultValue: ['apple', 'pear'] },
  play: async ({ canvas }) => {
    const list = await screen.findByRole('listbox');
    await expect(list).toHaveAttribute('aria-multiselectable', 'true');
    for (const name of ['Apple', 'Pear']) {
      const option = within(list).getByRole('option', { name });
      await expect(option).toHaveAttribute('aria-selected', 'true');
      await expect(
        option.querySelector('[data-slot=select-item-indicator]'),
      ).not.toBeNull();
    }
    await expect(
      within(list).getByRole('option', { name: 'Banana' }),
    ).toHaveAttribute('aria-selected', 'false');
    await expect(trigger(canvas)).toHaveTextContent('Apple and Pear');
  },
};
