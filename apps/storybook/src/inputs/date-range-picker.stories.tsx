import type { Meta, StoryObj } from '@storybook/react-vite';

import { type CalendarDate, parseDate } from '@internationalized/date';
import { DateRangePicker } from '@oakoss/ui/components/ui/inputs/date-range-picker';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { freezeDate } from '#/helpers/date';
import { settled } from '#/overlays/overlay-test';

type Range = { end: CalendarDate; start: CalendarDate };

const DayRangePicker = DateRangePicker<CalendarDate>;
const onChange = fn<(value: null | Range) => void>();

const meta = {
  args: {
    className: 'w-80',
    defaultValue: {
      end: parseDate('2026-03-16'),
      start: parseDate('2026-03-14'),
    },
    label: 'Stay',
    onChange,
  },
  beforeEach: () => {
    onChange.mockClear();
    return freezeDate(new Date(2026, 2, 10, 12));
  },
  component: DayRangePicker,
  title: 'Inputs/Date Range Picker',
} satisfies Meta<typeof DayRangePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

// The two inputs and the trigger, at the end edge, form one group named by
// the label, and React Aria names each input's segments. Picking two days in
// the range calendar sets both ends, closes it and puts focus back on the
// trigger.
export const Default: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Stay' });
    await expect(group).toHaveAttribute('data-slot', 'input-group');
    await expect(
      within(group).getByRole('spinbutton', { name: /^day, Start Date/u }),
    ).toHaveTextContent('14');
    await expect(
      within(group).getByRole('spinbutton', { name: /^day, End Date/u }),
    ).toHaveTextContent('16');
    const trigger = canvas.getByRole('button', { name: /^Calendar/u });
    const [box, button] = [group, trigger].map((el) =>
      el.getBoundingClientRect(),
    );
    await expect((box?.right ?? 0) - (button?.right ?? 0)).toBeLessThan(8);
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: /Stay/u });
    await settled(dialog);
    await userEvent.click(screen.getByRole('button', { name: /March 20,/u }));
    await userEvent.click(screen.getByRole('button', { name: /March 24,/u }));
    await waitFor(() => expect(dialog).not.toBeInTheDocument());
    await expect(onChange).toHaveBeenCalledWith({
      end: parseDate('2026-03-24'),
      start: parseDate('2026-03-20'),
    });
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

// Typing moves from the start input's last segment into the end input.
export const Typing: Story = {
  args: { defaultValue: undefined },
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole('spinbutton', { name: /^month, Start Date/u }),
    );
    await userEvent.keyboard('0314202603162026');
    await expect(onChange).toHaveBeenLastCalledWith({
      end: parseDate('2026-03-16'),
      start: parseDate('2026-03-14'),
    });
  },
};

// Two months sit side by side in a popover that grows to fit them.
export const TwoMonths: Story = {
  args: { calendarProps: { visibleMonths: 2 } },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Calendar/u }));
    await settled(await screen.findByRole('dialog'));
    const [first, second] = screen
      .getAllByRole('grid')
      .map((grid) => grid.getBoundingClientRect().top);
    await expect(second).toBe(first);
  },
};

// The form gets each end's ISO date from a hidden input named by startName
// and endName.
export const FormValue: Story = {
  args: { endName: 'checkOut', startName: 'checkIn' },
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form');
    if (!form) throw new Error('No form');
    const data = new FormData(form);
    await expect(data.get('checkIn')).toBe('2026-03-14');
    await expect(data.get('checkOut')).toBe('2026-03-16');
  },
  render: (args) => (
    <form>
      <DayRangePicker {...args} />
    </form>
  ),
};
