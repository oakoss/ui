import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icon from '@oakoss/ui/components/icons';
import {
  TextareaField,
  TextField,
} from '@oakoss/ui/components/ui/inputs/text-field';
import { expect, userEvent } from 'storybook/test';

const meta = {
  args: { label: 'Weight' },
  component: TextField,
  title: 'Inputs/Text Field/Decorations',
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

// Text inside the border describes the input, read after the description, so
// a screen reader hears the unit too.
export const Text: Story = {
  args: { description: 'Your weight today.', end: 'kg', start: '≈' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Weight' });
    await expect(input).toHaveAccessibleDescription('Your weight today. ≈ kg');
    await expect(input.closest('[data-slot=input-group]')).not.toBeNull();
    await userEvent.click(canvas.getByText('kg'));
    await expect(input).toHaveFocus();
  },
};

// start sits before the input and end after it, and numbers count as text.
export const Placement: Story = {
  args: { end: 100, label: 'Budget', start: '$' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Budget' });
    const box = input.getBoundingClientRect();
    await expect(input).toHaveAccessibleDescription('$ 100');
    await expect(
      canvas.getByText('$').getBoundingClientRect().right,
    ).toBeLessThanOrEqual(box.left);
    await expect(
      canvas.getByText('100').getBoundingClientRect().left,
    ).toBeGreaterThanOrEqual(box.right);
  },
};

// An element is decoration: it adds nothing to the description.
export const Element: Story = {
  args: { label: 'Search', start: <Icon.Search aria-hidden /> },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Search' }),
    ).not.toHaveAccessibleDescription();
  },
};

// A consumer's own aria-describedby stays alongside the decoration's.
export const OwnDescribedBy: Story = {
  args: { 'aria-describedby': 'weight-hint', end: 'kg' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Weight' }),
    ).toHaveAccessibleDescription('Round to the nearest kilo. kg');
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <TextField {...args} />
      <p id="weight-hint">Round to the nearest kilo.</p>
    </div>
  ),
};

// Without decorations there's no group, and empty ones count as none.
export const None: Story = {
  args: { end: '', start: false },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Weight' });
    await expect(input.closest('[data-slot=input-group]')).toBeNull();
    await expect(input).not.toHaveAccessibleDescription();
  },
};

// The group takes the field's size.
export const Size: Story = {
  args: { end: 'kg', size: 'lg' },
  play: async ({ canvas }) => {
    const group = canvas
      .getByRole('textbox', { name: 'Weight' })
      .closest('[data-slot=input-group]');
    await expect(group?.getBoundingClientRect().height).toBe(40);
  },
};

// A textarea's decorations sit above and below it.
export const Textarea: Story = {
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Message' });
    await expect(textarea).toHaveAccessibleDescription(
      'To: team Sent as email',
    );
    const top = canvas.getByText('To: team').getBoundingClientRect();
    const bottom = canvas.getByText('Sent as email').getBoundingClientRect();
    await expect(top.bottom).toBeLessThanOrEqual(
      textarea.getBoundingClientRect().top,
    );
    await expect(bottom.top).toBeGreaterThanOrEqual(
      textarea.getBoundingClientRect().bottom,
    );
  },
  render: () => (
    <TextareaField end="Sent as email" label="Message" start="To: team" />
  ),
};

// start alone still sits above the textarea.
export const TextareaStartOnly: Story = {
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Message' });
    await expect(
      canvas.getByText('To: team').getBoundingClientRect().bottom,
    ).toBeLessThanOrEqual(textarea.getBoundingClientRect().top);
  },
  render: () => <TextareaField label="Message" start="To: team" />,
};
