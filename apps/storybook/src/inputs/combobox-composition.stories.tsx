import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Combobox,
  ComboboxContent,
  ComboboxHeader,
  ComboboxItem,
  ComboboxList,
  ComboboxSection,
  ComboboxTrigger,
} from '@oakoss/ui/components/ui/inputs/combobox';
import { FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import {
  InputGroup,
  InputGroupAddon,
} from '@oakoss/ui/components/ui/inputs/input-group';
import { ComboBox as AriaComboBox } from 'react-aria-components';
import { expect, screen, userEvent, within } from 'storybook/test';

const FruitCombobox = Combobox<object>;

type Fruit = { id: string; name: string };

const fruits: Fruit[] = [
  { id: 'apple', name: 'Apple' },
  { id: 'pear', name: 'Pear' },
];

const meta = {
  args: { label: 'Fruit' },
  component: FruitCombobox,
  title: 'Inputs/Combobox/Composition',
} satisfies Meta<typeof FruitCombobox>;

export default meta;

type Story = StoryObj<typeof meta>;

async function open(canvas: { getByRole: typeof screen.getByRole }) {
  await userEvent.click(
    canvas.getByRole('button', { name: /Show suggestions/u }),
  );
  return screen.findByRole('listbox');
}

// Sections group options under a header and divide themselves. The list opens
// by typing: opening it by the button and then typing throws in React's dev
// build (adobe/react-spectrum#9405).
export const Sections: Story = {
  args: {
    children: (
      <>
        <ComboboxSection>
          <ComboboxHeader>Fruit</ComboboxHeader>
          <ComboboxItem id="apple">Apple</ComboboxItem>
        </ComboboxSection>
        <ComboboxSection>
          <ComboboxHeader>Vegetables</ComboboxHeader>
          <ComboboxItem id="carrot">Carrot</ComboboxItem>
        </ComboboxSection>
      </>
    ),
    label: 'Produce',
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'a');
    const list = await screen.findByRole('listbox');
    const vegetables = within(list).getByRole('group', { name: 'Vegetables' });
    await expect(getComputedStyle(vegetables).borderTopWidth).toBe('1px');
    await userEvent.type(input, 'r');
    await expect(within(list).getAllByRole('option')).toHaveLength(1);
  },
};

// An option's description describes it, and the chosen option is marked.
export const ItemDescription: Story = {
  args: {
    children: (
      <>
        <ComboboxItem description="Up to 5 seats" id="team">
          Team
        </ComboboxItem>
        <ComboboxItem description="Unlimited" id="org">
          Organization
        </ComboboxItem>
      </>
    ),
    defaultValue: 'org',
    label: 'Plan',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox')).toHaveValue('Organization');
    const list = await open(canvas);
    const team = within(list).getByRole('option', { name: 'Team' });
    await expect(team).toHaveAccessibleDescription('Up to 5 seats');
    const org = within(list).getByRole('option', { name: 'Organization' });
    await expect(
      org.querySelector('[data-slot=combobox-item-indicator]'),
    ).not.toBeNull();
    await expect(
      team.querySelector('[data-slot=combobox-item-indicator]'),
    ).toBeNull();
  },
};

// In a custom layout with load-more, the list still takes its ComboBox's
// items, and filters them.
export const CustomLayoutLoadMore: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('combobox', { name: 'Fruit' }), 'pe');
    const list = await screen.findByRole('listbox');
    const options = list.querySelectorAll('[data-slot=combobox-item]');
    await expect(options).toHaveLength(1);
    await expect(options[0]).toHaveTextContent('Pear');
  },
  render: () => (
    <AriaComboBox className="flex flex-col gap-2" defaultItems={fruits}>
      <FieldLabel>Fruit</FieldLabel>
      <InputGroup>
        <Input />
      </InputGroup>
      <ComboboxContent>
        <ComboboxList<Fruit> onLoadMore={() => undefined}>
          {(fruit) => <ComboboxItem>{fruit.name}</ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </AriaComboBox>
  ),
};

// A custom layout composes the parts inside React Aria's ComboBox.
export const CustomLayout: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Country' });
    await userEvent.type(input, 'ca');
    const list = await screen.findByRole('listbox');
    await userEvent.click(within(list).getByRole('option', { name: 'Canada' }));
    await expect(input).toHaveValue('Canada');
  },
  render: () => (
    <AriaComboBox className="flex flex-col gap-2">
      <FieldLabel>Country</FieldLabel>
      <InputGroup>
        <Input />
        <InputGroupAddon align="inline-end">
          <ComboboxTrigger />
        </InputGroupAddon>
      </InputGroup>
      <ComboboxContent>
        <ComboboxList>
          <ComboboxItem id="ca">Canada</ComboboxItem>
          <ComboboxItem id="cl">Chile</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </AriaComboBox>
  ),
};
