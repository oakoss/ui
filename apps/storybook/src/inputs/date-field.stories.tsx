import type { Meta, StoryObj } from '@storybook/react-vite';

import { type CalendarDate, parseDate } from '@internationalized/date';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  DateField,
  DateFieldGroup,
  DateInput,
} from '@oakoss/ui/components/ui/inputs/date-field';
import { FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { expect, userEvent } from 'storybook/test';

import { tokenColor } from '#/helpers/color';

const SingleDateField = DateField<CalendarDate>;

const meta = {
  args: { className: 'w-72', label: 'Due date' },
  component: SingleDateField,
  title: 'Inputs/Date Field',
} satisfies Meta<typeof SingleDateField>;

export default meta;

type Story = StoryObj<typeof meta>;

// One group named by the label, a spinbutton per unit, and a presentation-only
// border, so the group isn't announced twice. Digits keep one width.
export const Default: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Due date' });
    await expect(group).toHaveAttribute('data-slot', 'date-input');
    await expect(group.closest('[data-slot=date-field]')).not.toBeNull();
    await expect(canvas.getAllByRole('group')).toHaveLength(1);
    const border = group.closest('[data-slot=input-group]');
    await expect(border).toHaveAttribute('role', 'presentation');
    await expect(border).not.toHaveAttribute('aria-labelledby');
    const month = canvas.getByRole('spinbutton', { name: /^month, Due date/u });
    await userEvent.click(month);
    await userEvent.keyboard('03142026');
    await expect(group).toHaveTextContent('3/14/2026');
    await expect(getComputedStyle(month).fontVariantNumeric).toBe(
      'tabular-nums',
    );
    const separator = group.querySelector('[data-type=literal]');
    if (!separator) throw new Error('No separator');
    await expect(getComputedStyle(separator).paddingInlineStart).toBe('0px');
  },
};

// Unfilled segments are muted until typed; the field reads at full color
// once it has a value.
export const Placeholder: Story = {
  play: async ({ canvas }) => {
    const month = canvas.getByRole('spinbutton', { name: /^month/u });
    await expect(month).toHaveAttribute('data-placeholder', 'true');
    await expect(getComputedStyle(month).color).toBe(
      tokenColor('--color-muted-foreground'),
    );
    await userEvent.click(month);
    await userEvent.keyboard('3');
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    await expect(month).not.toHaveAttribute('data-placeholder');
    await expect(getComputedStyle(month).color).toBe(
      tokenColor('--color-foreground'),
    );
  },
};

// The field shares the control heights.
export const Sizes: Story = {
  play: async ({ canvas }) => {
    const heights = ['Small', 'Medium', 'Large'].map(
      (name) =>
        canvas
          .getByRole('group', { name })
          .closest('[data-slot=input-group]')
          ?.getBoundingClientRect().height,
    );
    await expect(heights).toEqual([32, 36, 40]);
  },
  render: () => (
    <div className="flex w-72 flex-col gap-4">
      <SingleDateField label="Small" size="sm" />
      <SingleDateField label="Medium" />
      <SingleDateField label="Large" size="lg" />
    </div>
  ),
};

// Text in start or end describes the field. Clicking an addon focuses the
// first segment, and a button there keeps its own name and press.
export const Decorations: Story = {
  args: { end: <Button aria-label="Clear">×</Button>, start: 'Due' },
  play: async ({ canvas }) => {
    const month = canvas.getByRole('spinbutton', { name: /^month/u });
    await expect(month).toHaveAccessibleDescription('Due');
    const input = canvas.getByRole('group', { name: 'Due date' });
    await expect(getComputedStyle(input).paddingInlineStart).toBe('8px');
    await expect(getComputedStyle(input).paddingInlineEnd).toBe('8px');
    await userEvent.click(canvas.getByText('Due'));
    await expect(month).toHaveFocus();
    await expect(canvas.getByRole('button', { name: 'Clear' })).toBeVisible();
  },
};

// The form gets the ISO date from a hidden input named by `name`.
export const FormValue: Story = {
  args: { defaultValue: parseDate('2026-03-14'), name: 'due' },
  play: async ({ canvasElement }) => {
    const form = canvasElement.querySelector('form');
    if (!form) throw new Error('No form');
    await expect(new FormData(form).get('due')).toBe('2026-03-14');
  },
  render: (args) => (
    <form>
      <SingleDateField {...args} />
    </form>
  ),
};

// Segment order and digits follow the locale.
export const RightToLeft: Story = {
  args: { defaultValue: parseDate('2026-03-14') },
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Due date' });
    await expect(group).toHaveTextContent('١٤‏/٣‏/٢٠٢٦');
  },
};

// A non-Gregorian calendar shows its own era and years: 2026 is Reiwa 8.
export const JapaneseCalendar: Story = {
  args: { defaultValue: parseDate('2026-03-14') },
  globals: { locale: 'ja-JP-u-ca-japanese' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('group', { name: 'Due date' }),
    ).toHaveTextContent('R8/3/14');
  },
};

// Segments that outgrow a narrow field scroll inside it rather than
// overflowing it, with no scrollbar.
export const NarrowField: Story = {
  args: { className: 'w-20', defaultValue: parseDate('2026-03-14') },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Due date' });
    await expect(group.scrollWidth).toBeGreaterThan(group.clientWidth);
    await expect(getComputedStyle(group).overflowX).toBe('auto');
    await expect(getComputedStyle(group).scrollbarWidth).toBe('none');
  },
};

// Children replace the layout, built from the same parts, which take a
// className.
export const Composition: Story = {
  args: { children: undefined, label: undefined },
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Due date' });
    await expect(canvas.getAllByRole('group')).toHaveLength(1);
    await expect(getComputedStyle(group).paddingInlineStart).toBe('24px');
  },
  render: () => (
    <SingleDateField className="w-72">
      <FieldLabel>Due date</FieldLabel>
      <DateFieldGroup>
        <DateInput className="ps-6" />
      </DateFieldGroup>
    </SingleDateField>
  ),
};

// The utilities behind these values appear only in packages/ui, so this fails
// if Tailwind stops scanning the package. Keep their class names out of
// stories, comments included.
export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Due date' });
    await expect(getComputedStyle(group).overflowX).toBe('auto');
    await expect(getComputedStyle(group).cursor).toBe('text');
  },
};
