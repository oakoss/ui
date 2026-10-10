import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  NativeSelect,
  NativeSelectOption,
} from '@oakoss/ui/components/ui/inputs/native-select';
import { Form } from 'react-aria-components';
import { expect, userEvent } from 'storybook/test';

const fruits = (
  <>
    <NativeSelectOption value="apple">Apple</NativeSelectOption>
    <NativeSelectOption value="banana">Banana</NativeSelectOption>
    <NativeSelectOption value="pear">Pear</NativeSelectOption>
  </>
);

const meta = {
  args: { children: fruits, label: 'Fruit' },
  component: NativeSelect,
  title: 'Inputs/NativeSelect/States',
} satisfies Meta<typeof NativeSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

function fieldOf(element: HTMLElement) {
  const field = element.closest<HTMLElement>('[data-slot=native-select-field]');
  if (!field) throw new Error('No field');
  return field;
}

// A caller's id, aria-describedby and className reach the select and field;
// the caller's description comes first.
export const CallerProps: Story = {
  args: {
    'aria-describedby': 'hint',
    className: 'w-40',
    description: 'Picked fresh daily.',
    errors: ['Choose a fruit.'],
    id: 'fruit',
    isInvalid: true,
  },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(select).toHaveAttribute('id', 'fruit');
    await expect(canvas.getByText('Fruit')).toHaveAttribute('for', 'fruit');
    await expect(select).toHaveAccessibleDescription(
      'Ships Monday. Picked fresh daily. Choose a fruit.',
    );
    await expect(fieldOf(select).getBoundingClientRect().width).toBe(160);
    // The browser's own arrow would sit beside ours.
    await expect(getComputedStyle(select).appearance).toBe('none');
  },
  render: (args) => (
    <div>
      <p id="hint">Ships Monday.</p>
      <NativeSelect {...args} />
    </div>
  ),
};

// isInvalid with no message adds nothing to the description: there's no error
// element to point at.
export const InvalidWithoutMessage: Story = {
  args: { isInvalid: true },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await expect(select).not.toHaveAttribute('aria-describedby');
  },
};

// A React Aria Form's validationErrors reach the select by its name.
export const FormErrors: Story = {
  args: { name: 'fruit' },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await expect(select).toHaveAccessibleDescription('Choose a fruit.');
  },
  render: (args) => (
    <Form validationErrors={{ fruit: 'Choose a fruit.' }}>
      <NativeSelect {...args} />
    </Form>
  ),
};

// Choosing an option clears the Form's error, as on React Aria's own fields.
export const FormErrorClears: Story = {
  args: { name: 'fruit' },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await userEvent.selectOptions(select, 'pear');
    await expect(select).not.toHaveAttribute('aria-invalid');
    await expect(canvas.queryByText('Choose a fruit.')).toBeNull();
  },
  render: (args) => (
    <Form validationErrors={{ fruit: 'Choose a fruit.' }}>
      <NativeSelect {...args} />
    </Form>
  ),
};

// An empty Form error is no error, so nothing points at a missing message.
export const FormEmptyError: Story = {
  args: { name: 'fruit' },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(select).not.toHaveAttribute('aria-invalid');
    await expect(select).not.toHaveAttribute('aria-describedby');
  },
  render: (args) => (
    <Form validationErrors={{ fruit: '' }}>
      <NativeSelect {...args} />
    </Form>
  ),
};

// Errors that are only whitespace, from the caller or a Form, show nothing,
// so nothing points at the empty error.
export const BlankErrors: Story = {
  args: { errors: ['', '  '], isInvalid: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('combobox', { name: 'Fruit' }),
    ).not.toHaveAttribute('aria-describedby');
  },
};

export const FormBlankArrayError: Story = {
  args: { name: 'fruit' },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(select).not.toHaveAttribute('aria-invalid');
    await expect(select).not.toHaveAttribute('aria-describedby');
  },
  render: (args) => (
    <Form validationErrors={{ fruit: [''] }}>
      <NativeSelect {...args} />
    </Form>
  ),
};

// A disabled field dims its label and the chevron with the select.
export const DisabledLook: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(getComputedStyle(canvas.getByText('Fruit')).opacity).toBe(
      '0.5',
    );
    const chevron = fieldOf(select).querySelector(
      '[data-slot=native-select-icon]',
    );
    if (!chevron) throw new Error('No chevron');
    await expect(getComputedStyle(chevron).opacity).toBe('0.3');
  },
};

// A list box grows to show its options instead of the control height.
export const MultipleHeight: Story = {
  args: { multiple: true },
  play: async ({ canvas }) => {
    const list = canvas.getByRole('listbox', { name: 'Fruit' });
    await expect(list.getBoundingClientRect().height).toBeGreaterThan(40);
  },
};

// In Windows High Contrast a disabled select keeps the system's disabled
// color without our fade, and focus still draws an outline.
export const ForcedColors: Story = {
  play: async ({ canvas }) => {
    await expect(
      getComputedStyle(canvas.getByRole('combobox', { name: 'Disabled' }))
        .opacity,
    ).toBe('1');
    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await userEvent.tab();
    await expect(select).toHaveFocus();
    await expect(getComputedStyle(select).outlineStyle).toBe('solid');
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <NativeSelect label="Fruit">{fruits}</NativeSelect>
      <NativeSelect disabled label="Disabled">
        {fruits}
      </NativeSelect>
    </div>
  ),
  tags: ['forced-colors'],
};
