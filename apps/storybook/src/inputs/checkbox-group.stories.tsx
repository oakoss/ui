import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { Checkbox } from '@oakoss/ui/components/ui/inputs/checkbox';
import {
  CheckboxGroup,
  CheckboxGroupItem,
} from '@oakoss/ui/components/ui/inputs/checkbox-group';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { part } from '#/helpers/parts';
import { atViewportWidth } from '#/helpers/viewport';

const onChange = fn<(value: string[]) => void>();

const meta = {
  args: {
    children: <Toppings />,
    description: 'Select all that apply.',
    label: 'Toppings',
    onChange,
  },
  beforeEach: () => {
    onChange.mockClear();
  },
  component: CheckboxGroup,
  title: 'Inputs/Checkbox Group',
} satisfies Meta<typeof CheckboxGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

// The group is named by its label, and its description sits above the
// options, so it's read before them; it also describes each option.
export const Default: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Toppings' });
    await expect(group).toHaveAccessibleDescription('Select all that apply.');
    const cheese = canvas.getByRole('checkbox', { name: 'Cheese' });
    await expect(
      canvas.getByRole('checkbox', { name: 'Mushrooms' }),
    ).toHaveAccessibleDescription('Select all that apply.');
    await expect(cheese).toHaveAccessibleDescription(
      'Extra melted on top. Select all that apply.',
    );
    await expect(
      part('field-description', group).getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(cheese.getBoundingClientRect().top);
    // Vertical by default: one option per row.
    await expect(group).toHaveAttribute('data-orientation', 'vertical');
    const lefts = canvas
      .getAllByRole('checkbox')
      .map((box) => Math.round(box.getBoundingClientRect().left));
    await expect(new Set(lefts).size).toBe(1);
    await userEvent.click(cheese);
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Olives' }));
    await expect(onChange.mock.lastCall).toEqual([['cheese', 'olives']]);
  },
};

// Horizontal lays the options in a row, wrapping on a narrow screen.
export const Horizontal: Story = {
  args: {
    children: (
      <>
        <CheckboxGroupItem value="cheese">Cheese</CheckboxGroupItem>
        <CheckboxGroupItem value="mushrooms">Mushrooms</CheckboxGroupItem>
        <CheckboxGroupItem value="olives">Olives</CheckboxGroupItem>
      </>
    ),
    orientation: 'horizontal',
  },
  play: async ({ canvas }) => {
    const tops = () =>
      canvas
        .getAllByRole('checkbox')
        .map((box) => Math.round(box.getBoundingClientRect().top));
    await expect(new Set(tops()).size).toBe(1);
    await atViewportWidth(375, async () => {
      await expect(new Set(tops()).size).toBeGreaterThan(1);
    });
  },
  render: (args) => (
    <div className="w-40 sm:w-96">
      <CheckboxGroup {...args} />
    </div>
  ),
};

// A required group needs one option checked. Its error says so, rather than
// the browser's message about a single box, and submitting focuses the first
// option.
export const Required: Story = {
  args: { isRequired: true, name: 'toppings' },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Order' }));
    const group = canvas.getByRole('group', { name: 'Toppings' });
    await expect(group).toHaveAccessibleDescription(
      'Select all that apply. Select at least one option.',
    );
    await expect(
      canvas.getByRole('checkbox', { name: 'Cheese' }),
    ).toHaveFocus();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Cheese' }));
    await expect(group).toHaveAccessibleDescription('Select all that apply.');
  },
  render: (args) => (
    <form
      className="flex flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <CheckboxGroup {...args} />
      <Button type="submit">Order</Button>
    </form>
  ),
};

// A card makes the whole option the click target and draws the focus ring
// around itself.
export const Cards: Story = {
  args: { variant: 'card' },
  play: async ({ canvas }) => {
    // What a pointer over the description hits: the label stretched over
    // the card.
    const { height, left, top, width } = canvas
      .getByText('Extra melted on top.')
      .getBoundingClientRect();
    const target = document.elementFromPoint(
      left + width / 2,
      top + height / 2,
    );
    if (!(target instanceof HTMLElement)) throw new Error('Nothing there');
    await userEvent.click(target);
    await expect(
      canvas.getByRole('checkbox', { name: 'Cheese' }),
    ).toBeChecked();
    await userEvent.keyboard('{Tab}');
    const mushrooms = canvas.getByRole('checkbox', { name: 'Mushrooms' });
    await expect(mushrooms).toHaveFocus();
    const card = mushrooms.closest<HTMLElement>(
      '[data-slot=checkbox-group-item-field]',
    );
    if (!card) throw new Error('No card');
    await expect(getComputedStyle(card).outlineStyle).toBe('solid');
    await expect(
      getComputedStyle(part('checkbox-indicator', card)).outlineStyle,
    ).toBe('none');
  },
};

// A select-all checkbox sits outside the group and follows its value: mixed
// while only some are checked, checking all or none when pressed.
export const SelectAll: Story = {
  play: async ({ canvas }) => {
    const all = canvas.getByRole('checkbox', { name: 'All toppings' });
    const group = canvas.getByRole('group', { name: 'Toppings' });
    await expect(all).not.toBeChecked();
    await userEvent.click(
      within(group).getByRole('checkbox', { name: 'Cheese' }),
    );
    await expect(all).toBePartiallyChecked();
    await expect(
      part(
        'checkbox-indicator',
        all.closest('label') ?? document,
      ).querySelector('svg')?.classList,
    ).toContain('lucide-minus');
    await userEvent.click(all);
    for (const box of within(group).getAllByRole('checkbox')) {
      await expect(box).toBeChecked();
    }
    await expect(all).toBeChecked();
    await userEvent.click(all);
    for (const box of within(group).getAllByRole('checkbox')) {
      await expect(box).not.toBeChecked();
    }
  },
  render: () => <SelectAllDemo />,
};

// A disabled option can't be checked; the rest still can.
export const DisabledItem: Story = {
  args: {
    children: (
      <>
        <CheckboxGroupItem value="cheese">Cheese</CheckboxGroupItem>
        <CheckboxGroupItem isDisabled value="truffle">
          Truffle
        </CheckboxGroupItem>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('checkbox', { name: 'Truffle' }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole('checkbox', { name: 'Cheese' }),
    ).toBeEnabled();
  },
};

function SelectAllDemo() {
  const options = ['cheese', 'mushrooms', 'olives'];
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        isIndeterminate={value.length > 0 && value.length < options.length}
        isSelected={value.length === options.length}
        onChange={(isSelected) => {
          setValue(isSelected ? options : []);
        }}
      >
        All toppings
      </Checkbox>
      <CheckboxGroup
        className="ms-6"
        label="Toppings"
        onChange={setValue}
        value={value}
      >
        <Toppings />
      </CheckboxGroup>
    </div>
  );
}

function Toppings() {
  return (
    <>
      <CheckboxGroupItem description="Extra melted on top." value="cheese">
        Cheese
      </CheckboxGroupItem>
      <CheckboxGroupItem value="mushrooms">Mushrooms</CheckboxGroupItem>
      <CheckboxGroupItem value="olives">Olives</CheckboxGroupItem>
    </>
  );
}
