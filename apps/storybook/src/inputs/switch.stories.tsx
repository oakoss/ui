import type { Meta, StoryObj } from '@storybook/react-vite';

import { Switch } from '@oakoss/ui/components/ui/inputs/switch';
import { expect, fn, userEvent } from 'storybook/test';

import { part } from '../parts';

const onChange = fn<(isSelected: boolean) => void>();

const meta = {
  args: { children: 'Airplane mode', onChange },
  beforeEach: () => {
    onChange.mockClear();
  },
  component: Switch,
  title: 'Inputs/Switch',
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

// A switch named by its label, which is also its click target; Space
// toggles it.
export const Default: Story = {
  play: async ({ canvas }) => {
    const control = canvas.getByRole('switch', { name: 'Airplane mode' });
    await userEvent.click(canvas.getByText('Airplane mode'));
    await expect(control).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(control).not.toBeChecked();
    await expect(onChange.mock.calls).toEqual([[true], [false]]);
  },
};

export const Validation: Story = {
  args: {
    description: 'Turns off wireless connections.',
    errorMessage: 'Not allowed during a call.',
    isInvalid: true,
  },
  play: async ({ canvas }) => {
    const control = canvas.getByRole('switch', { name: 'Airplane mode' });
    await expect(control).toHaveAccessibleDescription(
      'Turns off wireless connections. Not allowed during a call.',
    );
    await expect(control).toBeInvalid();
  },
};

// The description lines up under the label, past the track, at either size.
export const DescriptionIndent: Story = {
  args: { description: 'Turns off wireless connections.' },
  play: async () => {
    const description = part('field-description').getBoundingClientRect();
    const track = part('switch-track').getBoundingClientRect();
    await expect(Math.round(description.left)).toBe(
      Math.round(track.right + 8),
    );
  },
};

export const DescriptionIndentSmall: Story = {
  ...DescriptionIndent,
  args: { description: 'Turns off wireless connections.', size: 'sm' },
};

// labelPlacement="start" puts the label first and the switch at the row's
// end, with the description under the label.
export const LabelStart: Story = {
  args: {
    className: 'w-80',
    description: 'Turns off wireless connections.',
    labelPlacement: 'start',
  },
  play: async ({ canvas }) => {
    const row = part('switch').getBoundingClientRect();
    const track = part('switch-track').getBoundingClientRect();
    const label = canvas.getByText('Airplane mode').getBoundingClientRect();
    await expect(Math.round(track.right)).toBe(Math.round(row.right));
    await expect(label.left).toBeLessThan(track.left);
    await expect(
      Math.round(part('field-description').getBoundingClientRect().left),
    ).toBe(Math.round(row.left));
  },
};

export const LabelStartRightToLeft: Story = {
  args: { className: 'w-80', labelPlacement: 'start' },
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const row = part('switch').getBoundingClientRect();
    const track = part('switch-track').getBoundingClientRect();
    const label = canvas.getByText('Airplane mode').getBoundingClientRect();
    await expect(Math.round(track.left)).toBe(Math.round(row.left));
    await expect(label.right).toBeGreaterThan(track.right);
  },
};

// A required switch shows the asterisk after its label, hidden from the name.
export const Required: Story = {
  args: { isRequired: true, labelPlacement: 'start' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('switch')).toHaveAccessibleName(
      'Airplane mode',
    );
    const mark = canvas.getByText('*');
    // The label's own text, without the asterisk beside it.
    const text = [...(mark.parentElement?.childNodes ?? [])].find(
      (node) => node.nodeType === Node.TEXT_NODE,
    );
    if (!text) throw new Error('No label text');
    const range = document.createRange();
    range.selectNodeContents(text);
    const label = range.getBoundingClientRect();
    const markBox = mark.getBoundingClientRect();
    await expect(markBox.left).toBeGreaterThanOrEqual(label.right);
    await expect(markBox.left - label.right).toBeLessThan(8);
  },
};

// Named by aria-label alone, the switch is only as wide as its track.
export const NoVisibleLabel: Story = {
  args: { 'aria-label': 'Airplane mode', children: undefined },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('switch', { name: 'Airplane mode' }),
    ).toBeVisible();
    await expect(part('switch').getBoundingClientRect().width).toBe(
      part('switch-track').getBoundingClientRect().width,
    );
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    const control = canvas.getByRole('switch');
    await expect(control).toBeDisabled();
    await userEvent.click(canvas.getByText('Airplane mode'), {
      pointerEventsCheck: 0,
    });
    await expect(control).not.toBeChecked();
  },
};

export const ReadOnly: Story = {
  args: { defaultSelected: true, isReadOnly: true },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByText('Airplane mode'));
    await expect(canvas.getByRole('switch')).toBeChecked();
    await expect(onChange).not.toHaveBeenCalled();
  },
};
