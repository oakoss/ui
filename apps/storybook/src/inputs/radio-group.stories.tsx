import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  RadioGroup,
  RadioGroupItem,
} from '@oakoss/ui/components/ui/inputs/radio-group';
import { expect, fn, userEvent } from 'storybook/test';

import { part } from '../parts';

const onChange = fn<(value: string) => void>();

const meta = {
  args: {
    children: (
      <>
        <RadioGroupItem value="free">Free</RadioGroupItem>
        <RadioGroupItem description="Up to 20 seats." value="team">
          Team
        </RadioGroupItem>
        <RadioGroupItem value="enterprise">Enterprise</RadioGroupItem>
      </>
    ),
    label: 'Plan',
    onChange,
  },
  beforeEach: () => {
    onChange.mockClear();
  },
  component: RadioGroup,
  title: 'Inputs/RadioGroup',
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

// The group is named by its label, each option by its own, and an option's
// description describes that option alone.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('radiogroup', { name: 'Plan' }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('radio', { name: 'Team' }),
    ).toHaveAccessibleDescription('Up to 20 seats.');
    await expect(
      canvas.getByRole('radio', { name: 'Free' }),
    ).not.toHaveAccessibleDescription();
  },
};

// Clicking an option's label selects it; arrow keys move the selection, and
// Tab lands on the selected option.
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByText('Free'));
    await expect(canvas.getByRole('radio', { name: 'Free' })).toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('radio', { name: 'Team' })).toBeChecked();
    await expect(onChange.mock.calls).toEqual([['free'], ['team']]);
  },
};

// The group's description and error describe the group, and its required
// mark is hidden from the name.
export const Validation: Story = {
  args: {
    description: 'Billed monthly.',
    errorMessage: 'Choose a plan.',
    isInvalid: true,
    isRequired: true,
  },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('radiogroup', { name: 'Plan' });
    await expect(group).toHaveAccessibleDescription(
      'Billed monthly. Choose a plan.',
    );
    // React Aria adds the group's description and error to each option's.
    await expect(
      canvas.getByRole('radio', { name: 'Team' }),
    ).toHaveAccessibleDescription(
      'Up to 20 seats. Choose a plan. Billed monthly.',
    );
    await expect(group).toHaveAttribute('aria-invalid', 'true');
  },
};

// Horizontal lays the options out in a row, matching the arrow keys.
export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
  play: async ({ canvas }) => {
    const [first, second] = canvas
      .getAllByRole('radio')
      .map((radio) => radio.closest('label')?.getBoundingClientRect());
    await expect(Math.round(second?.top ?? 0)).toBe(
      Math.round(first?.top ?? 1),
    );
    await expect(second?.left).toBeGreaterThan(first?.right ?? 0);
  },
};

// Right to left, the arrow keys follow the reading direction.
export const RightToLeft: Story = {
  args: { orientation: 'horizontal' },
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByText('Free'));
    await userEvent.keyboard('{ArrowLeft}');
    await expect(canvas.getByRole('radio', { name: 'Team' })).toBeChecked();
    await expect(
      Math.round(part('field-description').getBoundingClientRect().right),
    ).toBe(
      Math.round(
        (canvas
          .getByRole('radio', { name: 'Team' })
          .closest('label')
          ?.getBoundingClientRect().right ?? 0) - 24,
      ),
    );
  },
};

export const DisabledItem: Story = {
  args: {
    children: (
      <>
        <RadioGroupItem value="free">Free</RadioGroupItem>
        <RadioGroupItem isDisabled value="team">
          Team
        </RadioGroupItem>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('radio', { name: 'Team' })).toBeDisabled();
    await userEvent.click(canvas.getByText('Team'), { pointerEventsCheck: 0 });
    await expect(canvas.getByRole('radio', { name: 'Team' })).not.toBeChecked();
  },
};
