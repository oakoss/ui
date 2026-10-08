import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { Dialog, DialogTitle } from '@oakoss/ui/components/ui/overlays/dialog';
import {
  Tooltip,
  TooltipTrigger,
} from '@oakoss/ui/components/ui/overlays/tooltip';
import { useEffect, useState } from 'react';
import { Focusable } from 'react-aria-components';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import {
  exitStarted,
  expectAfter,
  hoverFresh,
  leave,
  slowTimeout,
} from './overlay-test';
import {
  Centered,
  settledTooltip,
  TooltipDemo,
  type TooltipDemoProps,
} from './tooltip-demo';

const meta = {
  render: (args) => <TooltipDemo {...args} />,
  title: 'Overlays/Tooltip',
} satisfies Meta<TooltipDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// Keyboard focus opens the tooltip at once, and the trigger is described by
// it; Escape closes it and focus stays on the trigger.
export const FocusOpensAtOnce: Story = {
  play: async () => {
    await userEvent.tab();
    const trigger = screen.getByRole('button', { name: 'Save' });
    await expect(trigger).toHaveFocus();
    const tooltip = screen.getByRole('tooltip');
    await expect(trigger).toHaveAccessibleDescription('Save your changes');
    await expect(tooltip).toHaveAttribute('data-slot', 'tooltip-content');
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(screen.queryByRole('tooltip')).toBeNull();
    });
    await expect(trigger).toHaveFocus();
  },
};

// Hover waits half a second to open and half a second to close, so passing
// over a control doesn't flash its tooltip.
export const HoverDelays: Story = {
  play: async () => {
    const trigger = screen.getByRole('button', { name: 'Save' });
    const hovered = await hoverFresh(trigger);
    await expect(screen.queryByRole('tooltip')).toBeNull();
    const tooltip = await expectAfter(hovered, 500, () =>
      screen.findByRole('tooltip', undefined, { timeout: slowTimeout }),
    );
    const left = performance.now();
    await userEvent.unhover(trigger);
    await expect(tooltip).not.toHaveAttribute('data-exiting');
    await expectAfter(left, 500, () => exitStarted(tooltip));
    await leave(trigger, 'tooltip');
  },
};

// Tooltips sit on the tooltip layer, above popovers and toasts.
export const Layer: Story = {
  args: { defaultOpen: true },
  play: async () => {
    const { tooltip } = await settledTooltip();
    await expect(getComputedStyle(tooltip).zIndex).toBe('1600');
  },
};

// A consumer's z-index class or inline z-index wins over the layer.
export const ZIndexOverride: Story = {
  args: { className: 'z-(--z-toast)', defaultOpen: true },
  play: async () => {
    const { tooltip } = await settledTooltip();
    await expect(getComputedStyle(tooltip).zIndex).toBe('1350');
  },
};

export const StyleZIndex: Story = {
  args: { defaultOpen: true, style: { zIndex: 1300 } },
  play: async () => {
    const { tooltip } = await settledTooltip();
    await expect(getComputedStyle(tooltip).zIndex).toBe('1300');
  },
};

export const StyleFunction: Story = {
  args: { defaultOpen: true, style: () => ({ zIndex: 1300 }) },
  play: async () => {
    const { tooltip } = await settledTooltip();
    await expect(getComputedStyle(tooltip).zIndex).toBe('1300');
  },
};

// A consumer's delay and offset reach React Aria. The delay is longer than the
// default, so a dropped prop or a leftover warm-up opens too soon and fails.
export const ConsumerDelay: Story = {
  args: { delay: 1500 },
  play: async () => {
    const trigger = screen.getByRole('button', { name: 'Save' });
    const hovered = await hoverFresh(trigger);
    await expect(screen.queryByRole('tooltip')).toBeNull();
    await expectAfter(hovered, 1500, () =>
      screen.findByRole('tooltip', undefined, { timeout: slowTimeout }),
    );
    await leave(trigger, 'tooltip');
  },
};

export const Offset: Story = {
  args: { defaultOpen: true, offset: 4 },
  play: async () => {
    const { box, trigger } = await settledTooltip();
    await expect(Math.abs(trigger.top - box.bottom - 4)).toBeLessThan(1);
  },
};

// Inside an open dialog the tooltip stays out of the content React Aria makes
// inert, so screen readers and the pointer can still reach it.
export const InsideDialog: Story = {
  play: async () => {
    await screen.findByRole('dialog', { name: 'Layers' });
    await userEvent.tab();
    const trigger = screen.getByRole('button', { name: 'Merge' });
    await expect(trigger).toHaveFocus();
    const tooltip = await screen.findByRole('tooltip');
    await expect(tooltip.closest('[inert], [aria-hidden=true]')).toBeNull();
    await expect(trigger).toHaveAccessibleDescription('Merge the layers');
  },
  render: () => (
    <Dialog defaultOpen showCloseButton={false}>
      <DialogTitle>Layers</DialogTitle>
      <TooltipTrigger>
        <Button variant="outline">Merge</Button>
        <Tooltip>Merge the layers</Tooltip>
      </TooltipTrigger>
    </Dialog>
  ),
};

// Lets a play function disable the trigger once it has seen the tooltip, so
// no timer races a slow runner.
const trigger = { disable: undefined as (() => void) | undefined };

function DisablesOnCue() {
  const [isDisabled, setIsDisabled] = useState(false);
  useEffect(() => {
    trigger.disable = () => {
      setIsDisabled(true);
    };
  }, []);
  return (
    <Centered>
      <TooltipTrigger isDisabled={isDisabled}>
        <Button variant="outline">Save</Button>
        <Tooltip>Save your changes</Tooltip>
      </TooltipTrigger>
    </Centered>
  );
}

// Disabling the trigger closes an open tooltip while focus stays on it.
export const DisableWhileOpen: Story = {
  play: async () => {
    await userEvent.tab();
    await expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    trigger.disable?.();
    await waitFor(
      async () => {
        await expect(screen.queryByRole('tooltip')).toBeNull();
      },
      { timeout: 3000 },
    );
    await expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
  },
  render: () => <DisablesOnCue />,
};

// A controlled tooltip shows from isOpen and reports Escape.
export const Controlled: Story = {
  args: { onOpenChange: fn<(isOpen: boolean) => void>() },
  play: async ({ args }) => {
    await expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    screen.getByRole('button', { name: 'Save' }).focus();
    await userEvent.keyboard('{Escape}');
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
  },
  render: (args) => (
    <Centered>
      <TooltipTrigger isOpen onOpenChange={args.onOpenChange}>
        <Button variant="outline">Save</Button>
        <Tooltip>Save your changes</Tooltip>
      </TooltipTrigger>
    </Centered>
  ),
};

// A trigger that isn't a React Aria control, such as a plain link, needs
// Focusable.
export const FocusableTrigger: Story = {
  play: async () => {
    await userEvent.tab();
    const link = screen.getByRole('link', { name: 'Shortcuts' });
    await expect(link).toHaveFocus();
    await expect(link).toHaveAccessibleDescription('Every keyboard shortcut');
  },
  render: () => (
    <Centered>
      <TooltipTrigger>
        <Focusable>
          <a href="#shortcuts">Shortcuts</a>
        </Focusable>
        <Tooltip>Every keyboard shortcut</Tooltip>
      </TooltipTrigger>
    </Centered>
  ),
};
