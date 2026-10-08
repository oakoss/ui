import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import {
  HoverCardDemo,
  type HoverCardDemoProps,
  settledCard,
} from './hover-card-demo';
import {
  exitStarted,
  expectAfter,
  hoverFresh,
  leave,
  slowTimeout,
  wait,
} from './overlay-test';

const meta = {
  render: (args) => <HoverCardDemo {...args} />,
  title: 'Overlays/HoverCard/Props',
} satisfies Meta<HoverCardDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

function link() {
  return screen.getByRole('link', { name: '@ada' });
}

function pointerOn() {
  return hoverFresh(link());
}

// A consumer's delays reach PreviewTrigger. Each is longer than the default,
// so a dropped prop or a leftover warm-up acts too soon and fails.
export const LongOpenDelay: Story = {
  args: { trigger: { delay: 1500 } },
  play: async () => {
    const hovered = await pointerOn();
    await expect(screen.queryByRole('dialog')).toBeNull();
    await expectAfter(hovered, 1500, () =>
      screen.findByRole('dialog', undefined, { timeout: slowTimeout }),
    );
    await leave(link(), 'dialog');
  },
};

export const LongCloseDelay: Story = {
  args: { trigger: { closeDelay: 1500 } },
  play: async () => {
    await pointerOn();
    const card = await screen.findByRole('dialog', undefined, {
      timeout: slowTimeout,
    });
    const left = performance.now();
    await userEvent.unhover(link());
    await expect(card).not.toHaveAttribute('data-exiting');
    await expectAfter(left, 1500, () => exitStarted(card));
    await leave(link(), 'dialog');
  },
};

// Neither hover nor keyboard focus opens a disabled trigger's card.
export const Disabled: Story = {
  args: {
    trigger: {
      isDisabled: true,
      onOpenChange: fn<(isOpen: boolean) => void>(),
    },
  },
  play: async ({ args }) => {
    await pointerOn();
    await wait(1000);
    await expect(screen.queryByRole('dialog')).toBeNull();
    await userEvent.tab();
    await expect(screen.getByRole('link', { name: '@ada' })).toHaveFocus();
    await wait(1000);
    await expect(screen.queryByRole('dialog')).toBeNull();
    await expect(args.trigger?.onOpenChange).not.toHaveBeenCalled();
    // Focus warmed React Aria up; blurring requests the close that cools it.
    await userEvent.tab();
    await leave(link(), 'dialog');
  },
};

// Open state lives on the trigger, so the trigger and card agree.
export const Controlled: Story = {
  args: {
    trigger: { isOpen: true, onOpenChange: fn<(isOpen: boolean) => void>() },
  },
  play: async ({ args }) => {
    const { trigger } = await settledCard();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    trigger.focus();
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(args.trigger?.onOpenChange).toHaveBeenCalledWith(false);
    });
  },
};

export const Offset: Story = {
  args: { defaultOpen: true, offset: 20, showArrow: true },
  play: async () => {
    const { box, triggerBox } = await settledCard();
    await expect(Math.abs(box.top - triggerBox.bottom - 20)).toBeLessThan(1);
  },
};

// A consumer's className and inline z-index win over the defaults.
export const ClassNameWidth: Story = {
  args: { className: 'w-80', defaultOpen: true },
  play: async () => {
    const { box } = await settledCard();
    await expect(box.width).toBe(320);
  },
};

export const StyleZIndex: Story = {
  args: { defaultOpen: true, style: { zIndex: 1350 } },
  play: async () => {
    const { card } = await settledCard();
    await expect(getComputedStyle(card).zIndex).toBe('1350');
  },
};
