import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from '@oakoss/ui/components/ui/inputs/native-select';
import { expect, fn, userEvent, within } from 'storybook/test';

const onChange = fn<() => void>();

const fruits = (
  <>
    <NativeSelectOption value="apple">Apple</NativeSelectOption>
    <NativeSelectOption value="banana">Banana</NativeSelectOption>
    <NativeSelectOption value="pear">Pear</NativeSelectOption>
  </>
);

const meta = {
  args: { children: fruits, label: 'Fruit', onChange },
  beforeEach: () => {
    onChange.mockClear();
  },
  component: NativeSelect,
  title: 'Inputs/NativeSelect',
} satisfies Meta<typeof NativeSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

// The label names the select, and choosing an option fires onChange.
export const Default: Story = {
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await userEvent.selectOptions(select, 'pear');
    await expect(select).toHaveValue('pear');
    await expect(onChange).toHaveBeenCalledOnce();
  },
};

export const WithDescription: Story = {
  args: { description: 'Picked fresh daily.' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('combobox', { name: 'Fruit' }),
    ).toHaveAccessibleDescription('Picked fresh daily.');
  },
};

// The error follows the description, and the border turns destructive.
export const Invalid: Story = {
  args: {
    description: 'Picked fresh daily.',
    errors: ['Choose a fruit.'],
    isInvalid: true,
  },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(select).toHaveAccessibleDescription(
      'Picked fresh daily. Choose a fruit.',
    );
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    const probe = document.createElement('div');
    probe.style.color = 'var(--color-destructive-text)';
    document.body.append(probe);
    await expect(getComputedStyle(select).borderTopColor).toBe(
      getComputedStyle(probe).color,
    );
    probe.remove();
  },
};

// A valid field shows no error and adds nothing to the description.
export const Valid: Story = {
  args: { errors: ['Choose a fruit.'] },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(select).not.toHaveAttribute('aria-describedby');
    await expect(canvas.queryByText('Choose a fruit.')).toBeNull();
  },
};

export const Required: Story = {
  args: { required: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('combobox', { name: 'Fruit' }),
    ).toBeRequired();
    await expect(canvas.getByText('*')).toBeVisible();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('combobox', { name: 'Fruit' }),
    ).toBeDisabled();
  },
};

// A list box shows its options, so it has no chevron.
export const Multiple: Story = {
  args: { multiple: true },
  play: async ({ canvas }) => {
    const list = canvas.getByRole('listbox', { name: 'Fruit' });
    await expect(within(list).getAllByRole('option')).toHaveLength(3);
    await expect(
      fieldOf(list).querySelector('[data-slot=native-select-icon]'),
    ).toBeNull();
  },
};

export const Groups: Story = {
  args: {
    children: (
      <>
        <NativeSelectOptGroup label="Fruit">
          <NativeSelectOption value="apple">Apple</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Vegetables">
          <NativeSelectOption value="carrot">Carrot</NativeSelectOption>
        </NativeSelectOptGroup>
      </>
    ),
    label: 'Produce',
  },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Produce' });
    await expect(select.querySelectorAll('optgroup')).toHaveLength(2);
    await userEvent.selectOptions(select, 'carrot');
    await expect(select).toHaveValue('carrot');
  },
};

// Heights match Input's sizes.
export const Sizes: Story = {
  play: async ({ canvas }) => {
    const heights = ['Small', 'Medium', 'Large'].map(
      (name) =>
        canvas.getByRole('combobox', { name }).getBoundingClientRect().height,
    );
    await expect(heights).toEqual([32, 36, 40]);
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <NativeSelect label="Small" size="sm">
        {fruits}
      </NativeSelect>
      <NativeSelect label="Medium">{fruits}</NativeSelect>
      <NativeSelect label="Large" size="lg">
        {fruits}
      </NativeSelect>
    </div>
  ),
};

export const FocusRing: Story = {
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'Fruit' });
    await userEvent.tab();
    await expect(select).toHaveFocus();
    await expect(getComputedStyle(select).outlineStyle).toBe('solid');
  },
};

// The chevron sits at the end of the reading direction, and the select's
// padding keeps the chosen text clear of it.
export const RightToLeft: Story = {
  args: { label: 'فاكهة' },
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox', { name: 'فاكهة' });
    const chevron = fieldOf(select).querySelector(
      '[data-slot=native-select-icon]',
    );
    if (!chevron) throw new Error('No chevron');
    await expect(chevron.getBoundingClientRect().left).toBeLessThan(
      select.getBoundingClientRect().left + 24,
    );
    await expect(getComputedStyle(select).paddingLeft).toBe('32px');
  },
};

function fieldOf(element: HTMLElement) {
  const field = element.closest<HTMLElement>('[data-slot=native-select-field]');
  if (!field) throw new Error('No field');
  return field;
}
