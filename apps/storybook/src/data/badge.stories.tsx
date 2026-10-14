import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icon from '@oakoss/ui/components/icons';
import { Badge, badgeStyles } from '@oakoss/ui/components/ui/data/badge';
import { Link } from 'react-aria-components';
import { expect } from 'storybook/test';

import { colorOf, intents, rolesOf, variants } from '#/data/badge-roles';
import { part } from '#/parts';
import { hoverReal } from '#/pointer';

const meta = {
  args: { children: 'New' },
  component: Badge,
  title: 'Data/Badge',
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

// A plain span with no role, primary and solid by default. Counts keep their
// width as digits change, and text stays on one line.
export const Default: Story = {
  args: { children: '1,024 requests to the billing service' },
  play: async () => {
    const badge = part('badge');
    await expect(badge.tagName).toBe('SPAN');
    await expect(badge).not.toHaveAttribute('role');
    await expect(badge).toHaveAttribute('data-intent', 'primary');
    await expect(badge).toHaveAttribute('data-variant', 'solid');
    const style = getComputedStyle(badge);
    await expect(style.backgroundColor).toBe(colorOf('primary'));
    await expect(style.color).toBe(colorOf('primary-foreground'));
    await expect(style.fontVariantNumeric).toBe('tabular-nums');
    await expect(style.whiteSpace).toBe('nowrap');
    await expect(badge.getBoundingClientRect().height).toBe(20);
    await expect(getComputedStyle(badge, '::after').position).not.toBe(
      'absolute',
    );
  },
};

// Each look takes its intent's roles; axe checks the contrast of each in
// light and dark.
export const Looks: Story = {
  play: async () => {
    for (const intent of intents) {
      for (const variant of variants) {
        const badge = document.querySelector<HTMLElement>(
          `[data-slot=badge][data-intent=${CSS.escape(intent)}][data-variant=${CSS.escape(variant)}]`,
        );
        if (!badge) throw new Error(`No ${intent} ${variant} badge`);
        const style = getComputedStyle(badge);
        const roles = rolesOf(intent, variant);
        await expect(style.backgroundColor).toBe(roles.bg);
        await expect(style.color).toBe(roles.fg);
        await expect(style.borderTopColor).toBe(roles.border);
      }
    }
  },
  render: () => (
    <div className="grid gap-2">
      {intents.map((intent) => (
        <div className="flex gap-2" key={intent}>
          {variants.map((variant) => (
            <Badge intent={intent} key={variant} variant={variant}>
              {intent}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

// A static badge has no hover style, so it doesn't look clickable. On a plain
// element hover: matches only :hover, so the story moves the real mouse.
export const StaticHover: Story = {
  play: async () => {
    const badge = part('badge');
    await expect(badge.matches(':hover')).toBe(false);
    const resting = getComputedStyle(badge).backgroundColor;
    await hoverReal(badge);
    await expect(badge.matches(':hover')).toBe(true);
    await expect(getComputedStyle(badge).backgroundColor).toBe(resting);
    await expect(getComputedStyle(badge).cursor).toBe('auto');
  },
};

// An icon shrinks to the badge's text size, and the badge pads it less on
// that side.
export const WithIcon: Story = {
  play: async () => {
    const [start, end] =
      document.querySelectorAll<HTMLElement>('[data-slot=badge]');
    if (!start || !end) throw new Error('No badges');
    const svg = start.querySelector('svg');
    if (!svg) throw new Error('No icon');
    await expect(svg.getBoundingClientRect().width).toBe(12);
    await expect(getComputedStyle(start).paddingInlineStart).toBe('6px');
    await expect(getComputedStyle(start).paddingInlineEnd).toBe('8px');
    await expect(getComputedStyle(end).paddingInlineEnd).toBe('6px');
    await expect(getComputedStyle(end).paddingInlineStart).toBe('8px');
  },
  render: (args) => (
    <div className="flex gap-3">
      <Badge {...args} intent="success" variant="soft">
        <Icon.Check aria-hidden data-icon="inline-start" />
        Verified
      </Badge>
      <Badge {...args} intent="neutral" variant="outline">
        Next
        <Icon.ChevronRight aria-hidden data-icon="inline-end" />
      </Badge>
    </div>
  ),
};

// A count reads as a whole phrase: the visible number plus hidden words.
export const Count: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText('unread messages')).toHaveClass('sr-only');
    await expect(part('badge')).toHaveTextContent('3 unread messages');
  },
  render: () => (
    <Badge intent="destructive">
      3<span className="sr-only"> unread messages</span>
    </Badge>
  ),
};

// Forced colors repaint the transparent border, so a solid badge keeps its
// edge, and a disabled badge link takes the system's disabled color like a
// native disabled button.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const badge = getComputedStyle(part('badge'));
    await expect(badge.borderTopWidth).toBe('1px');
    await expect(badge.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
    const native = getComputedStyle(canvas.getByText('Native'));
    const disabled = getComputedStyle(canvas.getByRole('link'));
    await expect(disabled.color).toBe(native.color);
    await expect(disabled.opacity).toBe('1');
  },
  render: () => (
    <div className="flex gap-3">
      <Badge>New</Badge>
      <Link className={badgeStyles({ variant: 'outline' })} isDisabled>
        Docs
      </Link>
      <button disabled type="button">
        Native
      </button>
    </div>
  ),
  tags: ['forced-colors'],
};
