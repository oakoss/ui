import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
import { TextFieldContext } from 'react-aria-components';
import { expect, userEvent } from 'storybook/test';

const meta = {
  args: { label: 'Email', placeholder: 'you@example.com' },
  component: TextField,
  title: 'Inputs/Text Field',
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(input.closest('[data-slot=text-field]')).not.toBeNull();
    await expect(input).toHaveAttribute('data-slot', 'input');
    await expect(input).toHaveAttribute('data-size', 'md');
    await expect(input).toHaveAttribute('placeholder', 'you@example.com');
    await expect(canvas.queryByText('*')).toBeNull();
    await userEvent.type(input, 'hello@oakoss.dev');
    await expect(input).toHaveValue('hello@oakoss.dev');
  },
};

export const WithDescription: Story = {
  args: { description: 'We never share your address.' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription('We never share your address.');
  },
};

// Inputs share Button's control heights, so a small input sits beside a
// small button.
export const Sizes: Story = {
  play: async ({ canvas }) => {
    const heights = ['Small', 'Medium', 'Large'].map(
      (name) =>
        canvas.getByRole('textbox', { name }).getBoundingClientRect().height,
    );
    await expect(heights).toEqual([32, 36, 40]);
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <TextField label="Small" size="sm" />
      <TextField label="Medium" />
      <TextField label="Large" size="lg" />
    </div>
  ),
};

// The utilities behind these values appear only in packages/ui, so this fails
// if Tailwind stops scanning the package. Keep their class names out of
// stories. py-1 is used only by the input.
export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const style = getComputedStyle(
      canvas.getByRole('textbox', { name: 'Email' }),
    );
    await expect(style.paddingTop).toBe('4px');
    await expect(style.paddingInlineStart).toBe('10px');
  },
};

// The border identifies the control, so it uses the 3:1 tokens: `input` at
// rest, `destructive-text` when invalid.
export const Borders: Story = {
  play: async ({ canvas }) => {
    const valid = canvas.getByRole('textbox', { name: 'Email' });
    const invalid = canvas.getByRole('textbox', { name: 'Work email' });
    await expect(borderColor(valid)).toBe(resolved('var(--color-input)'));
    await expect(borderColor(invalid)).toBe(
      resolved('var(--color-destructive-text)'),
    );
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <TextField label="Email" />
      <TextField isInvalid label="Work email" />
    </div>
  ),
};

export const Invalid: Story = {
  args: { errorMessage: 'Enter a valid email.', isInvalid: true },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription('Enter a valid email.');
  },
};

// errorMessage as a function resolves through FieldError's render-prop
// children.
export const InvalidWithFunctionMessage: Story = {
  args: { errorMessage: () => 'Computed error.', isInvalid: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Computed error.')).toBeVisible();
  },
};

export const Errors: Story = {
  args: { errors: ['Enter a valid email.'], isInvalid: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription('Enter a valid email.');
  },
};

// Values that render nothing (`''`, `show && 'Email'`) count as absent: no
// empty label or description for the input to point at.
export const EmptyLabelAndDescription: Story = {
  args: { 'aria-label': 'Search', description: '', label: false },
  play: async ({ canvasElement }) => {
    for (const slot of ['field-label', 'field-description']) {
      await expect(
        canvasElement.querySelector(`[data-slot=${CSS.escape(slot)}]`),
      ).toBeNull();
    }
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeDisabled();
    await expect(getComputedStyle(canvas.getByText('Email')).opacity).toBe(
      '0.5',
    );
  },
};

// The asterisk is visual: React Aria already exposes the field as required,
// so it stays out of the accessible name.
export const Required: Story = {
  args: { isRequired: true },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(input).toBeRequired();
    await expect(canvas.getByText('*')).toBeVisible();
  },
};

// Required through context, as a parent can set it: the asterisk follows
// React Aria's merged state, not only the props passed to TextField.
export const RequiredFromContext: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeRequired();
    await expect(canvas.getByText('*')).toBeVisible();
  },
  render: () => (
    <TextFieldContext value={{ isRequired: true }}>
      <TextField label="Email" />
    </TextFieldContext>
  ),
};

export const NoLabel: Story = {
  args: { 'aria-label': 'Search', label: undefined },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('textbox', { name: 'Search' })).toBeVisible();
    await expect(
      canvasElement.querySelector('[data-slot=field-label]'),
    ).toBeNull();
  },
};

// A consumer's className merges onto the root, not the input.
export const ClassNameOverride: Story = {
  args: { className: 'gap-8' },
  play: async ({ canvas }) => {
    const root = canvas
      .getByRole('textbox', { name: 'Email' })
      .closest('[data-slot=text-field]');
    await expect(root).toHaveClass('gap-8');
    await expect(root).not.toHaveClass('gap-2');
  },
};

export const RenderPropClassName: Story = {
  args: { className: () => 'gap-8' },
  play: async ({ canvas }) => {
    const root = canvas
      .getByRole('textbox', { name: 'Email' })
      .closest('[data-slot=text-field]');
    await expect(root).toHaveClass('gap-8');
    await expect(root).not.toHaveClass('gap-2');
  },
};

export const FocusRing: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await userEvent.click(input);
    const style = getComputedStyle(input);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.outlineWidth).toBe('3px');
  },
};

export const RightToLeft: Story = {
  args: {
    description: 'سنرسل لك رسالة تأكيد',
    label: 'البريد الإلكتروني',
    placeholder: 'you@example.com',
  },
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'البريد الإلكتروني' });
    await expect(getComputedStyle(input).direction).toBe('rtl');
  },
};

// Skip the color transition so the read is the settled border.
function borderColor(element: HTMLElement): string {
  for (const animation of element.getAnimations()) animation.finish();
  return getComputedStyle(element).borderTopColor;
}

function resolved(value: string): string {
  const probe = document.createElement('div');
  probe.style.color = value;
  document.body.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color;
}
