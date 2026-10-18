import type { Meta, StoryObj } from '@storybook/react-vite';

import { type CalendarDate, parseDate } from '@internationalized/date';
import { DateRangePicker } from '@oakoss/ui/components/ui/inputs/date-range-picker';
import { expect, userEvent } from 'storybook/test';

import { computedColor, tokenColor } from '#/helpers/color';

const DayRangePicker = DateRangePicker<CalendarDate>;

const meta = {
  args: {
    className: 'w-80',
    defaultValue: {
      end: parseDate('2026-03-16'),
      start: parseDate('2026-03-14'),
    },
    label: 'Stay',
  },
  component: DayRangePicker,
  title: 'Inputs/Date Range Picker/States',
} satisfies Meta<typeof DayRangePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

const field = { name: 'Stay' };

// Focus in either input outlines the whole field, as in a single picker.
export const Focus: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', field);
    await expect(getComputedStyle(group).outlineStyle).toBe('none');
    const [, endMonth] = canvas.getAllByRole('spinbutton', { name: /^month/u });
    if (!endMonth) throw new Error('No end input');
    await userEvent.click(endMonth);
    for (const animation of group.getAnimations()) animation.finish();
    await expect(getComputedStyle(group).outlineStyle).toBe('solid');
    await expect(getComputedStyle(group).outlineColor).toBe(
      computedColor('var(--ring)', group),
    );
  },
};

// Clicking a text decoration focuses the start input's first segment, and
// the inputs keep their gap from it.
export const AddonClick: Story = {
  args: { start: 'From' },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByText('From'));
    const [startMonth] = canvas.getAllByRole('spinbutton', { name: /^month/u });
    await expect(startMonth).toHaveFocus();
    const inputs = canvas
      .getByRole('group', field)
      .querySelector<HTMLElement>('[data-slot=date-range-input]');
    if (!inputs) throw new Error('No range input');
    await expect(getComputedStyle(inputs).paddingInlineStart).toBe('8px');
  },
};

// The two inputs scroll together in a narrow field, so the trigger stays
// inside the border.
export const Narrow: Story = {
  args: { className: 'w-44' },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', field);
    const trigger = canvas.getByRole('button', { name: /^Calendar/u });
    const [box, button] = [group, trigger].map((el) =>
      el.getBoundingClientRect(),
    );
    await expect(button?.right ?? 0).toBeLessThanOrEqual(box?.right ?? 0);
    const inputs = group.querySelector<HTMLElement>(
      '[data-slot=date-range-input]',
    );
    if (!inputs) throw new Error('No range input');
    inputs.scrollLeft = inputs.scrollWidth;
    await expect(inputs.scrollLeft).toBeGreaterThan(0);
    await expect(group.getBoundingClientRect().height).toBe(36);
  },
};

// The border turns to the 3:1 invalid token, and the error joins both
// inputs' description.
export const Invalid: Story = {
  args: { errorMessage: 'Pick a later checkout.', isInvalid: true },
  play: async ({ canvas }) => {
    await expect(
      getComputedStyle(canvas.getByRole('group', field)).borderTopColor,
    ).toBe(tokenColor('--color-destructive-text'));
    const months = canvas.getAllByRole('spinbutton', { name: /^month/u });
    for (const month of months) {
      await expect(month).toHaveAccessibleDescription(
        /Pick a later checkout\.$/u,
      );
    }
  },
};

// A disabled picker disables its trigger and fades like a disabled field.
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: /^Calendar/u }),
    ).toBeDisabled();
    await expect(
      getComputedStyle(canvas.getByRole('group', field)).opacity,
    ).toBe('0.5');
  },
};

// Windows High Contrast keeps a disabled picker at full opacity and paints
// its decorations GrayText, as a disabled single picker does.
export const ForcedColorsDisabled: Story = {
  args: { isDisabled: true, start: 'From' },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    await expect(
      getComputedStyle(canvas.getByRole('group', field)).opacity,
    ).toBe('1');
    await expect(getComputedStyle(canvas.getByText('From')).color).toBe(
      computedColor('GrayText'),
    );
  },
  tags: ['forced-colors'],
};
