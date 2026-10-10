import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Combobox,
  ComboboxItem,
} from '@oakoss/ui/components/ui/inputs/combobox';
import { useState } from 'react';
import { ComboBoxContext, type Key } from 'react-aria-components';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

const FruitCombobox = Combobox<Fruit>;

type Fruit = { id: string; name: string };

const fruits: Fruit[] = [
  { id: 'apple', name: 'Apple' },
  { id: 'pear', name: 'Pear' },
];

const onLoadMore = fn<() => void>();

const meta = {
  args: {
    children: (fruit: Fruit) => <ComboboxItem>{fruit.name}</ComboboxItem>,
    defaultItems: fruits,
    label: 'Fruit',
  },
  beforeEach: () => {
    onLoadMore.mockClear();
  },
  component: FruitCombobox,
  title: 'Inputs/Combobox/States',
} satisfies Meta<typeof FruitCombobox>;

export default meta;

type Story = StoryObj<typeof meta>;

// defaultItems with a function child still filters as you type.
export const DefaultItems: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('combobox', { name: 'Fruit' }), 'pe');
    const list = await screen.findByRole('listbox');
    await expect(within(list).getAllByRole('option')).toHaveLength(1);
    await expect(within(list).getByRole('option')).toHaveTextContent('Pear');
  },
};

// A disabled or read-only field shows no clear button, so its value stays.
export const Disabled: Story = {
  args: { defaultValue: 'pear', isDisabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Fruit' })).toHaveValue(
      'Pear',
    );
    await expect(
      canvas.queryByRole('button', { hidden: true, name: 'Clear' }),
    ).toBeNull();
  },
};

export const ReadOnly: Story = {
  args: { defaultValue: 'pear', isReadOnly: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Fruit' })).toHaveValue(
      'Pear',
    );
    await expect(
      canvas.queryByRole('button', { hidden: true, name: 'Clear' }),
    ).toBeNull();
  },
};

// Read-only from a ComboBoxContext hides the clear button too.
export const ReadOnlyFromContext: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox', { name: 'Fruit' })).toHaveValue(
      'Pear',
    );
    await expect(
      canvas.queryByRole('button', { hidden: true, name: 'Clear' }),
    ).toBeNull();
  },
  render: () => (
    <ComboBoxContext value={{ isReadOnly: true }}>
      <FruitCombobox defaultItems={fruits} defaultValue="pear" label="Fruit">
        {(fruit) => <ComboboxItem>{fruit.name}</ComboboxItem>}
      </FruitCombobox>
    </ComboBoxContext>
  ),
};

// With value and inputValue both controlled, clearing still clears the value.
export const ControlledClear: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(input).toHaveValue('Pear');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(input).toHaveValue('');
    await expect(canvas.getByText('Value: none')).toBeVisible();
  },
  render: function Render() {
    const [value, setValue] = useState<Key | null>('pear');
    const [inputValue, setInputValue] = useState('Pear');
    return (
      <div className="flex flex-col gap-2">
        <FruitCombobox
          defaultItems={fruits}
          inputValue={inputValue}
          label="Fruit"
          onChange={setValue}
          onInputChange={setInputValue}
          value={value}
        >
          {(fruit) => <ComboboxItem>{fruit.name}</ComboboxItem>}
        </FruitCombobox>
        <p>Value: {value ?? 'none'}</p>
      </div>
    );
  },
};

// The loading spinner waits 500ms, so a fast response doesn't flash it.
export const Loading: Story = {
  args: { loadingState: 'loading' },
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole('progressbar', { name: 'Loading' }),
    ).toBeNull();
    await expect(
      await canvas.findByRole(
        'progressbar',
        { name: 'Loading' },
        { timeout: 1000 },
      ),
    ).toBeVisible();
  },
};

// useAsyncList reports 'filtering' while a typed search loads.
export const Filtering: Story = {
  args: { loadingState: 'filtering' },
  play: async ({ canvas }) => {
    await expect(
      await canvas.findByRole(
        'progressbar',
        { name: 'Loading' },
        { timeout: 1000 },
      ),
    ).toBeVisible();
  },
};

// With nothing matching and no emptyLabel, the list says "No results".
export const EmptyDefault: Story = {
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('combobox', { name: 'Fruit' }), 'zz');
    const list = await screen.findByRole('listbox');
    await expect(within(list).getByRole('option')).toHaveTextContent(
      'No results',
    );
  },
};

// dependencies re-render the options when outside state the function child
// reads changes.
export const Dependencies: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Shout' }));
    await userEvent.click(
      canvas.getByRole('button', { name: /Show suggestions/u }),
    );
    const list = await screen.findByRole('listbox');
    await waitFor(() =>
      expect(within(list).getByRole('option', { name: 'APPLE' })).toBeVisible(),
    );
    // The open list hides the button from screen readers, which axe flags.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
  },
  render: function Render() {
    const [shout, setShout] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <Button onPress={() => setShout(true)} variant="outline">
          Shout
        </Button>
        <FruitCombobox
          defaultItems={fruits}
          dependencies={[shout]}
          label="Fruit"
        >
          {(fruit) => (
            <ComboboxItem>
              {shout ? fruit.name.toUpperCase() : fruit.name}
            </ComboboxItem>
          )}
        </FruitCombobox>
      </div>
    );
  },
};

// The load-more row asks for the next page once it's in view, and shows a
// spinner while that page loads.
export const LoadMore: Story = {
  args: {
    defaultItems: undefined,
    items: fruits,
    loadingState: 'loadingMore',
    onLoadMore,
  },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: /Show suggestions/u }),
    );
    const list = await screen.findByRole('listbox');
    await expect(
      list.querySelectorAll('[data-slot=combobox-item]'),
    ).toHaveLength(2);
    const popover = list.closest<HTMLElement>('[data-slot=combobox-content]');
    if (!popover) throw new Error('No popover');
    for (const animation of popover.getAnimations()) animation.finish();
    await expect(
      within(list).getByRole('progressbar', { name: 'Loading' }),
    ).toBeVisible();
    // The row asks once an observer sees it, after the list renders.
    await waitFor(() => expect(onLoadMore).toHaveBeenCalled());
  },
};

// With defaultItems, the options beside the load-more row still filter.
export const LoadMoreDefaultItems: Story = {
  args: { onLoadMore },
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('combobox', { name: 'Fruit' }), 'pe');
    const list = await screen.findByRole('listbox');
    const options = list.querySelectorAll('[data-slot=combobox-item]');
    await expect(options).toHaveLength(1);
    await expect(options[0]).toHaveTextContent('Pear');
  },
};
