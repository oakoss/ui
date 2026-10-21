import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@oakoss/ui/components/ui/inputs/input-otp';
import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, fn, screen, userEvent } from 'storybook/test';

const meta = {
  args: {
    label: 'Verification code',
    onComplete: fn<(value: string) => void>(),
  },
  component: InputOTP,
  title: 'Inputs/Input OTP',
} satisfies Meta<typeof InputOTP>;

export default meta;

type Story = StoryObj<typeof meta>;

function input() {
  return screen.getByRole('textbox', { name: 'Verification code' });
}

function slots() {
  return [
    ...document.querySelectorAll<HTMLElement>('[data-slot=input-otp-slot]'),
  ];
}

function slotText() {
  return slots().map((slot) => slot.textContent);
}

// One real input carries the name, the one-time-code hint and the numeric
// keyboard; the slots are a picture of its value, hidden from assistive tech.
export const Default: Story = {
  play: async ({ args }) => {
    const field = input();
    await expect(field).toHaveAttribute('autocomplete', 'one-time-code');
    await expect(field).toHaveAttribute('inputmode', 'numeric');
    await expect(field).toHaveAttribute('maxlength', '6');
    await expect(slots()).toHaveLength(6);
    await expect(slots()[0]?.closest('[aria-hidden=true]')).not.toBeNull();
    await userEvent.type(field, '123456');
    await expect(field).toHaveValue('123456');
    await expect(slotText()).toEqual(['1', '2', '3', '4', '5', '6']);
    await expect(args.onComplete).toHaveBeenCalledTimes(1);
    await expect(args.onComplete).toHaveBeenCalledWith('123456');
  },
};

export const WithDescription: Story = {
  args: { description: 'Enter the 6-digit code we sent to your phone.' },
  play: async () => {
    await expect(input()).toHaveAccessibleDescription(
      'Enter the 6-digit code we sent to your phone.',
    );
  },
};

// groupSize splits the slots, with a separator between groups.
export const Groups: Story = {
  args: { groupSize: 3 },
  play: async () => {
    const groups = document.querySelectorAll('[data-slot=input-otp-group]');
    await expect(groups).toHaveLength(2);
    await expect(
      document.querySelectorAll('[data-slot=input-otp-separator]'),
    ).toHaveLength(1);
  },
};

// Slots placed by hand, as shadcn composes them.
export const Composition: Story = {
  args: { length: 4 },
  play: async () => {
    await userEvent.type(input(), '4321');
    await expect(slotText()).toEqual(['4', '3', '2', '1']);
  },
  render: ({ label, length }) => (
    <InputOTP label={label} length={length}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  ),
};

// The default takes digits only.
export const DigitsOnly: Story = {
  play: async () => {
    await userEvent.type(input(), 'a1b2');
    await expect(input()).toHaveValue('12');
  },
};

// Letter codes bring up a text keyboard and are kept in capitals.
export const Alphanumeric: Story = {
  args: { characters: 'alphanumeric' },
  play: async () => {
    await expect(input()).toHaveAttribute('inputmode', 'text');
    await userEvent.type(input(), 'ab12');
    await expect(input()).toHaveValue('AB12');
  },
};

// A starting letter code shows in capitals too.
export const AlphanumericDefault: Story = {
  args: { characters: 'alphanumeric', defaultValue: 'ab12' },
  play: async () => {
    await expect(input()).toHaveValue('AB12');
  },
};

// Pasted codes lose the spaces and dashes they're written with.
export const Paste: Story = {
  play: async () => {
    input().focus();
    await userEvent.paste('123 456');
    await expect(input()).toHaveValue('123456');
  },
};

export const PasteAlphanumeric: Story = {
  args: { characters: 'alphanumeric' },
  play: async () => {
    input().focus();
    await userEvent.paste('ab-12-cd');
    await expect(input()).toHaveValue('AB12CD');
  },
};

// Empty slots show the placeholder's characters.
export const Placeholder: Story = {
  args: { placeholder: '○○○○○○' },
  play: async () => {
    await expect(slotText()).toEqual(['○', '○', '○', '○', '○', '○']);
    await userEvent.type(input(), '1');
    await expect(slotText()[0]).toBe('1');
  },
};

// Slots match the control heights; on touch they grow to 44px.
export const Sizes: Story = {
  play: async () => {
    const heights = ['Small', 'Medium', 'Large'].map(
      (name) =>
        screen
          .getByRole('textbox', { name })
          .closest('[data-slot=input-otp]')
          ?.querySelector('[data-slot=input-otp-slot]')
          ?.getBoundingClientRect().height,
    );
    await expect(heights).toEqual([32, 36, 40]);
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <InputOTP label="Small" size="sm" />
      <InputOTP label="Medium" />
      <InputOTP label="Large" size="lg" />
    </div>
  ),
};

// Codes read left to right in every language.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    await userEvent.type(input(), '12');
    const [first, second] = slots();
    await expect(first?.textContent).toBe('1');
    await expect(first?.getBoundingClientRect().left).toBeLessThan(
      second?.getBoundingClientRect().left ?? 0,
    );
  },
};

// A ref reaches the real input, as shadcn's does, so a form can focus it.
const inputRef = createRef<HTMLInputElement>();

export const Ref: Story = {
  args: { ref: inputRef },
  play: async () => {
    await expect(inputRef.current).toBe(input());
    inputRef.current?.focus();
    await expect(input()).toHaveFocus();
  },
};

// A server renders the real input with its hints.
export const FirstFrame: Story = {
  play: async () => {
    const html = renderToString(<InputOTP label="Verification code" />);
    await expect(html).toContain('autoComplete="one-time-code"');
    await expect(html).toContain('inputMode="numeric"');
  },
};
