import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icon from '@oakoss/ui/components/icons';
import { Toggle } from '@oakoss/ui/components/ui/inputs/toggle';
import { expect, fn, userEvent } from 'storybook/test';

import { contrast, tokenColor } from '../color';
import { paintedColor } from '../paint';

const onChange = fn<(isSelected: boolean) => void>();

const meta = {
  args: { children: 'Bold', onChange },
  beforeEach: () => {
    onChange.mockClear();
  },
  component: Toggle,
  title: 'Inputs/Toggle',
} satisfies Meta<typeof Toggle>;

export default meta;

type Story = StoryObj<typeof meta>;

function page() {
  return getComputedStyle(document.body).backgroundColor;
}

async function settle() {
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished),
  );
}

// A toggle is a button that reports its state with aria-pressed.
export const Default: Story = {
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('data-slot', 'toggle');
    await expect(toggle).toHaveAttribute('data-size', 'md');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(onChange).toHaveBeenCalledWith(true);
  },
};

export const Keyboard: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  },
};

// On is Button's solid neutral fill, well apart from the page, with its text
// readable on it.
export const Selected: Story = {
  args: { defaultSelected: true },
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    delete toggle.dataset.hovered;
    await settle();
    const style = getComputedStyle(toggle);
    await expect(style.backgroundColor).toBe(tokenColor('--color-foreground'));
    await expect(contrast(style.backgroundColor, page())).toBeGreaterThan(3);
    await expect(contrast(style.color, style.backgroundColor)).toBeGreaterThan(
      4.5,
    );
  },
};

// Hovered, an on toggle keeps its fill under the state layer. Ends hovered so
// axe checks that state.
export const SelectedHover: Story = {
  args: { defaultSelected: true },
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    toggle.dataset.hovered = 'true';
    await settle();
    const style = getComputedStyle(toggle);
    await expect(contrast(style.backgroundColor, page())).toBeGreaterThan(3);
  },
};

// Off and hovered, a toggle shows only the faint state layer, so hover can't
// pass for on.
export const HoverIsNotSelected: Story = {
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    // The hover variant matches the attribute at any value, so remove it.
    delete toggle.dataset.hovered;
    await settle();
    const rest = getComputedStyle(toggle).backgroundImage;
    toggle.dataset.hovered = 'true';
    await settle();
    const style = getComputedStyle(toggle);
    await expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await expect(style.backgroundImage).not.toBe(rest);
  },
};

export const Outline: Story = {
  args: { variant: 'outline' },
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('data-variant', 'outline');
    await expect(getComputedStyle(toggle).borderTopStyle).toBe('solid');
    await userEvent.click(toggle);
    delete toggle.dataset.hovered;
    await settle();
    const style = getComputedStyle(toggle);
    await expect(contrast(style.backgroundColor, page())).toBeGreaterThan(3);
    await expect(style.borderTopColor).toBe('rgba(0, 0, 0, 0)');
  },
};

// A consumer's classes win over the toggle's own, as a string or a function.
export const ClassNameOverride: Story = {
  args: { className: 'selected:bg-destructive', defaultSelected: true },
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    delete toggle.dataset.hovered;
    await settle();
    await expect(getComputedStyle(toggle).backgroundColor).toBe(
      tokenColor('--color-destructive'),
    );
  },
};

export const RenderPropClassName: Story = {
  args: {
    className: ({ isSelected }) => (isSelected ? 'rounded-full' : ''),
    defaultSelected: true,
  },
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveClass('rounded-full');
    await expect(toggle).not.toHaveClass('rounded-control');
  },
};

export const IconOnly: Story = {
  args: { 'aria-label': 'Bold', children: <Icon.Check />, size: 'icon' },
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toHaveAttribute('data-size', 'icon');
    await expect(toggle.getBoundingClientRect().width).toBe(
      toggle.getBoundingClientRect().height,
    );
  },
};

export const FocusRing: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(
      getComputedStyle(canvas.getByRole('button')).outlineStyle,
    ).toBe('solid');
  },
};

export const TargetSize: Story = {
  play: async ({ canvas }) => {
    const area = getComputedStyle(canvas.getByRole('button'), '::after');
    await expect(area.minWidth).toBe('44px');
  },
};

export const TargetSizeOff: Story = {
  args: { targetSize: false },
  play: async ({ canvas }) => {
    const area = getComputedStyle(canvas.getByRole('button'), '::after');
    await expect(area.minWidth).not.toBe('44px');
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await expect(toggle).toBeDisabled();
    await expect(getComputedStyle(toggle).opacity).toBe('0.5');
  },
};

// Forced colors repaint fills, so on takes the system's selection colors and
// stays apart from off.
export const ForcedColors: Story = {
  // In High Contrast the user's system colors set contrast, and axe's rule
  // misreads the forced colors.
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    const off = getComputedStyle(toggle).backgroundColor;
    await userEvent.click(toggle);
    await settle();
    const style = getComputedStyle(toggle);
    await expect(style.backgroundColor).not.toBe(off);
    await expect(contrast(style.backgroundColor, page())).toBeGreaterThan(3);
    await expect(contrast(style.color, style.backgroundColor)).toBeGreaterThan(
      4.5,
    );
  },
  tags: ['forced-colors'],
};

// Opted out of forced colors, a selected toggle sets its focus outline to the
// system's selection color itself.
export const ForcedColorsFocus: Story = {
  args: { defaultSelected: true },
  parameters: ForcedColors.parameters,
  play: async ({ canvas }) => {
    await userEvent.tab();
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    await settle();
    const style = getComputedStyle(toggle);
    await expect(style.outlineStyle).toBe('solid');
    await expect(style.outlineColor).toBe(style.backgroundColor);
  },
  tags: ['forced-colors'],
};

// The hover layer would wash over the selection fill, so a selected toggle
// drops it in forced colors.
export const ForcedColorsSelectedHover: Story = {
  args: { defaultSelected: true },
  parameters: ForcedColors.parameters,
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    toggle.dataset.hovered = 'true';
    await settle();
    await expect(getComputedStyle(toggle).backgroundImage).toBe('none');
  },
  tags: ['forced-colors'],
};

// A disabled toggle, on or not, paints like a native disabled button rather
// than in the selection colors, which would make it look live.
export const ForcedColorsSelectedDisabled: Story = {
  parameters: ForcedColors.parameters,
  play: async ({ canvas }) => {
    const native = getComputedStyle(canvas.getByText('Native'));
    const live = getComputedStyle(canvas.getByRole('button', { name: 'Live' }));
    const toggle = getComputedStyle(
      canvas.getByRole('button', { name: 'Bold' }),
    );
    await expect(toggle.color).toBe(native.color);
    await expect(toggle.borderTopColor).toBe(native.color);
    await expect(toggle.backgroundColor).not.toBe(live.backgroundColor);
    await expect(toggle.opacity).toBe('1');
  },
  render: (args) => (
    <div className="flex gap-3">
      <Toggle {...args} defaultSelected isDisabled />
      <Toggle defaultSelected>Live</Toggle>
      <button aria-pressed="true" disabled type="button">
        Native
      </button>
    </div>
  ),
  tags: ['forced-colors'],
};

// Forced colors draw a page-colored backplate behind text, which would paint
// over the selected fill and hide its light label; on, a toggle opts out.
export const ForcedColorsLabel: Story = {
  args: {
    children: <span data-testid="label">Bold text</span>,
    defaultSelected: true,
  },
  parameters: ForcedColors.parameters,
  play: async ({ canvas }) => {
    await settle();
    await expect(await paintedColor(canvas.getByTestId('label'))).toBe(
      await paintedColor(canvas.getByRole('button')),
    );
  },
  tags: ['forced-colors'],
};
