import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  type CalendarDateTime,
  parseDateTime,
  parseZonedDateTime,
  type ZonedDateTime,
} from '@internationalized/date';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { DatePicker } from '@oakoss/ui/components/ui/inputs/date-picker';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { freezeDate } from '#/helpers/date';
import { settled } from '#/overlays/overlay-test';

const DateTimePicker = DatePicker<CalendarDateTime | ZonedDateTime>;
const onChange = fn<(value: CalendarDateTime | null | ZonedDateTime) => void>();

const meta = {
  args: {
    className: 'w-80',
    granularity: 'minute',
    label: 'Meeting',
    onChange,
  },
  beforeEach: () => {
    onChange.mockClear();
    return freezeDate(new Date(2026, 2, 10, 12));
  },
  component: DateTimePicker,
  title: 'Inputs/Date Picker/Time',
} satisfies Meta<typeof DateTimePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

async function openTime(canvas: ReturnType<typeof within>) {
  await userEvent.click(canvas.getByRole('button', { name: /^Calendar/u }));
  const dialog = await screen.findByRole('dialog');
  await settled(dialog);
  return { dialog, time: within(dialog).getByRole('group', { name: 'Time' }) };
}

// The popover's time field, named "Time" by default, takes the picker's
// granularity, hour cycle and hidden time zone.
export const TimeProps: Story = {
  args: {
    defaultValue: parseZonedDateTime('2026-03-14T21:30:15[America/New_York]'),
    granularity: 'second',
    hideTimeZone: true,
    hourCycle: 24,
  },
  play: async ({ canvas }) => {
    const { time } = await openTime(canvas);
    const segments = within(time);
    await expect(
      segments.getByRole('spinbutton', { name: /^second/u }),
    ).toBeVisible();
    await expect(
      segments.queryByRole('spinbutton', { name: /^AM\/PM/u }),
    ).toBeNull();
    await expect(time).toHaveTextContent('21:30:15');
    await expect(time).not.toHaveTextContent(/[A-Z]{2,}T/u);
  },
};

// Emptying the time changes nothing: a date and time value always has one, so
// the field returns to the picker's time.
export const ClearTime: Story = {
  args: { defaultValue: parseDateTime('2026-03-14T09:30') },
  play: async ({ canvas }) => {
    const { time } = await openTime(canvas);
    for (const [unit, keys] of [
      ['hour', '{Backspace}{Backspace}'],
      ['minute', '{Backspace}{Backspace}'],
      ['AM/PM', '{Backspace}'],
    ] as const) {
      await userEvent.click(
        within(time).getByRole('spinbutton', {
          name: new RegExp(`^${unit}`, 'u'),
        }),
      );
      await userEvent.keyboard(keys);
    }
    await waitFor(() => expect(time).toHaveTextContent(/9:30/u));
    await expect(onChange).not.toHaveBeenCalled();
  },
};

// A time typed before the date keeps the zoned placeholder's time zone.
export const ZonedPlaceholder: Story = {
  args: {
    placeholderValue: parseZonedDateTime('2026-03-14T09:00[America/New_York]'),
  },
  play: async ({ canvas }) => {
    const { time } = await openTime(canvas);
    await userEvent.click(
      within(time).getByRole('spinbutton', { name: /^hour/u }),
    );
    await userEvent.keyboard('1045a');
    await userEvent.click(screen.getByRole('button', { name: /March 20,/u }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const value = onChange.mock.lastCall?.[0];
    await expect(value && 'timeZone' in value ? value.timeZone : null).toBe(
      'America/New_York',
    );
  },
};

function Lockable() {
  const [locked, setLocked] = useState(false);
  return (
    <DateTimePicker
      calendarProps={{
        footer: <Button onPress={() => setLocked(true)}>Lock</Button>,
      }}
      className="w-80"
      defaultValue={parseDateTime('2026-03-14T09:30')}
      granularity="minute"
      isReadOnly={locked}
      label="Meeting"
    />
  );
}

// The time field follows the picker's read-only state while open.
export const ReadOnlyWhileOpen: Story = {
  play: async ({ canvas }) => {
    const { time } = await openTime(canvas);
    const hour = within(time).getByRole('spinbutton', { name: /^hour/u });
    await expect(hour).not.toHaveAttribute('aria-readonly');
    await userEvent.click(screen.getByRole('button', { name: 'Lock' }));
    await expect(hour).toHaveAttribute('aria-readonly', 'true');
  },
  render: () => <Lockable />,
};
