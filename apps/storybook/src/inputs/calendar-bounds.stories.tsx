import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarDate } from '@internationalized/date';
import {
  Calendar,
  RangeCalendar,
} from '@oakoss/ui/components/ui/inputs/calendar';
import { CalendarMonthYearSelect } from '@oakoss/ui/components/ui/inputs/calendar-month-year-select';
import { Select, SelectItem } from '@oakoss/ui/components/ui/inputs/select';
import {
  CalendarMonthPicker,
  CalendarYearPicker,
  type Key,
  SelectContext,
} from 'react-aria-components';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { freezeDate } from '#/helpers/date';

const SingleCalendar = Calendar<CalendarDate>;

const meta = {
  args: { 'aria-label': 'Delivery date' },
  beforeEach: () => freezeDate(new Date(2026, 0, 15, 12)),
  component: SingleCalendar,
  title: 'Inputs/Calendar/Bounds',
} satisfies Meta<typeof SingleCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

// Children that render nothing leave the layout in place.
export const EmptyChildren: Story = {
  args: { children: <>{false}</> },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('grid')).toBeVisible();
  },
};

// React Aria throws on zero, negative or fractional months, so the count is
// rounded down to a whole month, at least one.
export const WholeMonths: Story = {
  play: async ({ canvasElement }) => {
    const grids = (index: number) =>
      within(canvasElement)
        .getByTestId(`months-${index}`)
        .querySelectorAll('[role=grid]');
    await expect(grids(0)).toHaveLength(1);
    await expect(grids(1)).toHaveLength(2);
    await expect(grids(2)).toHaveLength(1);
  },
  render: () => (
    <>
      <div data-testid="months-0">
        <Calendar aria-label="None" visibleMonths={0} />
      </div>
      <div data-testid="months-1">
        <RangeCalendar aria-label="Two and a half" visibleMonths={2.5} />
      </div>
      <div data-testid="months-2">
        <Calendar aria-label="Minus one" visibleMonths={-1} />
      </div>
    </>
  ),
};

// The year picked is the one chosen, not the list's last, and the month stays.
export const YearChoice: Story = {
  args: {
    heading: <CalendarMonthYearSelect />,
    maxValue: new CalendarDate(2027, 12, 31),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /year/iu }));
    await userEvent.click(await screen.findByRole('option', { name: '2024' }));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /year/iu })).toHaveTextContent(
        '2024',
      ),
    );
    await expect(
      canvas.getByRole('button', { name: /month/iu }),
    ).toHaveTextContent('Jan');
  },
};

type PickerItem = { formatted: string; id: number };

// CalendarMonthYearSelect's markup, rebuilt so a SelectContext reaches one picker.
function pickerSelect(picker: {
  'aria-label': string;
  items: PickerItem[];
  onChange: (key: Key | null) => void;
  value: Key;
}) {
  return (
    <Select<PickerItem> {...picker} className="min-w-0" size="sm">
      {(item: PickerItem) => (
        <SelectItem id={item.id}>{item.formatted}</SelectItem>
      )}
    </Select>
  );
}

// The year list opens alone, up to maxValue's year, beside the closed month.
export const YearListOpen: Story = {
  args: {
    heading: (
      <div className="flex items-center gap-1" data-slot="calendar-month-year">
        <CalendarMonthPicker>{pickerSelect}</CalendarMonthPicker>
        <SelectContext value={{ defaultOpen: true }}>
          <CalendarYearPicker>{pickerSelect}</CalendarYearPicker>
        </SelectContext>
      </div>
    ),
    maxValue: new CalendarDate(2027, 12, 31),
  },
  play: async ({ canvasElement }) => {
    const [list, ...others] = await screen.findAllByRole('listbox');
    if (!list) throw new Error('No list');
    await expect(others).toHaveLength(0);
    await expect(list).toHaveAccessibleName(/year/iu);
    const options = within(list).getAllByRole('option');
    await expect(options.at(-1)).toHaveTextContent('2027');
    await expect(
      within(list).getByRole('option', { name: '2026' }),
    ).toHaveAttribute('aria-selected', 'true');
    await expect(
      within(canvasElement).getByRole('button', { name: /month/iu }),
    ).toHaveTextContent('Jan');
  },
};

// The year count is rounded down to a whole number, at least one; React Aria
// lists twenty for zero and none for a negative count.
export const YearCounts: Story = {
  play: async ({ canvasElement }) => {
    for (const [index, count] of [1, 1, 2].entries()) {
      await userEvent.click(
        within(within(canvasElement).getByTestId(`years-${index}`)).getByRole(
          'button',
          { name: /year/iu },
        ),
      );
      await expect(await screen.findAllByRole('option')).toHaveLength(count);
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    }
  },
  render: () => (
    <>
      {[0, -3, 2.5].map((years, index) => (
        <div data-testid={`years-${index}`} key={years}>
          <Calendar
            aria-label={`Years ${years}`}
            heading={<CalendarMonthYearSelect visibleYears={years} />}
          />
        </div>
      ))}
    </>
  ),
};
