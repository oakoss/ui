import type { Meta, StoryObj } from '@storybook/react-vite';

import { NumberField } from '@oakoss/ui/components/ui/inputs/number-field';
import { expect, fn, userEvent } from 'storybook/test';

import { whilePressed } from '#/press';
import { setState } from '#/state';
import { atViewportWidth } from '#/viewport';

const onChange = fn<(value: number) => void>();

const meta = {
  args: { className: 'w-48', defaultValue: 2, label: 'Quantity', onChange },
  beforeEach: () => {
    onChange.mockClear();
  },
  component: NumberField,
  title: 'Inputs/Number Field',
} satisfies Meta<typeof NumberField>;

export default meta;

type Story = StoryObj<typeof meta>;

// The steppers sit either side of the value, named by React Aria and kept
// out of the tab order; the arrow keys step instead. Digits keep their width
// as the value changes.
export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Quantity' });
    const minus = canvas.getByRole('button', { name: 'Decrease Quantity' });
    const plus = canvas.getByRole('button', { name: 'Increase Quantity' });
    await expect(minus).toHaveAttribute('tabindex', '-1');
    await expect(plus).toHaveAttribute('tabindex', '-1');
    await expect(minus.querySelector('svg')?.classList).toContain(
      'lucide-minus',
    );
    await expect(plus.querySelector('svg')?.classList).toContain('lucide-plus');
    await expect(getComputedStyle(input).fontVariantNumeric).toBe(
      'tabular-nums',
    );
    await userEvent.click(plus);
    await expect(input).toHaveValue('3');
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue('4');
    await expect(onChange.mock.calls).toEqual([[3], [4]]);
    await userEvent.tab();
    await expect(input).not.toHaveFocus();
  },
};

// Each layout puts the steppers where it says, with a divider between each
// stepper and the value.
export const Steppers: Story = {
  play: async () => {
    await checkLayouts(false);
  },
  render: () => <StepperLayouts />,
};

// Right to left, every layout mirrors.
export const SteppersRightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    await checkLayouts(true);
  },
  render: () => <StepperLayouts />,
};

// Steppers are square at every size, and 44px wide at phone widths.
export const Sizes: Story = {
  play: async ({ canvas }) => {
    for (const [name, size] of [
      ['Small', 32],
      ['Medium', 36],
      ['Large', 40],
    ] as const) {
      const box = canvas
        .getByRole('button', { name: `Increase ${name}` })
        .getBoundingClientRect();
      await expect([Math.round(box.width), Math.round(box.height)]).toEqual([
        size - 2,
        size - 2,
      ]);
    }
    await atViewportWidth(375, async () => {
      const box = canvas
        .getByRole('button', { name: 'Increase Small' })
        .getBoundingClientRect();
      await expect(Math.round(box.width)).toBe(44);
    });
  },
  render: () => (
    <div className="flex w-48 flex-col gap-4">
      <NumberField defaultValue={1} label="Small" size="sm" />
      <NumberField defaultValue={1} label="Medium" />
      <NumberField defaultValue={1} label="Large" size="lg" />
    </div>
  ),
};

// Hovering a stepper tints it and darkens its icon. The story ends hovered,
// so axe checks that state.
export const Hover: Story = {
  play: async ({ canvas }) => {
    const plus = canvas.getByRole('button', { name: 'Increase Quantity' });
    await setState(plus, 'resting');
    const resting = getComputedStyle(plus);
    const rest = [resting.backgroundImage, resting.color];
    await setState(plus, 'hovered');
    const hovered = getComputedStyle(plus);
    await expect(hovered.backgroundImage).not.toBe(rest[0]);
    await expect(hovered.color).not.toBe(rest[1]);
  },
};

// Holding a stepper keeps stepping.
export const PressAndHold: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Quantity' });
    await whilePressed(
      canvas.getByRole('button', { name: 'Increase Quantity' }),
      () => null,
    );
    if (!(input instanceof HTMLInputElement)) throw new Error('No input');
    await expect(Number(input.value)).toBeGreaterThan(4);
  },
};

// formatOptions formats the value for the locale, and the steppers name the
// field by its label.
export const Currency: Story = {
  args: {
    defaultValue: 1234.5,
    formatOptions: { currency: 'USD', style: 'currency' },
    label: 'Price',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Price' })).toHaveValue(
      '$1,234.50',
    );
    await expect(
      canvas.getByRole('button', { name: 'Increase Price' }),
    ).toBeVisible();
  },
};

// Fields are in StepperLayouts' order. Names are translated right to left,
// so the steppers are found by slot.
async function checkLayouts(isRtl: boolean) {
  const fields = [
    ...document.querySelectorAll<HTMLElement>('[data-slot=number-field]'),
  ];
  for (const [index, layout] of ['split', 'start', 'end'].entries()) {
    const field = fields[index];
    const input = field?.querySelector('input:not([type=hidden])');
    const minus = field?.querySelector<HTMLElement>(
      '[data-slot=number-field-decrement]',
    );
    const plus = field?.querySelector<HTMLElement>(
      '[data-slot=number-field-increment]',
    );
    if (!input || !minus || !plus) throw new Error(`No ${layout} field`);
    const box = input.getBoundingClientRect();
    const isBefore = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return isRtl ? rect.left >= box.right - 1 : rect.right <= box.left + 1;
    };
    const sides: [boolean, boolean] = [isBefore(minus), isBefore(plus)];
    await expect(sides).toEqual(
      { end: [false, false], split: [true, false], start: [true, true] }[
        layout
      ],
    );
    if (layout !== 'split') {
      const [first, second] = isRtl ? [plus, minus] : [minus, plus];
      await expect(first.getBoundingClientRect().right).toBeLessThanOrEqual(
        second.getBoundingClientRect().left + 1,
      );
    }
    for (const [stepper, isStart] of [
      [minus, sides[0]],
      [plus, sides[1]],
    ] as const) {
      const style = getComputedStyle(stepper);
      await expect([
        style.borderInlineStartWidth,
        style.borderInlineEndWidth,
      ]).toEqual(isStart ? ['0px', '1px'] : ['1px', '0px']);
    }
  }
  await expect(
    fields[3]?.querySelector('[data-slot^=number-field-]'),
  ).toBeNull();
}

function StepperLayouts() {
  return (
    <div className="flex w-48 flex-col gap-4">
      <NumberField defaultValue={1} label="Split" />
      <NumberField defaultValue={1} label="Start" steppers="start" />
      <NumberField defaultValue={1} label="End" steppers="end" />
      <NumberField defaultValue={1} label="None" steppers="none" />
    </div>
  );
}
