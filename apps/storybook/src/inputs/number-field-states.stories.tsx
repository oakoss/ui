import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  FieldDescription,
  FieldLabel,
} from '@oakoss/ui/components/ui/inputs/field';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import { InputGroup } from '@oakoss/ui/components/ui/inputs/input-group';
import {
  NumberField,
  NumberFieldStepper,
} from '@oakoss/ui/components/ui/inputs/number-field';
import { expect, userEvent } from 'storybook/test';

import { part } from '#/parts';

const meta = {
  args: { className: 'w-48', defaultValue: 2, label: 'Quantity' },
  component: NumberField,
  title: 'Inputs/Number Field/States',
} satisfies Meta<typeof NumberField>;

export default meta;

type Story = StoryObj<typeof meta>;

// A stepper at a bound fades and can't be pressed; the other still works,
// and the field itself doesn't fade.
export const Bounds: Story = {
  args: { defaultValue: 10, maxValue: 10, minValue: 0 },
  play: async ({ canvas }) => {
    const plus = canvas.getByRole('button', { name: 'Increase Quantity' });
    const minus = canvas.getByRole('button', { name: 'Decrease Quantity' });
    await expect(plus).toBeDisabled();
    await expect(getComputedStyle(plus).opacity).toBe('0.5');
    await expect(minus).toBeEnabled();
    await expect(getComputedStyle(minus).opacity).toBe('1');
    await expect(getComputedStyle(part('input-group')).opacity).toBe('1');
  },
};

// A disabled field fades once, at the group, not again at each stepper.
export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    const plus = canvas.getByRole('button', { name: 'Increase Quantity' });
    await expect(
      canvas.getByRole('textbox', { name: 'Quantity' }),
    ).toBeDisabled();
    await expect(plus).toBeDisabled();
    await expect(getComputedStyle(part('input-group')).opacity).toBe('0.5');
    await expect(getComputedStyle(plus).opacity).toBe('1');
  },
};

// The description and error describe the input, which reports itself
// invalid.
export const Invalid: Story = {
  args: {
    description: 'Up to 10 per order.',
    errorMessage: 'Enter 10 or fewer.',
    isInvalid: true,
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Quantity' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(
      'Up to 10 per order. Enter 10 or fewer.',
    );
  },
};

// Children replace the layout. NumberFieldStepper brings the steppers'
// look and behavior to it, so one at a bound fades alone, and by default
// its divider faces the input: decrement before the value, increment after.
export const Composed: Story = {
  args: { defaultValue: 10, maxValue: 10 },
  play: async ({ canvas }) => {
    const plus = canvas.getByRole('button', { name: 'Increase Quantity' });
    const minus = canvas.getByRole('button', { name: 'Decrease Quantity' });
    await expect(plus).toBeDisabled();
    await expect(getComputedStyle(part('input-group')).opacity).toBe('1');
    await expect(dividers(minus)).toEqual(['0px', '1px']);
    await expect(dividers(plus)).toEqual(['1px', '0px']);
    await userEvent.click(minus);
    await expect(canvas.getByRole('textbox')).toHaveValue('9');
    await expect(
      canvas.getByRole('textbox', { name: 'Quantity' }),
    ).toHaveAccessibleDescription('Per order.');
  },
  render: ({ className, defaultValue, maxValue }) => (
    <NumberField
      className={className}
      defaultValue={defaultValue}
      maxValue={maxValue}
    >
      <FieldLabel>Quantity</FieldLabel>
      <InputGroup className="overflow-hidden">
        <NumberFieldStepper slot="decrement" />
        <Input />
        <NumberFieldStepper slot="increment" />
      </InputGroup>
      <FieldDescription>Per order.</FieldDescription>
    </NumberField>
  ),
};

// Forced colors gray a stepper at a bound like a native disabled button.
export const ForcedColors: Story = {
  args: { defaultValue: 10, maxValue: 10 },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const plus = canvas.getByRole('button', { name: 'Increase Quantity' });
    const native = getComputedStyle(canvas.getByText('Native'));
    await expect(getComputedStyle(plus).color).toBe(native.color);
    await expect(getComputedStyle(plus).opacity).toBe('1');
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <NumberField {...args} />
      <button disabled type="button">
        Native
      </button>
    </div>
  ),
  tags: ['forced-colors'],
};

function dividers(element: HTMLElement) {
  const style = getComputedStyle(element);
  return [style.borderInlineStartWidth, style.borderInlineEndWidth];
}
