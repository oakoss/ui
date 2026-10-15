import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarDate, isWeekend } from '@internationalized/date';
import { RangeCalendar } from '@oakoss/ui/components/ui/inputs/calendar';
import { expect, userEvent, within } from 'storybook/test';

import { computedColor, contrast, tokenColor } from '#/helpers/color';
import { freezeDate } from '#/helpers/date';

const DateRangeCalendar = RangeCalendar<CalendarDate>;

const meta = {
  args: { 'aria-label': 'Trip dates' },
  beforeEach: () => freezeDate(new Date(2026, 0, 15, 12)),
  component: DateRangeCalendar,
  title: 'Inputs/Calendar/Range',
} satisfies Meta<typeof DateRangeCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

function cell(canvas: HTMLElement, label: RegExp) {
  return within(canvas).getByRole('button', { name: label });
}

const clear = 'rgba(0, 0, 0, 0)';

// The band is a layer behind the day; a day off the range has none.
function styles(element: HTMLElement) {
  const day = element.querySelector<HTMLElement>('[data-slot=calendar-day]');
  if (!day) throw new Error('No day face');
  const band = element.querySelector<HTMLElement>('[data-slot=calendar-band]');
  return {
    band: band ? getComputedStyle(band).backgroundColor : clear,
    day: getComputedStyle(day),
  };
}

// The ends fill and the days between take the band, whose text meets 4.5:1.
export const Selecting: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(cell(canvasElement, /January 12, 2026/u));
    await userEvent.click(cell(canvasElement, /January 16, 2026/u));
    const start = styles(cell(canvasElement, /January 12, 2026/u));
    const middle = styles(cell(canvasElement, /January 14, 2026/u));
    const subtle = tokenColor('--color-primary-subtle', canvasElement);
    await expect(start.day.backgroundColor).toBe(
      tokenColor('--color-primary', canvasElement),
    );
    await expect(middle.band).toBe(subtle);
    await expect(middle.day.backgroundColor).toBe(clear);
    await expect(
      contrast(middle.day.color, middle.band),
    ).toBeGreaterThanOrEqual(4.5);
    await expect(styles(cell(canvasElement, /January 20, 2026/u)).band).toBe(
      clear,
    );
  },
};

// Moving focus after the first pick previews the range, as hovering does.
export const KeyboardPreview: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}{ArrowRight}{ArrowRight}');
    await expect(styles(cell(canvasElement, /January 16, 2026/u)).band).toBe(
      tokenColor('--color-primary-subtle', canvasElement),
    );
  },
};

// React Aria never selects days outside the month, but the band runs on
// through the ones inside the range.
export const OutsideDaysInRange: Story = {
  args: {
    defaultValue: {
      end: new CalendarDate(2026, 2, 3),
      start: new CalendarDate(2026, 1, 28),
    },
  },
  play: async ({ canvasElement }) => {
    const february = canvasElement.querySelectorAll<HTMLElement>(
      '[data-outside-month]',
    );
    const inRange = [...february].filter((day) =>
      ['1', '2', '3'].includes(day.textContent),
    );
    await expect(inRange.length).toBeGreaterThan(0);
    for (const day of inRange) {
      await expect(styles(day).band).toBe(
        tokenColor('--color-primary-subtle', canvasElement),
      );
    }
    const end = inRange.find((day) => day.textContent === '3');
    if (!end) throw new Error('No range end');
    await expect(styles(end).day.backgroundColor).toBe(
      tokenColor('--color-primary', canvasElement),
    );
  },
};

// Unavailable days break a non-contiguous range's band, outside the month as
// inside it.
export const UnavailableInRange: Story = {
  args: {
    allowsNonContiguousRanges: true,
    defaultValue: {
      end: new CalendarDate(2026, 2, 5),
      start: new CalendarDate(2026, 1, 26),
    },
    isDateUnavailable: (date) => isWeekend(date, 'en-US'),
  },
  play: async ({ canvasElement }) => {
    const outside = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-outside-month]'),
    ];
    const sunday = outside.find((day) => day.textContent === '1');
    const monday = outside.find((day) => day.textContent === '2');
    if (!sunday || !monday) throw new Error('No February days');
    await expect(styles(sunday).band).toBe(clear);
    await expect(styles(monday).band).toBe(
      tokenColor('--color-primary-subtle', canvasElement),
    );
    await expect(styles(cell(canvasElement, /January 31, 2026/u)).band).toBe(
      clear,
    );
  },
};

export const Invalid: Story = {
  args: {
    defaultValue: {
      end: new CalendarDate(2026, 1, 16),
      start: new CalendarDate(2026, 1, 12),
    },
    errorMessage: 'Trips run up to four days.',
    isInvalid: true,
  },
  play: async ({ canvasElement }) => {
    const middle = styles(cell(canvasElement, /January 14, 2026/u));
    await expect(middle.band).toBe(
      tokenColor('--color-destructive-subtle', canvasElement),
    );
    await expect(
      contrast(middle.day.color, middle.band),
    ).toBeGreaterThanOrEqual(4.5);
    await expect(
      within(canvasElement).getByText('Trips run up to four days.'),
    ).toBeVisible();
  },
};

// Outside days past maxValue stay off the band and unfilled, as in-month ones
// do; React Aria won't select either.
export const OutsideDaysPastMax: Story = {
  args: {
    defaultValue: {
      end: new CalendarDate(2026, 2, 3),
      start: new CalendarDate(2026, 1, 26),
    },
    maxValue: new CalendarDate(2026, 1, 29),
  },
  play: async ({ canvasElement }) => {
    const end = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-outside-month]'),
    ].find((day) => day.textContent === '3');
    if (!end) throw new Error('No February 3');
    await expect(styles(end).band).toBe(clear);
    await expect(styles(end).day.backgroundColor).toBe(clear);
    await expect(styles(cell(canvasElement, /January 30, 2026/u)).band).toBe(
      clear,
    );
  },
};

// An invalid range bands its unavailable days, as React Aria does inside the
// month, so the outside ones leave no gap.
export const InvalidRangeUnavailable: Story = {
  args: {
    defaultValue: {
      end: new CalendarDate(2026, 2, 3),
      start: new CalendarDate(2026, 1, 25),
    },
    isDateUnavailable: (date) => isWeekend(date, 'en-US'),
  },
  play: async ({ canvasElement }) => {
    const sunday = [
      ...canvasElement.querySelectorAll<HTMLElement>('[data-outside-month]'),
    ].find((day) => day.textContent === '1');
    if (!sunday) throw new Error('No February 1');
    const band = tokenColor('--color-destructive-subtle', canvasElement);
    await expect(styles(sunday).band).toBe(band);
    await expect(styles(cell(canvasElement, /January 31, 2026/u)).band).toBe(
      band,
    );
  },
};

// Across two months the band runs through each month's own days, while the
// days a month repeats from its neighbor stay hidden.
export const TwoMonths: Story = {
  args: {
    defaultValue: {
      end: new CalendarDate(2026, 2, 4),
      start: new CalendarDate(2026, 1, 28),
    },
    visibleMonths: 2,
  },
  play: async ({ canvasElement }) => {
    const [january, february] = within(canvasElement).getAllByRole('grid');
    if (!january || !february) throw new Error('Two grids expected');
    const subtle = tokenColor('--color-primary-subtle', canvasElement);
    await expect(styles(cell(february, /February 3, 2026/u)).band).toBe(subtle);
    const repeated = [
      ...january.querySelectorAll<HTMLElement>('[data-outside-month]'),
    ].find((day) => day.textContent === '3');
    await expect(repeated?.closest('td')).not.toBeVisible();
  },
};

// In High Contrast the band's fill is repainted, so it keeps a Highlight
// border, and an invalid end takes Mark.
export const ForcedColors: Story = {
  args: {
    defaultValue: {
      end: new CalendarDate(2026, 1, 16),
      start: new CalendarDate(2026, 1, 12),
    },
    isInvalid: true,
  },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvasElement }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const band = cell(canvasElement, /January 14, 2026/u).querySelector(
      '[data-slot=calendar-band]',
    );
    if (!band) throw new Error('No band');
    const border = getComputedStyle(band);
    await expect(border.borderTopStyle).toBe('solid');
    await expect(border.borderTopColor).toBe(computedColor('Highlight'));
    await expect(
      styles(cell(canvasElement, /January 12, 2026/u)).day.backgroundColor,
    ).toBe(computedColor('Mark'));
  },
  tags: ['forced-colors'],
};
