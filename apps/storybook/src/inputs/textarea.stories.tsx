import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { TextareaField } from '@oakoss/ui/components/ui/inputs/text-field';
import { Textarea } from '@oakoss/ui/components/ui/inputs/textarea';
import { TextField as AriaTextField } from 'react-aria-components';
import { expect, userEvent } from 'storybook/test';

const meta = {
  args: { label: 'Bio', placeholder: 'A few words about you' },
  component: TextareaField,
  title: 'Inputs/Textarea',
} satisfies Meta<typeof TextareaField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Bio' });
    await expect(textarea.tagName).toBe('TEXTAREA');
    await expect(textarea).toHaveAttribute('data-slot', 'textarea');
    await expect(textarea).toHaveAttribute('data-size', 'md');
    await expect(textarea).toHaveAttribute(
      'placeholder',
      'A few words about you',
    );
    await expect(textarea.closest('[data-slot=textarea-field]')).not.toBeNull();
    await userEvent.type(textarea, 'Hello{Enter}there');
    await expect(textarea).toHaveValue('Hello\nthere');
  },
};

export const WithDescription: Story = {
  args: { description: 'Shown on your profile.' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Bio' }),
    ).toHaveAccessibleDescription('Shown on your profile.');
  },
};

export const Invalid: Story = {
  args: { errors: ['Keep it under 200 characters.'], isInvalid: true },
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Bio' });
    await expect(textarea).toHaveAttribute('aria-invalid', 'true');
    await expect(textarea).toHaveAccessibleDescription(
      'Keep it under 200 characters.',
    );
    await expect(borderColor(textarea)).toBe(
      resolved('var(--color-destructive-text)'),
    );
  },
};

// The asterisk follows React Aria's required state and stays out of the name.
export const Required: Story = {
  args: { isRequired: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Bio' })).toBeRequired();
    await expect(canvas.getByText('*')).toBeVisible();
  },
};

const mark: CSSProperties & Record<'--story-mark', string> = {
  '--story-mark': '1',
};

// A consumer's style merges with the row counts rather than replacing them,
// and their className wins over a conflicting base class.
export const StyleMerges: Story = {
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });
    await expect(textarea.style.getPropertyValue('--story-mark')).toBe('1');
    await expect(textarea.getBoundingClientRect().height).toBe(116);
    await expect(getComputedStyle(textarea).paddingInlineStart).toBe('16px');
  },
  render: () => (
    <AriaTextField>
      <FieldLabel>Notes</FieldLabel>
      <Textarea className="px-4" minRows={5} style={mark} />
    </AriaTextField>
  ),
};

// A consumer's className merges onto the root, not the textarea.
export const ClassNameOverride: Story = {
  args: { className: 'gap-8' },
  play: async ({ canvas }) => {
    const root = canvas
      .getByRole('textbox', { name: 'Bio' })
      .closest('[data-slot=textarea-field]');
    await expect(root).toHaveClass('gap-8');
    await expect(root).not.toHaveClass('gap-2');
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Bio' });
    await expect(textarea).toBeDisabled();
    await expect(getComputedStyle(textarea).opacity).toBe('0.5');
  },
};

export const FocusRing: Story = {
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Bio' });
    await userEvent.click(textarea);
    const style = getComputedStyle(textarea);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.outlineOffset).toBe('2px');
  },
};

// Children replace the layout, as with TextField.
export const CustomLayout: Story = {
  args: { children: undefined, label: undefined, placeholder: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Notes' })).toBeVisible();
  },
  render: () => (
    <TextareaField>
      <FieldLabel>Notes</FieldLabel>
      <Textarea minRows={2} />
    </TextareaField>
  ),
};

export const RightToLeft: Story = {
  args: { label: 'نبذة', placeholder: 'بضع كلمات عنك' },
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'نبذة' });
    await expect(getComputedStyle(textarea).direction).toBe('rtl');
  },
};

// The utilities behind these values appear only in packages/ui, so this fails
// if Tailwind stops scanning the package. Keep their class names out of
// stories.
export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const style = getComputedStyle(
      canvas.getByRole('textbox', { name: 'Bio' }),
    );
    await expect(style.fieldSizing).toBe('content');
    await expect(style.minHeight).toBe('76px');
  },
};

// The border stays visible in forced colors, where it identifies the control.
export const ForcedColors: Story = {
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Bio' });
    const native = canvas.getByRole('textbox', { name: 'Native' });
    await expect(getComputedStyle(textarea).borderTopStyle).toBe('solid');
    await expect(getComputedStyle(textarea).borderTopColor).toBe(
      getComputedStyle(native).borderTopColor,
    );
  },
  render: (args) => (
    <div className="flex flex-col gap-4">
      <TextareaField {...args} />
      <textarea aria-label="Native" />
    </div>
  ),
  tags: ['forced-colors'],
};

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
