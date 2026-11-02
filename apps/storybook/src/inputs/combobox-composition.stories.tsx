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

import { openedList, OpenList } from './combobox-test';

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

const produce = (
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
);

// Sections group options under a header and divide themselves.
export const Sections: Story = {
  args: { children: produce, end: <OpenList />, label: 'Produce' },
  play: async () => {
    const { list } = await openedList();
    const vegetables = within(list).getByRole('group', { name: 'Vegetables' });
    await expect(getComputedStyle(vegetables).borderTopWidth).toBe('1px');
  },
};

// Typing filters across sections. The list opens by typing: opening it by the
// button and then typing throws in React's dev build
// (adobe/react-spectrum#9405).
export const SectionsFilter: Story = {
  args: { children: produce, label: 'Produce' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox');
    await userEvent.type(input, 'a');
    const list = await screen.findByRole('listbox');
    await expect(within(list).getAllByRole('option')).toHaveLength(2);
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
    end: <OpenList />,
    label: 'Plan',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox')).toHaveValue('Organization');
    const { list } = await openedList();
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
  play: async () => {
    const { list } = await openedList();
    const options = list.querySelectorAll('[data-slot=combobox-item]');
    await expect(options).toHaveLength(1);
    await expect(options[0]).toHaveTextContent('Pear');
  },
  render: () => (
    <AriaComboBox
      className="flex flex-col gap-2"
      defaultInputValue="pe"
      defaultItems={fruits}
    >
      <OpenList trigger="input" />
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

function CountryCombobox({ isOpen = false }: { isOpen?: boolean }) {
  return (
    <AriaComboBox className="flex flex-col gap-2">
      {isOpen ? <OpenList /> : null}
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
  );
}

// A custom layout composes the parts inside React Aria's ComboBox.
export const CustomLayout: Story = {
  play: async () => {
    const { list } = await openedList();
    await expect(within(list).getAllByRole('option')).toHaveLength(2);
  },
  render: () => <CountryCombobox isOpen />,
};

// Typing filters the custom layout's list, and choosing an option fills the
// input.
export const CustomLayoutSelect: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Country' });
    await userEvent.type(input, 'ca');
    const list = await screen.findByRole('listbox');
    await userEvent.click(within(list).getByRole('option', { name: 'Canada' }));
    await expect(input).toHaveValue('Canada');
  },
  render: () => <CountryCombobox />,
};
