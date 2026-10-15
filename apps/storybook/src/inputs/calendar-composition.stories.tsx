import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarDate } from '@internationalized/date';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Calendar,
  CalendarGrid,
  CalendarHeader,
  RangeCalendar,
} from '@oakoss/ui/components/ui/inputs/calendar';
import { CalendarMonthYearSelect } from '@oakoss/ui/components/ui/inputs/calendar-month-year-select';
import {
  Popover,
  PopoverTrigger,
} from '@oakoss/ui/components/ui/overlays/popover';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { freezeDate } from '#/helpers/date';

const SingleCalendar = Calendar<CalendarDate>;

const meta = {
  args: { 'aria-label': 'Delivery date' },
  beforeEach: () => freezeDate(new Date(2026, 0, 15, 12)),
  component: SingleCalendar,
  title: 'Inputs/Calendar/Composition',
} satisfies Meta<typeof SingleCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

const onToday = fn<() => void>();

const onReset = fn<() => void>();

// Children replace the layout with the exported parts. Buttons in the header
// and anywhere else keep their own names and handlers, and the steppers page.
export const CustomLayout: Story = {
  args: {
    children: (
      <>
        <CalendarHeader>
          <Button onPress={onToday} size="sm" variant="ghost">
            Today
          </Button>
        </CalendarHeader>
        <CalendarGrid />
        <Button onPress={onReset} size="sm" variant="outline">
          Reset
        </Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Today' }));
    await expect(onToday).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(onReset).toHaveBeenCalledOnce();
    const next = canvasElement.querySelector<HTMLElement>(
      ':scope [data-slot=calendar-next]',
    );
    if (!next) throw new Error('No next stepper');
    await userEvent.click(next);
    await expect(canvas.getByRole('grid')).toHaveAccessibleName(
      /February 2026/u,
    );
  },
};

// A Button given a stepper slot in the header still pages, named by React
// Aria, in place of the built-in one.
export const OwnStepper: Story = {
  args: {
    children: (
      <>
        <CalendarHeader hasNext={false}>
          <Button slot="next" variant="outline">
            Later
          </Button>
        </CalendarHeader>
        <CalendarGrid />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stepper = canvas.getByText('Later').closest('button');
    if (!stepper) throw new Error('No stepper');
    await expect(stepper).toHaveAccessibleName('Next');
    await userEvent.click(stepper);
    await expect(canvas.getByRole('grid')).toHaveAccessibleName(
      /February 2026/u,
    );
  },
};

// Inside a popover, a footer Button keeps the dialog's close slot, which the
// calendar's own button context hides.
export const DialogClose: Story = {
  play: async () => {
    const dialog = await screen.findByRole('dialog', { name: 'Pick a date' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  },
  render: () => (
    <PopoverTrigger defaultOpen>
      <Button variant="outline">Open</Button>
      <Popover aria-label="Pick a date" className="w-fit">
        <Calendar
          aria-label="Delivery date"
          footer={
            <Button size="sm" slot="close">
              Done
            </Button>
          }
        />
      </Popover>
    </PopoverTrigger>
  ),
};

const onFix = fn<() => void>();

// A Button in the error message keeps its own handler.
export const ErrorButton: Story = {
  args: {
    errorMessage: (
      <>
        Pick a weekday. <Button onPress={onFix}>Next weekday</Button>
      </>
    ),
    isInvalid: true,
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Next weekday' }),
    );
    await expect(onFix).toHaveBeenCalledOnce();
  },
};

export const RangeDialogClose: Story = {
  play: DialogClose.play,
  render: () => (
    <PopoverTrigger defaultOpen>
      <Button variant="outline">Open</Button>
      <Popover aria-label="Pick a date" className="w-fit">
        <RangeCalendar
          aria-label="Trip dates"
          footer={
            <Button size="sm" slot="close">
              Done
            </Button>
          }
        />
      </Popover>
    </PopoverTrigger>
  ),
};

// renderCell draws a day's contents in place of the today dot, and marks
// today itself from isToday; React Aria still names the day by its date.
export const RenderCell: Story = {
  args: {
    renderCell: ({ formattedDate, isToday }) => (
      <span data-testid="price">
        {formattedDate}
        {isToday ? '!' : '*'}
      </span>
    ),
  },
  play: async ({ canvasElement }) => {
    const day = within(canvasElement).getByRole('button', {
      name: /Today, Thursday, January 15, 2026/u,
    });
    await expect(within(day).getByTestId('price')).toHaveTextContent('15!');
    await expect(day.querySelector('[data-slot=calendar-today]')).toBeNull();
    const other = within(canvasElement).getByRole('button', {
      name: /January 16, 2026/u,
    });
    await expect(within(other).getByTestId('price')).toHaveTextContent('16*');
  },
};

// A disabled calendar disables its month and year dropdowns too.
export const DisabledSelect: Story = {
  args: { heading: <CalendarMonthYearSelect />, isDisabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: /month/iu }),
    ).toBeDisabled();
    await expect(canvas.getByRole('button', { name: /year/iu })).toBeDisabled();
  },
};

const onClear = fn<() => void>();

// The range calendar shares the layout: a footer Button keeps its handler and
// the year dropdown keeps the month near maxValue.
export const Range: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(onClear).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole('button', { name: /year/iu }));
    await userEvent.click(await screen.findByRole('option', { name: '2027' }));
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /month/iu })).toHaveTextContent(
        'Jan',
      ),
    );
  },
  render: () => (
    <RangeCalendar
      aria-label="Trip dates"
      footer={<Button onPress={onClear}>Clear</Button>}
      heading={<CalendarMonthYearSelect />}
      maxValue={new CalendarDate(2027, 12, 31)}
    />
  ),
};
