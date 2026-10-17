import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  type CalendarDate,
  getLocalTimeZone,
  parseDate,
  today,
} from '@internationalized/date';
import * as Icon from '@oakoss/ui/components/icons';
import { Button, buttonStyles } from '@oakoss/ui/components/ui/inputs/button';
import { Calendar } from '@oakoss/ui/components/ui/inputs/calendar';
import {
  DatePicker,
  DatePickerContent,
} from '@oakoss/ui/components/ui/inputs/date-picker';
import { FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { use } from 'react';
import {
  Button as AriaButton,
  DatePickerStateContext,
  Group,
  useLocale,
} from 'react-aria-components';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { freezeDate } from '#/helpers/date';
import { settled } from '#/overlays/overlay-test';

const SingleDatePicker = DatePicker<CalendarDate>;

const meta = {
  beforeEach: () => freezeDate(new Date(2026, 2, 10, 12)),
  component: SingleDatePicker,
  title: 'Inputs/Date Picker/Composition',
} satisfies Meta<typeof SingleDatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

// The date as the trigger's text and name, as the WAI-ARIA date picker
// dialog names its button after the date it holds.
function DateButton({ placeholder }: { placeholder: string }) {
  const state = use(DatePickerStateContext);
  const { locale } = useLocale();
  const text = state?.value
    ? state.formatValue(locale, { month: 'long' })
    : placeholder;
  return (
    <AriaButton
      aria-label={text}
      className={buttonStyles({
        className: 'w-56 justify-between',
        variant: 'outline',
      })}
    >
      {text}
      <Icon.Calendar aria-hidden />
    </AriaButton>
  );
}

function PresetButtons() {
  const state = use(DatePickerStateContext);
  const now = today(getLocalTimeZone());
  return (
    <div className="flex gap-2">
      {[
        { date: now, label: 'Today' },
        { date: now.add({ weeks: 1 }), label: 'In a week' },
      ].map(({ date, label }) => (
        <Button
          key={label}
          onPress={() => {
            state?.setValue(date);
            state?.close();
          }}
          size="sm"
          variant="outline"
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

// Presets in the calendar's footer set the value from today, read when
// pressed, and close the popover as picking a day does.
export const Presets: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Calendar/u }));
    const dialog = await screen.findByRole('dialog');
    await settled(dialog);
    await userEvent.click(screen.getByRole('button', { name: 'In a week' }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(
      canvas.getByRole('group', { name: 'Due date' }),
    ).toHaveTextContent('3/17/2026');
  },
  render: () => (
    <SingleDatePicker
      calendarProps={{ footer: <PresetButtons /> }}
      className="w-64"
      label="Due date"
    />
  ),
};

// A button that shows the date in place of the segments: named for the date
// and the field, it opens the calendar, and picking a day renames it.
export const ButtonTrigger: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', {
      name: 'March 14, 2026 Check-in',
    });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await settled(dialog);
    await userEvent.click(screen.getByRole('button', { name: /March 20,/u }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(
      canvas.getByRole('button', { name: 'March 20, 2026 Check-in' }),
    ).toHaveTextContent('March 20, 2026');
  },
  render: () => (
    <SingleDatePicker defaultValue={parseDate('2026-03-14')}>
      <FieldLabel>Check-in</FieldLabel>
      <Group className="w-fit">
        <DateButton placeholder="Pick a date" />
      </Group>
      <DatePickerContent>
        <Calendar />
      </DatePickerContent>
    </SingleDatePicker>
  ),
};
