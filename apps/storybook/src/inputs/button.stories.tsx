import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { expect, userEvent } from 'storybook/test';

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

// The utilities behind these values appear only in packages/ui, so this fails
// if Tailwind stops scanning the package. Keep their class names out of stories.
export const CssCheck: Story = {
  play: async ({ canvas }) => {
    const style = getComputedStyle(
      canvas.getByRole('button', { name: /button/iu }),
    );
    await expect(style.whiteSpace).toBe('nowrap');
    await expect(style.cursor).toBe('pointer');
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

// A consumer's string className overrides the base via cn — the reason cx
// exists rather than string concatenation.
export const ClassNameOverride: Story = {
  args: { className: 'bg-emerald-700 text-white' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /button/iu });
    await expect(button.classList.contains('bg-emerald-700')).toBe(true);
    await expect(button.classList.contains('bg-primary')).toBe(false);
  },
};

// A render-function className (React Aria's state-driven form) resolves through
// cx's composeRenderProps path.
export const RenderPropClassName: Story = {
  args: { className: () => 'bg-fuchsia-700 text-white' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /button/iu });
    await expect(button.classList.contains('bg-fuchsia-700')).toBe(true);
    await expect(button.classList.contains('bg-primary')).toBe(false);
  },
};

export const Disabled: Story = { args: { isDisabled: true } };

function ringColor(): string {
  const probe = document.createElement('div');
  probe.style.color = 'var(--ring)';
  document.body.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color;
}

export const FocusRing: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /button/iu });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    const style = getComputedStyle(button);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.outlineWidth).toBe('3px');
    // transition-colors fades outline-color in from currentColor.
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 300);
    });
    await expect(style.outlineColor).toBe(ringColor());
    await expect(style.boxShadow).toBe('none');
  },
};

// One glyph keeps the button narrower and shorter than 44px on its own.
export const TargetSize: Story = {
  args: { 'aria-label': 'Add', children: '+', size: 'sm' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Add' });
    await expect(button.getBoundingClientRect().width).toBeLessThan(44);
    const after = getComputedStyle(button, '::after');
    await expect(after.position).toBe('absolute');
    // The button is smaller than 44px both ways, so the minimum sets both.
    await expect(after.height).toBe('44px');
    await expect(after.width).toBe('44px');
  },
};

export const WithoutTargetSize: Story = {
  args: { 'aria-label': 'Add', children: '+', size: 'sm', targetSize: false },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Add' });
    await expect(getComputedStyle(button, '::after').position).not.toBe(
      'absolute',
    );
  },
};
