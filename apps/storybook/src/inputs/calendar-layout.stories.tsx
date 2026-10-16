import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarDate } from '@internationalized/date';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { Calendar } from '@oakoss/ui/components/ui/inputs/calendar';
import { CalendarMonthYearSelect } from '@oakoss/ui/components/ui/inputs/calendar-month-year-select';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { computedColor } from '#/helpers/color';
import { freezeDate } from '#/helpers/date';
import { setState } from '#/helpers/state';

const SingleCalendar = Calendar<CalendarDate>;

const meta = {
  args: { 'aria-label': 'Delivery date' },
  beforeEach: () => freezeDate(new Date(2026, 0, 15, 12)),
  component: SingleCalendar,
  title: 'Inputs/Calendar/Layout',
} satisfies Meta<typeof SingleCalendar>;

export default meta;

type Story = StoryObj<typeof meta>;

const onClear = fn<() => void>();
const onToday = fn<() => void>();

function headings(canvas: HTMLElement) {
  return [...canvas.querySelectorAll('[data-slot=calendar-heading]')].map(
    (heading) => heading.textContent,
  );
}

// Each month shows its heading, while React Aria names the calendar with the
// whole span; the steppers sit at the outer edges, and days a neighboring
// month on screen repeats are hidden.
export const TwoMonths: Story = {
  args: { visibleMonths: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(headings(canvasElement)).toEqual([
      'January 2026',
      'February 2026',
    ]);
    await expect(canvas.getByRole('heading')).toHaveTextContent(
      'Delivery date, January to February 2026',
    );
    const steppers = [
      ...canvasElement.querySelectorAll<HTMLElement>(
        '[data-slot=calendar-previous], [data-slot=calendar-next]',
      ),
    ];
    await expect(
      steppers.map((step) => step.closest('[data-slot=calendar-month]')),
    ).toEqual([
      ...canvasElement.querySelectorAll('[data-slot=calendar-month]'),
    ]);
    const [january, february] = canvas.getAllByRole('grid');
    const repeated = [
      ...(january?.querySelectorAll<HTMLElement>('[data-outside-month]') ?? []),
    ].find((day) => !Object.hasOwn(day.dataset, 'outsideVisibleRange'));
    await expect(repeated?.closest('td')).not.toBeVisible();
    const trailing = february?.querySelector('[data-outside-visible-range]');
    await expect(trailing?.closest('td')).toBeVisible();
  },
};

// The dropdown renders once however many months show, and keeps the years
// within maxValue.
export const MonthYearSelect: Story = {
  args: {
    heading: <CalendarMonthYearSelect visibleYears={20} />,
    maxValue: new CalendarDate(2027, 12, 31),
    visibleMonths: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole('button', { name: /month/iu }),
    ).toHaveLength(1);
    const year = canvas.getByRole('button', { name: /year/iu });
    await userEvent.click(year);
    const options = await screen.findAllByRole('option');
    await expect(options.at(-1)).toHaveTextContent('2027');
    await userEvent.click(screen.getByRole('option', { name: '2027' }));
    await waitFor(() =>
      expect(headings(canvasElement)).toContain('February 2027'),
    );
  },
};

// Buttons in the heading and footer keep their own names and handlers rather
// than taking a stepper slot.
export const SlotButtons: Story = {
  args: {
    footer: <Button onPress={onClear}>Clear</Button>,
    heading: <Button onPress={onToday}>Today</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Today' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(onToday).toHaveBeenCalledOnce();
    await expect(onClear).toHaveBeenCalledOnce();
  },
};

export const Japanese: Story = {
  globals: { locale: 'ja-JP' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading')).toHaveTextContent(
      '2026年1月',
    );
  },
};

// German weeks start on Monday, so the grid opens on Monday, December 29.
export const German: Story = {
  globals: { locale: 'de-DE' },
  play: async ({ canvasElement }) => {
    const first = canvasElement.querySelector(':scope tbody td [role=button]');
    await expect(first).toHaveAccessibleName(/Montag, 29\. Dezember 2025/u);
  },
};

export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async ({ canvasElement }) => {
    const previous = canvasElement.querySelector(
      ':scope [data-slot=calendar-previous] svg',
    );
    const next = canvasElement.querySelector(
      ':scope [data-slot=calendar-next] svg',
    );
    if (!previous || !next) throw new Error('No stepper icons');
    await expect(getComputedStyle(previous).rotate).toBe('180deg');
    await expect(getComputedStyle(next).rotate).toBe('180deg');
  },
};

// The hover layer tints a day in its own text color.
export const Hover: Story = {
  play: async ({ canvasElement }) => {
    const day = within(canvasElement).getByRole('button', {
      name: /January 20, 2026/u,
    });
    const face = day.querySelector<HTMLElement>('[data-slot=calendar-day]');
    if (!face) throw new Error('No day face');
    await setState(day, 'resting');
    const resting = getComputedStyle(face).backgroundImage;
    await expect(resting).toMatch(/rgba\(0, 0, 0, 0\) 0%/u);
    await setState(day, 'hovered');
    const hovered = getComputedStyle(face).backgroundImage;
    await expect(hovered).not.toBe(resting);
    await expect(hovered).not.toMatch(/rgba\(0, 0, 0, 0\) 0%/u);
  },
};

// In High Contrast the selected day takes the system's selection colors, and
// the hover layer stays off it.
export const ForcedColors: Story = {
  args: { defaultValue: new CalendarDate(2026, 1, 20) },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvasElement }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const day = within(canvasElement).getByRole('button', {
      name: /January 20, 2026/u,
    });
    const face = day.querySelector<HTMLElement>('[data-slot=calendar-day]');
    if (!face) throw new Error('No day face');
    await setState(day, 'hovered');
    const style = getComputedStyle(face);
    await expect(style.backgroundColor).toBe(computedColor('Highlight'));
    await expect(style.color).toBe(computedColor('HighlightText'));
    await expect(style.backgroundImage).toBe('none');
    // Opted out of forced colors, the selected day sets its own focus color.
    await expect(style.forcedColorAdjust).toBe('none');
    await expect(style.outlineColor).toBe(computedColor('Highlight'));
    // Disabled days, such as those outside the month, take GrayText, as
    // native disabled text does.
    const outside = canvasElement.querySelector(
      ':scope [data-outside-month] [data-slot=calendar-day]',
    );
    if (!outside) throw new Error('No day outside the month');
    await expect(getComputedStyle(outside).color).toBe(
      computedColor('GrayText'),
    );
  },
  tags: ['forced-colors'],
};
