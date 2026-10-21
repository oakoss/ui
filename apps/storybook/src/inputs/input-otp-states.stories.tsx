import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { InputOTP } from '@oakoss/ui/components/ui/inputs/input-otp';
import { useState } from 'react';
import { Form } from 'react-aria-components';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { computedColor, tokenColor } from '#/helpers/color';
import { valueUnderMedia } from '#/helpers/media';
import { withReducedMotion } from '#/helpers/motion';

const meta = {
  args: { label: 'Verification code' },
  component: InputOTP,
  title: 'Inputs/Input OTP/States',
} satisfies Meta<typeof InputOTP>;

export default meta;

type Story = StoryObj<typeof meta>;

function firstSlot() {
  const slot = document.querySelector('[data-slot=input-otp-slot]');
  if (!(slot instanceof HTMLElement)) throw new Error('No slot');
  return slot;
}

function input() {
  return screen.getByRole('textbox', { name: 'Verification code' });
}

// The slot taking the next character draws the focus outline.
export const Focused: Story = {
  play: async () => {
    await userEvent.click(input());
    await expect(firstSlot()).toHaveAttribute('data-active', 'true');
    await expect(getComputedStyle(firstSlot()).outlineStyle).toBe('solid');
  },
};

function active() {
  return [
    ...document.querySelectorAll<HTMLElement>('[data-slot=input-otp-slot]'),
  ].findIndex((slot) => slot.dataset.active !== undefined);
}

// The input's own keys move the active slot.
export const Keys: Story = {
  play: async () => {
    await userEvent.type(input(), '123');
    await expect(active()).toBe(3);
    await userEvent.keyboard('{Home}');
    await expect(active()).toBe(0);
    await userEvent.keyboard('{ArrowRight}');
    await expect(active()).toBe(1);
    await userEvent.keyboard('{End}');
    await expect(active()).toBe(3);
  },
};

// The caret blinks, and holds still under reduced motion.
export const Caret: Story = {
  play: async () => {
    input().focus();
    await waitFor(() =>
      expect(
        getComputedStyle(firstSlot().lastElementChild ?? firstSlot(), ':after')
          .animationName,
      ).toBe('caret-blink'),
    );
    await withReducedMotion(async () => {
      const caret = firstSlot().lastElementChild ?? firstSlot();
      await expect(getComputedStyle(caret, ':after').animationName).toBe(
        'none',
      );
    });
  },
};

// The description and error describe the input, which reports itself
// invalid, and the slots take the invalid border.
export const Invalid: Story = {
  args: {
    description: 'Enter the 6-digit code we sent.',
    errorMessage: 'That code has expired.',
    isInvalid: true,
  },
  play: async () => {
    await expect(input()).toHaveAttribute('aria-invalid', 'true');
    await expect(input()).toHaveAccessibleDescription(
      'Enter the 6-digit code we sent. That code has expired.',
    );
    await expect(getComputedStyle(firstSlot()).borderTopColor).toBe(
      tokenColor('--color-destructive-text'),
    );
  },
};

export const Disabled: Story = {
  args: { defaultValue: '12', isDisabled: true },
  play: async () => {
    await expect(input()).toBeDisabled();
    await expect(getComputedStyle(firstSlot()).opacity).toBe('0.5');
  },
};

// A read-only code takes neither typing nor a paste.
export const ReadOnly: Story = {
  args: { defaultValue: '12', isReadOnly: true },
  play: async () => {
    await userEvent.type(input(), '3');
    await expect(input()).toHaveValue('12');
    await userEvent.paste('987 654');
    await expect(input()).toHaveValue('12');
  },
};

// A nonce reaches the style tag input-otp adds once per page, for sites
// with a Content Security Policy. Chrome hides the attribute but keeps the
// property.
export const Nonce: Story = {
  args: { nonce: 'story-nonce' },
  beforeEach: () => {
    document.querySelector('#input-otp-style')?.remove();
  },
  play: async () => {
    await waitFor(() =>
      expect(
        document.querySelector<HTMLStyleElement>('#input-otp-style')?.nonce,
      ).toBe('story-nonce'),
    );
  },
};

// Slots grow to 44px where the pointer is coarse.
export const TouchTarget: Story = {
  play: async () => {
    await expect(
      valueUnderMedia(firstSlot(), '(any-pointer: coarse)', 'width'),
    ).toBe('calc(var(--spacing) * 11)');
  },
};

// In a form, the code submits under its name, a required field blocks an
// empty submit, and a reset clears it.
function FormDemo() {
  const [submitted, setSubmitted] = useState<string>();
  return (
    <Form
      className="flex flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const code = new FormData(event.currentTarget).get('code');
        setSubmitted(typeof code === 'string' ? code : '');
      }}
    >
      <InputOTP isRequired label="Verification code" name="code" />
      <div className="flex gap-2">
        <Button type="submit">Verify</Button>
        <Button type="reset" variant="outline">
          Reset
        </Button>
      </div>
      <output>{submitted ?? ''}</output>
    </Form>
  );
}

export const InAForm: Story = {
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await expect(input()).toHaveAttribute('aria-invalid', 'true');
    await expect(screen.getByRole('status')).toHaveTextContent('');
    // A pasted code clears the error when the field loses focus, as a
    // typed one does.
    input().focus();
    await userEvent.paste('123 456');
    await expect(input()).toHaveAttribute('aria-invalid', 'true');
    await userEvent.tab();
    await waitFor(() => expect(input()).not.toHaveAttribute('aria-invalid'));
    await userEvent.click(screen.getByRole('button', { name: 'Verify' }));
    await expect(screen.getByRole('status')).toHaveTextContent('123456');
    await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(input()).toHaveValue(''));
    await expect(firstSlot().textContent).toBe('');
  },
  render: () => <FormDemo />,
};

// A paste the pattern rejects changes nothing, so an untouched required
// field doesn't turn invalid, before or after it loses focus.
export const RejectedPaste: Story = {
  args: { isRequired: true },
  play: async () => {
    input().focus();
    await userEvent.paste('abcdef');
    await expect(input()).toHaveValue('');
    await userEvent.tab();
    await expect(input()).not.toHaveAttribute('aria-invalid');
  },
};

// Forced colors keep the slot borders, gray a disabled field like a native
// one, and keep the focus outline.
export const ForcedColors: Story = {
  args: { defaultValue: '12', isDisabled: true },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    // The slot's color transition can still be running at first paint.
    for (const animation of firstSlot().getAnimations()) animation.finish();
    const style = getComputedStyle(firstSlot());
    await expect(style.borderTopStyle).toBe('solid');
    await expect(style.color).toBe(computedColor('GrayText'));
    await expect(style.opacity).toBe('1');
  },
  tags: ['forced-colors'],
};

export const ForcedColorsFocus: Story = {
  play: async () => {
    await userEvent.click(input());
    await expect(getComputedStyle(firstSlot()).outlineStyle).toBe('solid');
    await expect(getComputedStyle(firstSlot()).outlineColor).not.toBe(
      'rgba(0, 0, 0, 0)',
    );
  },
  tags: ['forced-colors'],
};
