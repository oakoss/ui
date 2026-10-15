import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  CalendarDate,
  isWeekend,
  parseZonedDateTime,
  today,
} from '@internationalized/date';
import { Calendar } from '@oakoss/ui/components/ui/inputs/calendar';
import { expect, userEvent, within } from 'storybook/test';

import { contrast, tokenColor } from '#/helpers/color';
import { freezeDate } from '#/helpers/date';
import { valueUnderMedia } from '#/helpers/media';

const SingleCalendar = Calendar<CalendarDate>;

const meta = {
  args: { 'aria-label': 'Delivery date' },
  beforeEach: () => freezeDate(new Date(2026, 0, 15, 12)),
  component: SingleCalendar,
  title: 'Inputs/Calendar',
} satisfies Meta<typeof SingleCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

function day(canvas: HTMLElement, label: RegExp) {
  return within(canvas).getByRole('button', { name: label });
}

function face(cell: HTMLElement) {
  const found = cell.querySelector<HTMLElement>('[data-slot=calendar-day]');
  if (!found) throw new Error('No day face');
  return found;
}

// Six weeks always render, so the calendar keeps its height between months.
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading')).toHaveTextContent('January 2026');
    await expect(
      canvasElement.querySelectorAll(':scope tbody tr'),
    ).toHaveLength(6);
    const today = day(canvasElement, /Today, Thursday, January 15, 2026/u);
    await expect(
      today.querySelector('[data-slot=calendar-today]'),
    ).toBeVisible();
    await expect(today.getBoundingClientRect().width).toBe(36);
  },
};

// Days grow to 44px wherever a touch pointer is present, a touchscreen laptop
// included.
export const TouchSize: Story = {
  play: async ({ canvasElement }) => {
    const today = day(canvasElement, /January 15, 2026/u);
    const probe = document.createElement('div');
    for (const property of ['width', 'height']) {
      const value = valueUnderMedia(today, '(any-pointer: coarse)', property);
      probe.style.setProperty(property, value ?? '');
    }
    canvasElement.append(probe);
    const box = probe.getBoundingClientRect();
    probe.remove();
    await expect([box.width, box.height]).toEqual([44, 44]);
  },
};

// A zoned value sets the time zone today is read in: at noon UTC it's already
// January 16 in Auckland, whatever zone the runner is in.
export const ZonedValue: Story = {
  beforeEach: () => freezeDate(new Date(Date.UTC(2026, 0, 15, 12))),
  play: async ({ canvasElement }) => {
    const auckland = today('Pacific/Auckland');
    await expect(auckland.day).toBe(16);
    const marked = canvasElement.querySelector('[data-today]');
    await expect(marked).toHaveAccessibleName(
      /Today, Friday, January 16, 2026/u,
    );
  },
  render: () => (
    <Calendar
      aria-label="Delivery date"
      defaultValue={parseZonedDateTime('2026-01-20T09:00[Pacific/Auckland]')}
    />
  ),
};

// firstDayOfWeek overrides the locale's, so a US grid can open on Monday.
export const FirstDayOfWeek: Story = {
  args: { firstDayOfWeek: 'mon' },
  play: async ({ canvasElement }) => {
    const first = canvasElement.querySelector(':scope tbody td [role=button]');
    await expect(first).toHaveAccessibleName(/Monday, December 29, 2025/u);
  },
};

export const Selecting: Story = {
  play: async ({ canvasElement }) => {
    const cell = day(canvasElement, /January 20, 2026/u);
    await userEvent.click(cell);
    await expect(cell).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/selected/u),
    );
    const style = getComputedStyle(face(cell));
    await expect(style.backgroundColor).toBe(
      tokenColor('--color-primary', canvasElement),
    );
    await expect(
      contrast(style.color, style.backgroundColor),
    ).toBeGreaterThanOrEqual(4.5);
  },
};

// React Aria's Home and End go to the month's first and last day, not the
// week's.
export const Keyboard: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect(document.activeElement).toHaveAccessibleName(
      /Today, Thursday, January 15, 2026/u,
    );
    const focused = document.activeElement;
    if (!(focused instanceof HTMLElement)) throw new Error('Nothing focused');
    await expect(getComputedStyle(face(focused)).outlineStyle).toBe('solid');
    await userEvent.keyboard('{ArrowRight}');
    await expect(document.activeElement).toHaveAccessibleName(/January 16/u);
    await userEvent.keyboard('{Home}');
    await expect(document.activeElement).toHaveAccessibleName(/January 1,/u);
    await userEvent.keyboard('{PageDown}');
    await expect(within(canvasElement).getByRole('heading')).toHaveTextContent(
      'February 2026',
    );
  },
};

export const Unavailable: Story = {
  args: { isDateUnavailable: (date) => isWeekend(date, 'en-US') },
  play: async ({ canvasElement }) => {
    const saturday = day(canvasElement, /Saturday, January 17, 2026/u);
    await expect(saturday).toHaveAttribute('aria-disabled', 'true');
    await expect(getComputedStyle(face(saturday)).textDecorationLine).toBe(
      'line-through',
    );
    const monday = day(canvasElement, /Monday, January 19, 2026/u);
    await expect(getComputedStyle(face(monday)).textDecorationLine).toBe(
      'none',
    );
  },
};

// The message renders only while the calendar is invalid, and describes the
// selected day.
export const Invalid: Story = {
  args: {
    defaultValue: new CalendarDate(2026, 1, 17),
    errorMessage: 'Pick a weekday.',
    isInvalid: true,
  },
  play: async ({ canvasElement }) => {
    const selected = day(canvasElement, /January 17, 2026/u);
    await expect(selected).toHaveAccessibleDescription('Pick a weekday.');
    const style = getComputedStyle(face(selected));
    await expect(style.backgroundColor).toBe(
      tokenColor('--color-destructive', canvasElement),
    );
    await expect(
      contrast(style.color, style.backgroundColor),
    ).toBeGreaterThanOrEqual(4.5);
  },
};

// Layout props that render nothing mount nothing: the month keeps its heading
// and an invalid calendar gets no empty message.
export const EmptySlots: Story = {
  args: { errorMessage: false, heading: false, isInvalid: true },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot=calendar-heading]'),
    ).toHaveTextContent('January 2026');
    await expect(
      canvasElement.querySelector('[data-slot=calendar-error]'),
    ).toBeNull();
  },
};

export const ValidHidesMessage: Story = {
  args: { errorMessage: 'Pick a weekday.' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText('Pick a weekday.'),
    ).toBeNull();
  },
};

export const Loading: Story = {
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvasElement.querySelector('[data-slot=calendar-months]'),
    ).toHaveAttribute('aria-busy', 'true');
    await expect(
      canvas.getByRole('progressbar', { name: 'Loading' }),
    ).toBeVisible();
  },
};

export const LoadingLabel: Story = {
  args: { isLoading: true, loadingLabel: 'Fetching availability' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('progressbar', {
        name: 'Fetching availability',
      }),
    ).toBeVisible();
  },
};

// Holidays come from the app; a fixed-date one is unavailable in any year.
export const Holidays: Story = {
  args: {
    isDateUnavailable: (date) =>
      isWeekend(date, 'en-US') || (date.month === 1 && date.day === 1),
  },
  play: async ({ canvasElement }) => {
    const newYear = day(canvasElement, /Thursday, January 1, 2026/u);
    await expect(newYear).toHaveAttribute('aria-disabled', 'true');
    await expect(getComputedStyle(face(newYear)).textDecorationLine).toBe(
      'line-through',
    );
    await expect(day(canvasElement, /January 2, 2026/u)).not.toHaveAttribute(
      'aria-disabled',
    );
  },
};
