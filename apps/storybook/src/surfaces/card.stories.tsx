import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@oakoss/ui/components/ui/surfaces/card';
import { Link } from 'react-aria-components';
import { expect, fn, userEvent } from 'storybook/test';

import { part } from '../parts';
import { CardDemo, type CardDemoProps } from './card-demo';

const meta = {
  args: { className: 'w-80' },
  render: (args) => <CardDemo {...args} />,
  title: 'Surfaces/Card',
} satisfies Meta<CardDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// The title is a level-3 heading, so screen reader users can jump to it.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 3, name: 'Team plan' }),
    ).toBeVisible();
    const card = getComputedStyle(part('card'));
    await expect(card.paddingTop).toBe('24px');
    await expect(card.rowGap).toBe('24px');
    await expect(part('card')).toHaveAttribute('data-size', 'md');
    await expect(getComputedStyle(part('card-content')).paddingLeft).toBe(
      '24px',
    );
  },
};

export const HeadingLevel: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Usage' }),
    ).toBeVisible();
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle level={2}>Usage</CardTitle>
      </CardHeader>
    </Card>
  ),
};

// Every part follows the small size's tighter spacing.
export const Small: Story = {
  args: { size: 'sm' },
  play: async () => {
    await expect(part('card')).toHaveAttribute('data-size', 'sm');
    const card = getComputedStyle(part('card'));
    await expect(card.paddingTop).toBe('16px');
    await expect(card.rowGap).toBe('16px');
    for (const slot of ['card-header', 'card-content', 'card-footer']) {
      await expect(getComputedStyle(part(slot)).paddingLeft).toBe('16px');
    }
    await expect(getComputedStyle(part('card-title')).fontSize).toBe('14px');
  },
};

export const ClassName: Story = {
  args: { className: 'w-80 rounded-none' },
  play: async () => {
    await expect(getComputedStyle(part('card')).borderTopLeftRadius).toBe(
      '0px',
    );
  },
};

// The docs' clickable card: the title's link stretches over the card, so the
// whole card opens it while the link keeps the title as its name, and the
// card's own buttons stay on top and clickable.
const onChange = fn<() => void>();

export const StretchedLink: Story = {
  beforeEach: () => {
    onChange.mockClear();
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link');
    await expect(link).toHaveAccessibleName('Team plan');
    const card = part('card').getBoundingClientRect();
    const middle = document.elementFromPoint(
      card.left + card.width / 2,
      card.top + card.height / 2,
    );
    await expect(middle).toBe(link);
    // The link hides its own ring, so keyboard focus shows on the card.
    await expect(getComputedStyle(part('card')).outlineStyle).toBe('none');
    await userEvent.tab();
    await expect(link).toHaveFocus();
    await expect(getComputedStyle(part('card')).outlineStyle).toBe('solid');
    const button = canvas.getByRole('button', { name: 'Change' });
    const { height, left, top, width } = button.getBoundingClientRect();
    await expect(
      document.elementFromPoint(left + width / 2, top + height / 2),
    ).toBe(button);
    await userEvent.click(button);
    await expect(onChange).toHaveBeenCalledOnce();
  },
  render: (args) => (
    <Card
      {...args}
      className="relative w-80 has-[a[data-focus-visible]]:outline-(length:--ring-width) has-[a[data-focus-visible]]:outline-offset-2 has-[a[data-focus-visible]]:outline-ring has-[a[data-focus-visible]]:outline-solid"
    >
      <CardHeader>
        <CardTitle>
          <Link
            className="outline-hidden after:absolute after:inset-0"
            href="#team"
          >
            Team plan
          </Link>
        </CardTitle>
        <CardDescription>Billed yearly.</CardDescription>
        <CardAction>
          <Button
            className="relative"
            onPress={onChange}
            size="sm"
            variant="outline"
          >
            Change
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>Five seats, 100 GB of storage.</CardContent>
    </Card>
  ),
};

// Forced colors repaint the transparent border; the ring is a shadow, which
// they drop.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const style = getComputedStyle(part('card'));
    await expect(style.borderTopWidth).toBe('1px');
    await expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
  },
  tags: ['forced-colors'],
};
