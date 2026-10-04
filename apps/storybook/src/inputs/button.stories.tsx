import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icon from '@oakoss/ui/components/icons';
import { Button, buttonStyles } from '@oakoss/ui/components/ui/inputs/button';
import { Link } from 'react-aria-components';
import { expect, userEvent } from 'storybook/test';

const meta = {
  args: { children: 'Button' },
  component: Button,
  title: 'Inputs/Button',
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Button' });
    await expect(button).toHaveAttribute('data-slot', 'button');
    await expect(button).toHaveAttribute('data-variant', 'solid');
    await expect(button).toHaveAttribute('data-intent', 'primary');
    await expect(button).toHaveAttribute('data-size', 'md');
  },
};

export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };

export const WithIcons: Story = {
  args: {
    children: (
      <>
        <Icon.Plus data-icon="inline-start" />
        Add item
      </>
    ),
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Add item' });
    // The start icon tightens the start padding.
    await expect(getComputedStyle(button).paddingInlineStart).toBe('8px');
    await expectLabelGap(button, '8px');
  },
};

// Sizes set their own gap, which the label must follow.
export const WithIconsSmall: Story = {
  ...WithIcons,
  args: { ...WithIcons.args, size: 'sm' },
  play: async ({ canvas }) => {
    await expectLabelGap(
      canvas.getByRole('button', { name: 'Add item' }),
      '6px',
    );
  },
};

// Children sit in a label span, which must lay them out with the button's gap.
async function expectLabelGap(button: HTMLElement, gap: string) {
  const label = button.querySelector('[data-icon]')?.parentElement ?? null;
  await expect(label).toBeInstanceOf(HTMLElement);
  await expect(label).not.toBe(button);
  const style = getComputedStyle(label ?? button);
  // A flex item's display is blockified: inline-flex computes as flex.
  await expect(style.display).toBe('flex');
  await expect(style.columnGap).toBe(gap);
}

// The start icon's padding is logical, so in RTL it tightens the right side.
export const WithIconsRightToLeft: Story = {
  ...WithIcons,
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const style = getComputedStyle(
      canvas.getByRole('button', { name: 'Add item' }),
    );
    await expect(style.direction).toBe('rtl');
    await expect(style.paddingRight).toBe('8px');
  },
};

export const IconOnly: Story = {
  args: { 'aria-label': 'Close', children: <Icon.X />, size: 'icon' },
  play: async ({ canvas }) => {
    const { height, width } = canvas
      .getByRole('button', { name: 'Close' })
      .getBoundingClientRect();
    await expect(width).toBe(height);
  },
};

export const LinkStyledAsButton: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Docs' });
    await expect(link).toHaveClass('px-8');
    await expect(link).not.toHaveClass('px-control-x');
  },
  render: () => (
    <Link
      className={buttonStyles({ className: 'px-8', variant: 'outline' })}
      href="#"
    >
      Docs
    </Link>
  ),
};

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

    // Finish the color transition each switch starts, or a read sees its start.
    const background = () => {
      for (const animation of button.getAnimations()) animation.finish();
      return getComputedStyle(button).backgroundColor;
    };
    root.classList.remove('dark');
    const light = background();
    root.classList.add('dark');
    const dark = background();
    root.classList.toggle('dark', wasDark);
    background();

    await expect(dark).not.toBe(light);
  },
};

// A consumer's string className overrides the base via cn — the reason cx
// exists rather than string concatenation. A fill override must cover hover
// too, or the hover fill shows under the override's text; the story ends
// hovered so axe checks that state.
export const ClassNameOverride: Story = {
  args: { className: 'bg-emerald-700 text-white hover:bg-emerald-800' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /button/iu });
    await expect(button).toHaveClass('bg-emerald-700', 'hover:bg-emerald-800');
    await expect(button).not.toHaveClass('bg-(--btn-bg)');
    await expect(button).not.toHaveClass('hover:bg-(--btn-hover)');
    await userEvent.hover(button);
  },
};

// A render-function className (React Aria's state-driven form) resolves through
// cx's composeRenderProps path.
export const RenderPropClassName: Story = {
  args: { className: () => 'bg-fuchsia-700 text-white hover:bg-fuchsia-800' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /button/iu });
    await expect(button).toHaveClass('bg-fuchsia-700', 'hover:bg-fuchsia-800');
    await expect(button).not.toHaveClass('bg-(--btn-bg)');
    await expect(button).not.toHaveClass('hover:bg-(--btn-hover)');
    await userEvent.hover(button);
  },
};

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
    // The transition fades outline-color in from currentColor.
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 300);
    });
    await expect(style.outlineColor).toBe(ringColor());
    await expect(style.boxShadow).toBe('none');
  },
};

// One glyph keeps the button narrower and shorter than 44px on its own.
export const TargetSize: Story = {
  args: { 'aria-label': 'Add', children: '+', size: 'icon-sm' },
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
  args: {
    'aria-label': 'Add',
    children: '+',
    size: 'icon-sm',
    targetSize: false,
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Add' });
    await expect(getComputedStyle(button, '::after').position).not.toBe(
      'absolute',
    );
  },
};

export const RightToLeft: Story = {
  args: { children: 'زر' },
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'زر' });
    await expect(getComputedStyle(button).direction).toBe('rtl');
  },
};
