import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  type CalendarDate,
  type CalendarDateTime,
  parseDate,
  parseDateTime,
} from '@internationalized/date';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { CalendarMonthYearSelect } from '@oakoss/ui/components/ui/inputs/calendar-month-year-select';
import { DatePicker } from '@oakoss/ui/components/ui/inputs/date-picker';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { freezeDate } from '#/helpers/date';
import { settled, wait } from '#/overlays/overlay-test';

const SingleDatePicker = DatePicker<CalendarDate>;
const onChange = fn<(value: CalendarDate | null) => void>();

const meta = {
  args: {
    className: 'w-64',
    defaultValue: parseDate('2026-03-14'),
    label: 'Due date',
    onChange,
  },
  beforeEach: () => {
    onChange.mockClear();
    return freezeDate(new Date(2026, 2, 10, 12));
  },
  component: SingleDatePicker,
  title: 'Inputs/Date Picker',
} satisfies Meta<typeof SingleDatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

// The input, its decorations and the trigger form one group named by the
// label. React Aria names the trigger and the calendar dialog, after the
// field; picking a day closes it and puts focus back on the trigger.
export const Default: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Due date' });
    await expect(group).toHaveAttribute('data-slot', 'input-group');
    const trigger = canvas.getByRole('button', { name: /^Calendar/u });
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: /Due date/u });
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await settled(dialog);
    await userEvent.click(screen.getByRole('button', { name: /March 20,/u }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(onChange).toHaveBeenCalledWith(parseDate('2026-03-20'));
    await expect(group).toHaveTextContent('3/20/2026');
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

// Alt+↓ in a segment opens the calendar on the current value, and Escape
// closes it.
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('spinbutton', { name: /^day/u }));
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    const dialog = await screen.findByRole('dialog');
    await settled(dialog);
    await waitFor(() =>
      expect(document.activeElement).toHaveAccessibleName(/March 14,/u),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
  },
};

// The popover sits under the whole field, from its start edge, not under
// the trigger.
export const Placement: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Due date' });
    await userEvent.click(canvas.getByRole('button', { name: /^Calendar/u }));
    const dialog = await screen.findByRole('dialog');
    await settled(dialog);
    const panel = dialog.closest('[data-slot=popover-content]');
    if (!panel) throw new Error('No popover');
    const [box, field] = [panel, group].map((el) => el.getBoundingClientRect());
    await expect(Math.round(box?.left ?? 0)).toBe(Math.round(field?.left ?? 0));
    await expect(box?.top ?? 0).toBeGreaterThan(field?.bottom ?? 0);
  },
  render: (args) => (
    <div className="ps-24">
      <SingleDatePicker {...args} />
    </div>
  ),
};

// A date and time value adds a time field under the calendar, named by
// timeLabel, which edits the picker's time.
export const WithTime: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Meeting' });
    await userEvent.click(canvas.getByRole('button', { name: /^Calendar/u }));
    const dialog = await screen.findByRole('dialog');
    await settled(dialog);
    const hour = screen.getByRole('spinbutton', { name: /^hour, Starts/u });
    await userEvent.click(hour);
    await userEvent.keyboard('{ArrowUp}');
    await expect(group).toHaveTextContent(/10:30/u);
  },
  render: () => (
    <DatePicker<CalendarDateTime>
      className="w-72"
      defaultValue={parseDateTime('2026-03-14T09:30')}
      granularity="minute"
      label="Meeting"
      timeLabel="Starts"
    />
  ),
};

// A date alone gets no time field.
export const DateOnly: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Calendar/u }));
    const dialog = await screen.findByRole('dialog');
    await settled(dialog);
    await expect(
      within(dialog).queryByRole('spinbutton', { name: /^hour/u }),
    ).toBeNull();
  },
};

// The popover grows to fit two months side by side. A footer Button doesn't
// toggle it, since React Aria clears the trigger's button context inside.
export const CalendarProps: Story = {
  args: {
    calendarProps: {
      footer: <Button onPress={() => onChange(null)}>Clear</Button>,
      visibleMonths: 2,
    },
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Calendar/u }));
    const dialog = await screen.findByRole('dialog');
    await settled(dialog);
    const [first, second] = screen
      .getAllByRole('grid')
      .map((grid) => grid.getBoundingClientRect().top);
    await expect(second).toBe(first);
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    await expect(onChange).toHaveBeenCalledWith(null);
    await wait(300);
    await expect(dialog).toBeInTheDocument();
  },
};

// The month and year dropdowns work inside the popover: picking a year
// keeps the popover open and returns focus to the dropdown.
export const MonthYearSelect: Story = {
  args: { calendarProps: { heading: <CalendarMonthYearSelect /> } },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Calendar/u }));
    const dialog = await screen.findByRole('dialog');
    await settled(dialog);
    const year = screen.getByRole('button', { name: /year/u });
    await userEvent.click(year);
    await userEvent.click(await screen.findByRole('option', { name: '2028' }));
    await waitFor(() => expect(year).toHaveFocus());
    await expect(dialog).toBeInTheDocument();
    await expect(year).toHaveTextContent('2028');
  },
};

// Decorations keep their own buttons: one in end keeps its name and press
// rather than taking the trigger's, which stays last.
export const Decorations: Story = {
  args: {
    end: (
      <Button aria-label="Info" onPress={() => onChange(null)}>
        i
      </Button>
    ),
    start: 'Due',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('spinbutton', { name: /^month/u }),
    ).toHaveAccessibleDescription(/Due$/u);
    const info = canvas.getByRole('button', { name: 'Info' });
    await userEvent.click(info);
    await expect(onChange).toHaveBeenCalledWith(null);
    await expect(screen.queryByRole('dialog')).toBeNull();
    const buttons = canvas.getAllByRole('button');
    await expect(buttons.at(-1)).toHaveAccessibleName(/^Calendar/u);
  },
};

// The form gets the ISO date from a hidden input named by `name`.
export const FormValue: Story = {
  args: { name: 'due' },
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form');
    if (!form) throw new Error('No form');
    await expect(new FormData(form).get('due')).toBe('2026-03-14');
  },
  render: (args) => (
    <form>
      <SingleDatePicker {...args} />
    </form>
  ),
};
