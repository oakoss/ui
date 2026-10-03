import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Button,
  type ButtonStyleProps,
} from '@oakoss/ui/components/ui/inputs/button';
import { expect, userEvent } from 'storybook/test';

const variants = [
  'solid',
  'soft',
  'outline',
  'ghost',
  'link',
] as const satisfies readonly ButtonStyleProps['variant'][];
const intents = [
  'primary',
  'neutral',
  'destructive',
  'success',
  'warning',
  'info',
] as const satisfies readonly ButtonStyleProps['intent'][];

function Matrix() {
  return (
    <div className="grid grid-cols-5 gap-3">
      {intents.flatMap((intent) =>
        variants.map((variant) => (
          <Button
            intent={intent}
            key={`${intent}-${variant}`}
            variant={variant}
          >
            {intent} {variant}
          </Button>
        )),
      )}
    </div>
  );
}

const meta = {
  component: Matrix,
  title: 'Inputs/Button/Variants',
} satisfies Meta<typeof Matrix>;

export default meta;

type Story = StoryObj<typeof meta>;

// A CSS color expression as the browser computes it.
function resolved(value: string): string {
  const probe = document.createElement('div');
  probe.style.color = value;
  document.body.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color;
}

// Skip transitions so each read is the settled style.
function settled(element: HTMLElement) {
  for (const animation of element.getAnimations()) animation.finish();
  const style = getComputedStyle(element);
  return {
    background: style.backgroundColor,
    color: style.color,
    decoration: style.textDecorationLine,
    // The layer's strength, from `color-mix(currentcolor 8%, …)`.
    layer: Number(
      /currentcolor ([\d.]+)%/u.exec(
        style.getPropertyValue('--tw-gradient-from'),
      )?.[1] ?? 0,
    ),
  };
}

// Every look × intent, so axe checks each combination's contrast in light and
// dark (the test projects); the palette stories repeat it in other themes.
export const AllVariants: Story = {
  play: async ({ canvas }) => {
    const buttons = canvas.getAllByRole('button');
    await expect(buttons).toHaveLength(variants.length * intents.length);
    // axe reports text the same color as its fill as incomplete, not failed.
    const invisible = buttons.filter((button) => {
      const { background, color } = settled(button);
      return button.dataset.variant === 'solid' && background === color;
    });
    await expect(invisible).toEqual([]);
    const wrongBorder = buttons.filter((button) => {
      const { intent, variant } = button.dataset;
      const role = intent === 'neutral' ? 'border' : `${intent}-border`;
      return (
        variant === 'outline' &&
        getComputedStyle(button).borderTopColor !==
          resolved(`var(--color-${role})`)
      );
    });
    await expect(wrongBorder).toEqual([]);
  },
};

export const HoverAndPress: Story = {
  play: async ({ canvas }) => {
    const unchanged: string[] = [];
    for (const button of canvas.getAllByRole('button')) {
      const rest = settled(button);
      await userEvent.hover(button);
      const hover = settled(button);
      await userEvent.pointer({ keys: '[MouseLeft>]', target: button });
      const press = settled(button);
      await userEvent.pointer({ keys: '[/MouseLeft]', target: button });
      await userEvent.unhover(button);
      const { variant } = button.dataset;
      const isRight =
        variant === 'solid'
          ? hover.background !== rest.background &&
            press.background === hover.background
          : variant === 'link'
            ? hover.decoration === 'underline'
            : rest.layer === 0 &&
              hover.layer === 8 &&
              press.layer === 12 &&
              press.background === rest.background;
      if (!isRight) unchanged.push(button.textContent);
    }
    await expect(unchanged).toEqual([]);
  },
};

// Touch presses without hovering. One press per button: the runner's release
// doesn't reach React Aria, so a second reading would see a stale press.
export const TouchPress: Story = {
  play: async ({ canvas }) => {
    const unchanged: string[] = [];
    for (const button of canvas.getAllByRole('button')) {
      const rest = settled(button);
      await userEvent.pointer({ keys: '[TouchA>]', target: button });
      const press = settled(button);
      const { variant } = button.dataset;
      const isRight =
        variant === 'solid'
          ? press.background !== rest.background
          : variant === 'link' || press.layer === 12;
      if (!isRight) unchanged.push(button.textContent);
    }
    await expect(unchanged).toEqual([]);
  },
};

// Recoloring through the variables also moves hover, neutral included.
export const CustomColors: Story = {
  play: async ({ canvas }) => {
    const solids = canvas
      .getAllByRole('button')
      .filter((button) => button.dataset.variant === 'solid');
    const wrong: string[] = [];
    for (const button of solids) {
      button.style.setProperty('--btn-bg', 'var(--color-success)');
      button.style.setProperty('--btn-hover', 'var(--color-success-hover)');
      button.style.setProperty('--btn-fg', 'var(--color-success-foreground)');
      await userEvent.hover(button);
      const { background } = settled(button);
      await userEvent.unhover(button);
      if (background !== resolved('var(--color-success-hover)')) {
        wrong.push(button.textContent);
      }
    }
    await expect(wrong).toEqual([]);
  },
};

async function inPalette(family: string, primary: string) {
  const root = document.documentElement;
  await expect(root).toHaveAttribute('data-family', family);
  await expect(root).toHaveAttribute('data-primary', primary);
}

export const StoneYellow: Story = {
  globals: { family: 'stone', primary: 'yellow' },
  play: async (context) => {
    await inPalette('stone', 'yellow');
    await AllVariants.play?.(context);
  },
};

export const MauveBlue: Story = {
  globals: { family: 'mauve', primary: 'blue' },
  play: async (context) => {
    await inPalette('mauve', 'blue');
    await AllVariants.play?.(context);
  },
};

export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async (context) => {
    const ltr = context.canvas
      .getAllByRole('button')
      .filter((button) => getComputedStyle(button).direction !== 'rtl');
    await expect(ltr).toEqual([]);
    await AllVariants.play?.(context);
  },
};

// Windows High Contrast removes backgrounds, so every look needs a border; a
// transparent one is repainted in a system color.
export const ForcedColors: Story = {
  // In High Contrast the user's system colors set contrast, and axe's rule
  // misreads the forced colors.
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const borderless = canvas.getAllByRole('button').filter((button) => {
      const style = getComputedStyle(button);
      return (
        style.borderTopWidth !== '1px' ||
        style.borderTopColor === 'rgba(0, 0, 0, 0)'
      );
    });
    await expect(borderless).toEqual([]);
  },
  tags: ['forced-colors'],
};
