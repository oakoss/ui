import type { Meta, StoryObj } from '@storybook/react-vite';

import { type CalendarDate, parseDate } from '@internationalized/date';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { DatePicker } from '@oakoss/ui/components/ui/inputs/date-picker';
import { expect, fn, screen, userEvent } from 'storybook/test';

import { tokenColor } from '#/helpers/color';
import { freezeDate } from '#/helpers/date';
import { settled } from '#/overlays/overlay-test';

const SingleDatePicker = DatePicker<CalendarDate>;
const onReset = fn<() => void>();

const meta = {
  args: {
    className: 'w-64',
    defaultValue: parseDate('2026-03-14'),
    label: 'Due date',
  },
  beforeEach: () => {
    onReset.mockClear();
    return freezeDate(new Date(2026, 2, 10, 12));
  },
  component: SingleDatePicker,
  title: 'Inputs/Date Picker/States',
} satisfies Meta<typeof SingleDatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

// The picker's group takes React Aria's invalid state, so its border turns
// to the 3:1 invalid token, and the error joins the description.
export const Invalid: Story = {
  args: { errorMessage: 'Pick a weekday.', isInvalid: true },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Due date' });
    await expect(getComputedStyle(group).borderTopColor).toBe(
      tokenColor('--color-destructive-text'),
    );
    await expect(
      canvas.getByRole('spinbutton', { name: /^month/u }),
    ).toHaveAccessibleDescription(/Pick a weekday\.$/u);
  },
};

// A disabled picker disables its trigger and fades like a disabled field.
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: /^Calendar/u }),
    ).toBeDisabled();
    const group = canvas.getByRole('group', { name: 'Due date' });
    await expect(getComputedStyle(group).opacity).toBe('0.5');
  },
};

// isDateUnavailable strikes days through in the popover and marks a typed
// one invalid.
export const UnavailableDates: Story = {
  args: {
    isDateUnavailable: (date) => date.day === 20,
    validationBehavior: 'aria',
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Calendar/u }));
    await settled(await screen.findByRole('dialog'));
    await expect(
      screen.getByRole('button', { name: /March 20,/u }),
    ).toHaveAttribute('aria-disabled', 'true');
  },
};

// The trigger sits at the end edge in a right-to-left locale.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Due date' });
    const trigger = canvas.getByRole('button', { name: /.+/u });
    const [field, button] = [group, trigger].map((el) =>
      el.getBoundingClientRect(),
    );
    await expect(button?.left ?? 0).toBeLessThan(
      (field?.left ?? 0) + (field?.width ?? 0) / 2,
    );
  },
};

// A Button in start keeps its own press rather than the trigger's.
export const StartButton: Story = {
  args: {
    start: (
      <Button aria-label="Reset" onPress={onReset}>
        r
      </Button>
    ),
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(onReset).toHaveBeenCalledOnce();
    await expect(screen.queryByRole('dialog')).toBeNull();
  },
};

// React Aria keeps the trigger pressed while the calendar is open, which
// mustn't hold the ghost button's pressed tint.
export const TriggerWhileOpen: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: /^Calendar/u });
    await userEvent.click(trigger);
    await settled(await screen.findByRole('dialog'));
    trigger.dataset.pressed = 'true';
    for (const animation of trigger.getAnimations()) animation.finish();
    await expect(getComputedStyle(trigger).backgroundImage).not.toMatch(
      /rgba\(\d+, \d+, \d+, 0\.1\d*\)/u,
    );
    await expect(getComputedStyle(trigger).backgroundImage).toMatch(
      /^linear-gradient\(.*rgba\(0, 0, 0, 0\) 0%, rgba\(0, 0, 0, 0\) 100%\)$/u,
    );
  },
};

// calendarProps reach the calendar beyond the heading and footer.
export const CalendarLoading: Story = {
  args: { calendarProps: { isLoading: true, loadingLabel: 'Fetching' } },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: /^Calendar/u }));
    const dialog = await screen.findByRole('dialog');
    await settled(dialog);
    await expect(dialog.querySelector('[aria-busy=true]')).not.toBeNull();
    await expect(
      screen.getByRole('progressbar', { name: 'Fetching' }),
    ).toBeVisible();
  },
};

export const Sizes: Story = {
  play: async ({ canvas }) => {
    const heights = ['Small', 'Large'].map(
      (name) =>
        canvas.getByRole('group', { name }).getBoundingClientRect().height,
    );
    await expect(heights).toEqual([32, 40]);
  },
  render: () => (
    <div className="flex w-64 flex-col gap-4">
      <SingleDatePicker label="Small" size="sm" />
      <SingleDatePicker label="Large" size="lg" />
    </div>
  ),
};
