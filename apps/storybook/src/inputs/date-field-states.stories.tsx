import type { Meta, StoryObj } from '@storybook/react-vite';

import { type CalendarDate, parseDate } from '@internationalized/date';
import { DateField } from '@oakoss/ui/components/ui/inputs/date-field';
import { expect, userEvent } from 'storybook/test';

import { computedColor, tokenColor } from '#/helpers/color';

const SingleDateField = DateField<CalendarDate>;

const meta = {
  args: { className: 'w-72', label: 'Due date' },
  component: SingleDateField,
  title: 'Inputs/Date Field/States',
} satisfies Meta<typeof SingleDateField>;

export default meta;

type Story = StoryObj<typeof meta>;

// Focus inside the segments outlines the whole field, as a focused Input's
// group does, and fills the focused segment. An invalid field's focused
// segment fills red instead.
export const Focus: Story = {
  args: { defaultValue: parseDate('2026-03-14') },
  play: async ({ canvas }) => {
    const day = canvas.getByRole('spinbutton', { name: /^day, Due date/u });
    const border = day.closest<HTMLElement>('[data-slot=input-group]');
    if (!border) throw new Error('No input group');
    await expect(getComputedStyle(border).outlineStyle).toBe('none');
    await userEvent.click(day);
    for (const animation of border.getAnimations()) animation.finish();
    await expect(getComputedStyle(border).outlineStyle).toBe('solid');
    await expect(getComputedStyle(border).outlineColor).toBe(
      computedColor('var(--ring)', border),
    );
    await expect(getComputedStyle(day).backgroundColor).toBe(
      tokenColor('--color-accent'),
    );
    await expect(getComputedStyle(day).color).toBe(
      tokenColor('--color-accent-foreground'),
    );
    await expect(getComputedStyle(day).outlineStyle).toBe('none');
    const bad = canvas.getByRole('spinbutton', { name: /^day, Start/u });
    await userEvent.click(bad);
    await expect(getComputedStyle(bad).backgroundColor).toBe(
      tokenColor('--color-destructive'),
    );
    await expect(getComputedStyle(bad).color).toBe(
      tokenColor('--color-destructive-foreground'),
    );
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <SingleDateField {...args} />
      <SingleDateField
        className="w-72"
        defaultValue={parseDate('2026-03-14')}
        isInvalid
        label="Start"
      />
    </div>
  ),
};

// The error joins the description, and the border turns to the 3:1 invalid
// token.
export const Invalid: Story = {
  args: {
    description: 'Within the next year.',
    errorMessage: 'Pick a later date.',
    isInvalid: true,
  },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Due date' });
    await expect(
      canvas.getByRole('spinbutton', { name: /^month/u }),
    ).toHaveAccessibleDescription('Within the next year. Pick a later date.');
    const border = group.closest<HTMLElement>('[data-slot=input-group]');
    if (!border) throw new Error('No input group');
    await expect(getComputedStyle(border).borderTopColor).toBe(
      tokenColor('--color-destructive-text'),
    );
  },
};

// With aria validation, minValue marks the field invalid as soon as the value
// breaks it, with React Aria's own message when no errorMessage is given.
export const MinValue: Story = {
  args: {
    defaultValue: parseDate('2026-01-01'),
    minValue: parseDate('2026-03-01'),
    validationBehavior: 'aria',
  },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Due date' });
    await expect(group).toHaveAttribute('data-invalid', 'true');
    await expect(canvas.getByText(/3\/1\/2026 or later/u)).toBeVisible();
  },
};

// The field fades as a disabled TextField does.
export const Disabled: Story = {
  args: { defaultValue: parseDate('2026-03-14'), isDisabled: true },
  play: async ({ canvas }) => {
    const month = canvas.getByRole('spinbutton', { name: /^month/u });
    await expect(month).toHaveAttribute('aria-disabled', 'true');
    const border = month.closest<HTMLElement>('[data-slot=input-group]');
    if (!border) throw new Error('No input group');
    await expect(getComputedStyle(border).opacity).toBe('0.5');
    await expect(
      getComputedStyle(canvas.getByRole('group', { name: 'Due date' })).cursor,
    ).toBe('default');
  },
};

export const Required: Story = {
  args: { isRequired: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('*')).toHaveAttribute('aria-hidden', 'true');
    await expect(
      canvas.getByRole('spinbutton', { name: /^month/u }),
    ).toHaveAttribute('aria-required', 'true');
  },
};

// Windows High Contrast fills the focused segment with Highlight, opted out
// of the backplate that would cover its text. A disabled field paints its
// segments and addons GrayText at full opacity, like native disabled text.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const day = canvas.getByRole('spinbutton', { name: /^day, Due date/u });
    await userEvent.click(day);
    const style = getComputedStyle(day);
    await expect(style.backgroundColor).toBe(computedColor('Highlight'));
    await expect(style.color).toBe(computedColor('HighlightText'));
    await expect(style.forcedColorAdjust).toBe('none');
    const off = canvas.getByRole('spinbutton', { name: /^day, Closed/u });
    await expect(getComputedStyle(off).color).toBe(computedColor('GrayText'));
    const border = off.closest<HTMLElement>('[data-slot=input-group]');
    if (!border) throw new Error('No input group');
    await expect(getComputedStyle(border).opacity).toBe('1');
    await expect(getComputedStyle(canvas.getByText('Due')).color).toBe(
      computedColor('GrayText'),
    );
  },
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <SingleDateField
        defaultValue={parseDate('2026-03-14')}
        label="Due date"
      />
      <SingleDateField
        defaultValue={parseDate('2026-03-14')}
        isDisabled
        label="Closed"
        start="Due"
      />
    </div>
  ),
  tags: ['forced-colors'],
};
