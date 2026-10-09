import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from '@oakoss/ui/components/ui/inputs/checkbox';
import { expect, fn, userEvent } from 'storybook/test';

import { part } from '../parts';

const onChange = fn<(isSelected: boolean) => void>();

const meta = {
  args: { children: 'Sync folders', onChange },
  beforeEach: () => {
    onChange.mockClear();
  },
  component: Checkbox,
  title: 'Inputs/Checkbox',
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

// The label is the checkbox's name and its click target, and Space toggles
// it from the keyboard.
export const Default: Story = {
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole('checkbox', { name: 'Sync folders' });
    await userEvent.click(canvas.getByText('Sync folders'));
    await expect(checkbox).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(checkbox).not.toBeChecked();
    await expect(onChange.mock.calls).toEqual([[true], [false]]);
  },
};

// The description and error describe the checkbox with no ids to wire, and
// the required mark is hidden from the name.
export const Validation: Story = {
  args: {
    description: 'Synced with iCloud Drive.',
    errorMessage: 'Turn on sync to continue.',
    isInvalid: true,
    isRequired: true,
  },
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole('checkbox', { name: 'Sync folders' });
    await expect(checkbox).toHaveAccessibleDescription(
      'Synced with iCloud Drive. Turn on sync to continue.',
    );
    await expect(checkbox).toBeInvalid();
    await expect(checkbox).toBeRequired();
  },
};

// The description lines up under the label, past the box, in either
// direction.
export const DescriptionRightToLeft: Story = {
  args: { description: 'Synced with iCloud Drive.' },
  globals: { locale: 'ar-EG' },
  play: async () => {
    const label = part('checkbox').getBoundingClientRect();
    const box = part('checkbox-indicator').getBoundingClientRect();
    const description = part('field-description').getBoundingClientRect();
    await expect(Math.round(description.right)).toBe(Math.round(box.left - 8));
    await expect(Math.round(label.right)).toBe(Math.round(box.right));
  },
};

function icon() {
  return part('checkbox-indicator').querySelector('svg')?.getAttribute('class');
}

// Indeterminate shows a minus, not a check, and screen readers hear it as
// mixed.
export const Indeterminate: Story = {
  args: { isIndeterminate: true },
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole<HTMLInputElement>('checkbox');
    await expect(checkbox).toBePartiallyChecked();
    await expect(icon()).toContain('lucide-minus');
  },
};

export const Checked: Story = {
  args: { defaultSelected: true },
  play: async () => {
    await expect(icon()).toContain('lucide-check');
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole('checkbox');
    await expect(checkbox).toBeDisabled();
    await userEvent.click(canvas.getByText('Sync folders'), {
      pointerEventsCheck: 0,
    });
    await expect(checkbox).not.toBeChecked();
    await expect(getComputedStyle(part('checkbox')).opacity).toBe('0.5');
  },
};

// Read-only reads as normal but can't be changed.
export const ReadOnly: Story = {
  args: { defaultSelected: true, isReadOnly: true },
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole('checkbox');
    await userEvent.click(canvas.getByText('Sync folders'));
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveAttribute('aria-readonly', 'true');
    await expect(onChange).not.toHaveBeenCalled();
    await expect(getComputedStyle(part('checkbox')).opacity).toBe('1');
  },
};
