import type { Meta, StoryObj } from '@storybook/react-vite';

import { badgeStyles } from '@oakoss/ui/components/ui/data/badge';
import { Button, Link } from 'react-aria-components';
import { expect, userEvent } from 'storybook/test';

import { colorOf, hoverOf, intents, rolesOf } from '#/data/badge-roles';
import { setState } from '#/helpers/state';

const meta = { component: Link, title: 'Data/Badge/Links' } satisfies Meta<
  typeof Link
>;

export default meta;

type Story = StoryObj<typeof meta>;

// A solid badge link swaps to its intent's hover fill on hover and press.
export const SolidStates: Story = {
  play: async ({ canvas }) => {
    for (const intent of intents) {
      const link = canvas.getByRole('link', { name: intent });
      await setState(link, 'resting');
      await expect(getComputedStyle(link).backgroundColor).toBe(
        rolesOf(intent, 'solid').bg,
      );
      await expect(getComputedStyle(link).cursor).toBe('pointer');
      for (const state of ['hovered', 'pressed'] as const) {
        await setState(link, state);
        await expect(getComputedStyle(link).backgroundColor).toBe(
          hoverOf(intent),
        );
      }
    }
  },
  render: () => (
    <div className="flex gap-3">
      {intents.map((intent) => (
        <Link className={badgeStyles({ intent })} key={intent}>
          {intent}
        </Link>
      ))}
    </div>
  ),
};

// Soft and outline badge links keep their fill and tint it with a state
// layer, stronger when pressed than hovered. An outline link keeps its
// intent's border.
export const LayerStates: Story = {
  play: async ({ canvas }) => {
    for (const variant of ['soft', 'outline'] as const) {
      const link = canvas.getByRole('link', { name: variant });
      await setState(link, 'resting');
      const fill = getComputedStyle(link).backgroundColor;
      await expect(fill).toBe(rolesOf('primary', variant).bg);
      const layers = new Set([getComputedStyle(link).backgroundImage]);
      for (const state of ['hovered', 'pressed'] as const) {
        await setState(link, state);
        await expect(getComputedStyle(link).backgroundColor).toBe(fill);
        layers.add(getComputedStyle(link).backgroundImage);
      }
      await expect(layers.size).toBe(3);
    }
    const outline = canvas.getByRole('link', { name: 'outline' });
    await expect(getComputedStyle(outline).borderTopColor).toBe(
      colorOf('primary-border'),
    );
  },
  render: () => (
    <div className="flex gap-3">
      <Link className={badgeStyles({ variant: 'soft' })}>soft</Link>
      <Link className={badgeStyles({ variant: 'outline' })}>outline</Link>
    </div>
  ),
};

// A disabled badge link fades and takes no pointer events.
export const Disabled: Story = {
  play: async ({ canvas }) => {
    const style = getComputedStyle(canvas.getByRole('link'));
    await expect(style.opacity).toBe('0.5');
    await expect(style.pointerEvents).toBe('none');
  },
  render: () => (
    <Link className={badgeStyles()} isDisabled>
      Docs
    </Link>
  ),
};

// Keyboard focus draws the ring; the 20px badge gets a 44×44 pointer target.
export const FocusAndTarget: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Docs' });
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(getComputedStyle(link).outlineStyle).toBe('solid');
    const after = getComputedStyle(link, '::after');
    await expect(after.position).toBe('absolute');
    await expect(after.height).toBe('44px');
    await expect(Number(after.width.replace('px', ''))).toBeGreaterThanOrEqual(
      44,
    );
  },
  render: () => <Link className={badgeStyles()}>Docs</Link>,
};

// targetSize: false drops the pointer target, for badges that sit closer
// than 44px apart.
export const WithoutTargetSize: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Remove filter' });
    await expect(getComputedStyle(button, '::after').position).not.toBe(
      'absolute',
    );
  },
  render: () => (
    <Button className={badgeStyles({ targetSize: false, variant: 'outline' })}>
      Remove filter
    </Button>
  ),
};
