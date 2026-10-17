import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  type CalendarDateTime,
  parseDateTime,
  parseZonedDateTime,
  type ZonedDateTime,
} from '@internationalized/date';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { DateRangePicker } from '@oakoss/ui/components/ui/inputs/date-range-picker';
import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { freezeDate } from '#/helpers/date';
import { settled } from '#/overlays/overlay-test';

type Value = CalendarDateTime | ZonedDateTime;

const DateTimeRangePicker = DateRangePicker<Value>;
const onChange = fn<(value: { end: Value; start: Value } | null) => void>();

const meta = {
  args: {
    className: 'w-96',
    defaultValue: {
      end: parseDateTime('2026-03-16T10:00'),
      start: parseDateTime('2026-03-14T09:30'),
    },
    granularity: 'minute',
    label: 'Booking',
    onChange,
  },
  beforeEach: () => {
    onChange.mockClear();
    return freezeDate(new Date(2026, 2, 10, 12));
  },
  component: DateTimeRangePicker,
  title: 'Inputs/Date Range Picker/Time',
} satisfies Meta<typeof DateTimeRangePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

async function openTimes(canvas: ReturnType<typeof within>, names?: string[]) {
  await userEvent.click(canvas.getByRole('button', { name: /^Calendar/u }));
  const dialog = await screen.findByRole('dialog');
  await settled(dialog);
  const [startName = 'Start time', endName = 'End time'] = names ?? [];
  return {
    dialog,
    end: within(dialog).getByRole('group', { name: endName }),
    start: within(dialog).getByRole('group', { name: startName }),
  };
}

// A date and time range adds start and end time fields under the calendar,
// each editing its own end of the range.
export const Times: Story = {
  play: async ({ canvas }) => {
    const { end, start } = await openTimes(canvas);
    await expect(start).toHaveTextContent(/9:30/u);
    await expect(end).toHaveTextContent(/10:00/u);
    await userEvent.click(
      within(start).getByRole('spinbutton', { name: /^hour/u }),
    );
    await userEvent.keyboard('{ArrowUp}');
    await expect(onChange).toHaveBeenLastCalledWith({
      end: parseDateTime('2026-03-16T10:00'),
      start: parseDateTime('2026-03-14T10:30'),
    });
    await userEvent.click(
      within(end).getByRole('spinbutton', { name: /^hour/u }),
    );
    await userEvent.keyboard('{ArrowUp}');
    await expect(onChange).toHaveBeenLastCalledWith({
      end: parseDateTime('2026-03-16T11:00'),
      start: parseDateTime('2026-03-14T10:30'),
    });
  },
};

// startTimeLabel and endTimeLabel name the fields, which take the picker's
// granularity, hour cycle and hidden time zone.
export const TimeProps: Story = {
  args: {
    defaultValue: {
      end: parseZonedDateTime('2026-03-16T23:00:00[America/New_York]'),
      start: parseZonedDateTime('2026-03-14T21:30:15[America/New_York]'),
    },
    endTimeLabel: 'Check out',
    granularity: 'second',
    hideTimeZone: true,
    hourCycle: 24,
    startTimeLabel: 'Check in',
  },
  play: async ({ canvas }) => {
    const { end, start } = await openTimes(canvas, ['Check in', 'Check out']);
    await expect(
      within(start).getByRole('spinbutton', { name: /^second/u }),
    ).toBeVisible();
    await expect(
      within(end).queryByRole('spinbutton', { name: /^AM\/PM/u }),
    ).toBeNull();
    await expect(start).toHaveTextContent('21:30:15');
    await expect(end).not.toHaveTextContent(/[A-Z]{2,}T/u);
  },
};

async function clearTime(group: HTMLElement) {
  for (const [unit, keys] of [
    ['hour', '{Backspace}{Backspace}'],
    ['minute', '{Backspace}{Backspace}'],
    ['AM/PM', '{Backspace}'],
  ] as const) {
    await userEvent.click(
      within(group).getByRole('spinbutton', {
        name: new RegExp(`^${unit}`, 'u'),
      }),
    );
    await userEvent.keyboard(keys);
  }
}

// Emptying a time changes nothing: a date and time value always has one, so
// the field returns to the range's time.
export const ClearTime: Story = {
  play: async ({ canvas }) => {
    const { start } = await openTimes(canvas);
    await clearTime(start);
    await waitFor(() => expect(start).toHaveTextContent(/9:30/u));
    await expect(onChange).not.toHaveBeenCalled();
  },
};

// Times typed before the dates survive being emptied, as in Date Picker.
export const ClearPendingTime: Story = {
  args: { defaultValue: undefined },
  play: async ({ canvas }) => {
    const times = await openTimes(canvas);
    for (const group of [times.start, times.end]) {
      await userEvent.click(
        within(group).getByRole('spinbutton', { name: /^hour/u }),
      );
      await userEvent.keyboard('930p');
      await clearTime(group);
      await waitFor(() => expect(group).toHaveTextContent(/9:30/u));
    }
  },
};

// A date alone gets no time fields.
export const DateOnly: Story = {
  args: { defaultValue: undefined, granularity: undefined },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Calendar/u }));
    const dialog = await screen.findByRole('dialog');
    await settled(dialog);
    await expect(
      within(dialog).queryByRole('spinbutton', { name: /^hour/u }),
    ).toBeNull();
  },
};

// Times typed before the dates keep the zoned placeholder's time zone.
export const ZonedPlaceholder: Story = {
  args: {
    defaultValue: undefined,
    placeholderValue: parseZonedDateTime('2026-03-14T09:00[America/New_York]'),
  },
  play: async ({ canvas }) => {
    const { start } = await openTimes(canvas);
    await userEvent.click(
      within(start).getByRole('spinbutton', { name: /^hour/u }),
    );
    await userEvent.keyboard('1045a');
    await userEvent.click(screen.getByRole('button', { name: /March 20,/u }));
    await userEvent.click(screen.getByRole('button', { name: /March 24,/u }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    const value = onChange.mock.lastCall?.[0]?.start;
    await expect(value && 'timeZone' in value ? value.timeZone : null).toBe(
      'America/New_York',
    );
    await expect(value?.hour).toBe(10);
  },
};

async function expectLocks(
  canvas: ReturnType<typeof within>,
  attribute: 'aria-disabled' | 'aria-readonly',
) {
  const { end, start } = await openTimes(canvas);
  const hours = [start, end].map((group) =>
    within(group).getByRole('spinbutton', { name: /^hour/u }),
  );
  for (const hour of hours) {
    await expect(hour).not.toHaveAttribute(attribute);
  }
  await userEvent.click(screen.getByRole('button', { name: 'Lock' }));
  for (const hour of hours) {
    await expect(hour).toHaveAttribute(attribute, 'true');
  }
}

function Lockable({ prop }: { prop: 'isDisabled' | 'isReadOnly' }) {
  const [locked, setLocked] = useState(false);
  return (
    <DateTimeRangePicker
      calendarProps={{
        footer: <Button onPress={() => setLocked(true)}>Lock</Button>,
      }}
      className="w-96"
      defaultValue={{
        end: parseDateTime('2026-03-16T10:00'),
        start: parseDateTime('2026-03-14T09:30'),
      }}
      granularity="minute"
      label="Booking"
      {...{ [prop]: locked }}
    />
  );
}

// Both time fields follow the picker's read-only state while open.
export const ReadOnlyWhileOpen: Story = {
  play: ({ canvas }) => expectLocks(canvas, 'aria-readonly'),
  render: () => <Lockable prop="isReadOnly" />,
};

// Both time fields follow the picker's disabled state while open.
export const DisabledWhileOpen: Story = {
  play: ({ canvas }) => expectLocks(canvas, 'aria-disabled'),
  render: () => <Lockable prop="isDisabled" />,
};
