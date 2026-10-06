import type { Meta, StoryObj } from '@storybook/react-vite';

import { Dialog, DialogTitle } from '@oakoss/ui/components/ui/overlays/dialog';
import {
  HoverCard,
  HoverCardTrigger,
} from '@oakoss/ui/components/ui/overlays/hover-card';
import { Link } from 'react-aria-components';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import {
  HoverCardDemo,
  type HoverCardDemoProps,
  settledCard,
} from './hover-card-demo';
import { wait } from './tooltip-demo';

const meta = {
  render: (args) => <HoverCardDemo {...args} />,
  title: 'Overlays/HoverCard',
} satisfies Meta<HoverCardDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// The card is a named dialog 8px below the trigger, on the popover layer, and
// describes the trigger while open.
export const Default: Story = {
  args: { defaultOpen: true },
  play: async () => {
    const { box, card, trigger, triggerBox } = await settledCard();
    await expect(card).toHaveAttribute('data-slot', 'hover-card-content');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAccessibleDescription(
      'Ada Lovelace Wrote the first program. Follow',
    );
    await expect(Math.abs(box.top - triggerBox.bottom - 8)).toBeLessThan(1);
    await expect(box.width).toBe(256);
    const style = getComputedStyle(card);
    await expect(style.zIndex).toBe('1400');
    // Popover's surface, with a gap between the card's lines.
    await expect(style.paddingTop).toBe('16px');
    await expect(style.rowGap).toBe('16px');
  },
};

// Keyboard focus opens the card after the delay; Tab moves into it, and Escape
// closes it and returns focus to the trigger.
export const Keyboard: Story = {
  play: async () => {
    await userEvent.tab();
    const trigger = screen.getByRole('link', { name: '@ada' });
    await expect(trigger).toHaveFocus();
    await settledCard();
    await userEvent.tab();
    await expect(screen.getByRole('link', { name: 'Follow' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(screen.queryByRole('dialog')).toBeNull();
    });
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });
  },
};

// Hover keeps React Aria's 600ms open and 200ms close delays.
export const HoverDelays: Story = {
  play: async () => {
    const trigger = screen.getByRole('link', { name: '@ada' });
    // As with tooltips, wait out the shared warm-up and set pointer input.
    await wait(600);
    await userEvent.click(document.body);
    await userEvent.hover(trigger);
    await wait(400);
    await expect(screen.queryByRole('dialog')).toBeNull();
    await screen.findByRole('dialog', undefined, { timeout: 600 });
    await userEvent.unhover(trigger);
    await wait(100);
    await expect(screen.getByRole('dialog')).not.toHaveAttribute(
      'data-exiting',
    );
    await waitFor(
      async () => {
        await expect(screen.queryByRole('dialog')).toBeNull();
      },
      { timeout: 500 },
    );
  },
};

export const Arrow: Story = {
  args: { defaultOpen: true, showArrow: true },
  play: async () => {
    const { box, triggerBox } = await settledCard();
    await expect(Math.abs(box.top - triggerBox.bottom - 12)).toBeLessThan(1);
    const svg = document.querySelector('[data-slot=popover-arrow] svg');
    if (!(svg instanceof SVGElement)) throw new Error('No arrow');
    await expect(getComputedStyle(svg).rotate).toBe('180deg');
  },
};

export const ZIndexOverride: Story = {
  args: { className: 'z-(--z-toast)', defaultOpen: true },
  play: async () => {
    const { card } = await settledCard();
    await expect(getComputedStyle(card).zIndex).toBe('1350');
  },
};

// Inside an open dialog the card stays out of the content React Aria makes
// inert, so its link stays reachable.
export const InsideDialog: Story = {
  play: async () => {
    const card = await screen.findByRole('dialog', { name: 'Grace Hopper' });
    await expect(card.closest('[inert], [aria-hidden=true]')).toBeNull();
    screen.getByRole('link', { name: '@grace' }).focus();
    await userEvent.tab();
    await expect(screen.getByRole('link', { name: 'Profile' })).toHaveFocus();
  },
  render: () => (
    <Dialog defaultOpen showCloseButton={false}>
      <DialogTitle>Team</DialogTitle>
      <HoverCardTrigger defaultOpen>
        <Link href="#grace">@grace</Link>
        <HoverCard aria-label="Grace Hopper">
          <p>Built the first compiler.</p>
          <Link href="#grace-profile">Profile</Link>
        </HoverCard>
      </HoverCardTrigger>
    </Dialog>
  ),
};

// Windows High Contrast keeps the card's border.
export const ForcedColors: Story = {
  args: { defaultOpen: true },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const { card } = await settledCard();
    await expect(getComputedStyle(card).borderTopWidth).toBe('1px');
  },
  tags: ['forced-colors'],
};
