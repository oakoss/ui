import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect } from 'storybook/test';

import { Button } from '#/components/ui/inputs/button';

const meta = {
  args: { children: 'Button' },
  component: Button,
  title: 'Inputs/Button',
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { intent: 'secondary' } };
export const Outline: Story = { args: { intent: 'outline' } };
export const Ghost: Story = { args: { intent: 'ghost' } };
export const Destructive: Story = { args: { intent: 'destructive' } };

export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };

// Proves the global stylesheet actually loaded: `inline-flex` is from the base
// styles, whereas an unstyled <button> computes to `inline-block`.
export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /button/iu });
    await expect(getComputedStyle(button).display).toBe('inline-flex');
  },
};

// Proves the themeable tokens work: toggling the `dark` class changes the
// primary token's resolved color. Restores the prior state so it's
// order-independent and safe when the toolbar is already on dark.
export const Dark: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /button/iu });
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');

    root.classList.remove('dark');
    const light = getComputedStyle(button).backgroundColor;
    root.classList.add('dark');
    const dark = getComputedStyle(button).backgroundColor;
    root.classList.toggle('dark', wasDark);

    await expect(dark).not.toBe(light);
  },
};

// A consumer's string className overrides the base via tailwind-merge — the
// reason cx exists rather than string concatenation.
export const ClassNameOverride: Story = {
  args: { className: 'bg-emerald-500' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /button/iu });
    await expect(button.classList.contains('bg-emerald-500')).toBe(true);
    await expect(button.classList.contains('bg-primary')).toBe(false);
  },
};

// A render-function className (React Aria's state-driven form) resolves through
// cx's composeRenderProps path.
export const RenderPropClassName: Story = {
  args: { className: () => 'bg-fuchsia-500' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /button/iu });
    await expect(button.classList.contains('bg-fuchsia-500')).toBe(true);
    await expect(button.classList.contains('bg-primary')).toBe(false);
  },
};

export const Disabled: Story = { args: { isDisabled: true } };
