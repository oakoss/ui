import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
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
    await userEvent.type(input, 'hello@oakoss.dev');
    await expect(input).toHaveValue('hello@oakoss.dev');
  },
};

export const WithDescription: Story = {
  args: { description: 'We never share your address.' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('We never share your address.'),
    ).toBeVisible();
  },
};

// The utilities behind these values appear only in packages/ui, so this fails
// if Tailwind stops scanning the package. Keep their class names out of stories.
export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const style = getComputedStyle(
      canvas.getByRole('textbox', { name: 'Email' }),
    );
    await expect(style.paddingLeft).toBe('12px');
    await expect(style.borderTopWidth).toBe('1px');
  },
};

export const Invalid: Story = {
  args: { errorMessage: 'Enter a valid email.', isInvalid: true },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(input).toHaveAttribute('data-invalid');
    await expect(canvas.getByText('Enter a valid email.')).toBeVisible();
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeDisabled();
  },
};

export const Required: Story = {
  args: { isRequired: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Email' })).toBeRequired();
  },
};

// No visible label: the field must stay accessible via a forwarded aria-label,
// exercising the `hasLabel` false branch.
export const NoLabel: Story = {
  args: { 'aria-label': 'Search', label: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Search' })).toBeVisible();
  },
};

// errorMessage as a function (React Aria's validation-driven form) resolves
// through FieldError's render-prop children.
export const InvalidWithFunctionMessage: Story = {
  args: { errorMessage: () => 'Computed error.', isInvalid: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Computed error.')).toBeVisible();
  },
};

// A consumer's string className merges onto the TextField root (not the input)
// via cx — tailwind-merge lets gap-8 win over the base gap-1.5.
export const ClassNameOverride: Story = {
  args: { className: 'gap-8' },
  play: async ({ canvas }) => {
    const root = canvas.getByRole('textbox', { name: 'Email' }).closest('div');
    if (root === null) throw new Error('TextField root not found');
    await expect(root).toHaveClass('gap-8');
    await expect(root).not.toHaveClass('gap-1.5');
  },
};

// A render-function className resolves through cx's composeRenderProps path,
// also on the root.
export const RenderPropClassName: Story = {
  args: { className: () => 'gap-8' },
  play: async ({ canvas }) => {
    const root = canvas.getByRole('textbox', { name: 'Email' }).closest('div');
    if (root === null) throw new Error('TextField root not found');
    await expect(root).toHaveClass('gap-8');
    await expect(root).not.toHaveClass('gap-1.5');
  },
};
