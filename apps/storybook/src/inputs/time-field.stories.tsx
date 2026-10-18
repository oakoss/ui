import type { Meta, StoryObj } from '@storybook/react-vite';

import { parseTime, type Time } from '@internationalized/date';
import {
  DateFieldGroup,
  DateInput,
} from '@oakoss/ui/components/ui/inputs/date-field';
import { FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { TimeField } from '@oakoss/ui/components/ui/inputs/time-field';
import { expect, userEvent } from 'storybook/test';

const SingleTimeField = TimeField<Time>;

const meta = {
  args: { className: 'w-60', label: 'Start time' },
  component: SingleTimeField,
  title: 'Inputs/Time Field',
} satisfies Meta<typeof SingleTimeField>;

export default meta;

type Story = StoryObj<typeof meta>;

// The same segmented input as Date Field, one named group with hour, minute
// and, in a 12-hour locale, the day period.
export const Default: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Start time' });
    await expect(group).toHaveAttribute('data-slot', 'date-input');
    await expect(group.closest('[data-slot=time-field]')).not.toBeNull();
    await expect(canvas.getAllByRole('group')).toHaveLength(1);
    const border = group.closest('[data-slot=input-group]');
    await expect(border).toHaveAttribute('role', 'presentation');
    await expect(border).not.toHaveAttribute('aria-labelledby');
    const hour = canvas.getByRole('spinbutton', { name: /^hour, Start time/u });
    await userEvent.click(hour);
    await userEvent.keyboard('930p');
    await expect(group).toHaveTextContent(/9:30\D+PM/u);
    await expect(
      canvas.getByRole('spinbutton', { name: /^AM\/PM/u }),
    ).toHaveTextContent('PM');
  },
};

// A time starts with an invisible bidi mark, so clicking an addon skips it
// and focuses the hour.
export const Decorations: Story = {
  args: { end: 'local', start: 'At' },
  play: async ({ canvas }) => {
    const hour = canvas.getByRole('spinbutton', { name: /^hour/u });
    await expect(hour).toHaveAccessibleDescription('At local');
    await userEvent.click(canvas.getByText('At'));
    await expect(hour).toHaveFocus();
  },
};

export const Sizes: Story = {
  play: async ({ canvas }) => {
    const heights = ['Small', 'Large'].map(
      (name) =>
        canvas
          .getByRole('group', { name })
          .closest('[data-slot=input-group]')
          ?.getBoundingClientRect().height,
    );
    await expect(heights).toEqual([32, 40]);
  },
  render: () => (
    <div className="flex w-60 flex-col gap-4">
      <SingleTimeField label="Small" size="sm" />
      <SingleTimeField label="Large" size="lg" />
    </div>
  ),
};

// Children replace the layout, built from Date Field's parts.
export const Composition: Story = {
  args: { children: undefined, label: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Start' })).toBeVisible();
    await expect(canvas.getAllByRole('group')).toHaveLength(1);
  },
  render: () => (
    <SingleTimeField className="w-60">
      <FieldLabel>Start</FieldLabel>
      <DateFieldGroup>
        <DateInput />
      </DateFieldGroup>
    </SingleTimeField>
  ),
};

// A 24-hour locale drops the day period; hourCycle forces either cycle.
export const HourCycle: Story = {
  args: { defaultValue: parseTime('21:30') },
  globals: { locale: 'en-GB' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('group', { name: 'Start time' }),
    ).toHaveTextContent('21:30');
    await expect(
      canvas.queryByRole('spinbutton', { name: /^AM\/PM/u }),
    ).toBeNull();
    await expect(
      canvas.getByRole('group', { name: 'Twelve hour' }),
    ).toHaveTextContent(/9:30\D+pm/iu);
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <SingleTimeField {...args} />
      <SingleTimeField
        className="w-60"
        defaultValue={parseTime('21:30')}
        hourCycle={12}
        label="Twelve hour"
      />
    </div>
  ),
};

// granularity adds seconds.
export const Seconds: Story = {
  args: { defaultValue: parseTime('09:30:15'), granularity: 'second' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('spinbutton', { name: /^second/u }),
    ).toHaveTextContent('15');
  },
};

// The form gets the ISO time from a hidden input named by `name`.
export const FormValue: Story = {
  args: { defaultValue: parseTime('09:30'), name: 'start' },
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form');
    if (!form) throw new Error('No form');
    await expect(new FormData(form).get('start')).toBe('09:30:00');
  },
  render: (args) => (
    <form>
      <SingleTimeField {...args} />
    </form>
  ),
};

export const Invalid: Story = {
  args: { errorMessage: 'Pick a time in opening hours.', isInvalid: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('spinbutton', { name: /^hour/u }),
    ).toHaveAccessibleDescription('Pick a time in opening hours.');
  },
};
