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
  settledTooltip,
  TooltipDemo,
  type TooltipDemoProps,
  wait,
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
    // A tooltip closed in the last half second leaves React Aria warmed up,
    // opening the next at once. It opens on hover only after pointer input.
    await wait(600);
    await userEvent.click(document.body);
    await userEvent.hover(trigger);
    await wait(300);
    await expect(screen.queryByRole('tooltip')).toBeNull();
    await screen.findByRole('tooltip', undefined, { timeout: 600 });
    await userEvent.unhover(trigger);
    await wait(300);
    await expect(screen.getByRole('tooltip')).not.toHaveAttribute(
      'data-exiting',
    );
    await waitFor(
      async () => {
        await expect(screen.queryByRole('tooltip')).toBeNull();
      },
      { timeout: 600 },
    );
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

// A consumer's delay and offset reach React Aria.
export const NoDelay: Story = {
  play: async () => {
    await wait(600);
    await userEvent.click(document.body);
    await userEvent.hover(screen.getByRole('button', { name: 'Save' }));
    await wait(100);
    await expect(screen.queryByRole('tooltip')).not.toBeNull();
  },
  render: () => (
    <TooltipTrigger delay={0}>
      <Button variant="outline">Save</Button>
      <Tooltip>Save your changes</Tooltip>
    </TooltipTrigger>
  ),
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

function DisablesLater() {
  const [isDisabled, setIsDisabled] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDisabled(true);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    <TooltipTrigger isDisabled={isDisabled}>
      <Button variant="outline">Save</Button>
      <Tooltip>Save your changes</Tooltip>
    </TooltipTrigger>
  );
}

// Disabling the trigger closes an open tooltip while focus stays on it.
export const DisableWhileOpen: Story = {
  play: async () => {
    await userEvent.tab();
    await expect(screen.getByRole('tooltip')).toBeInTheDocument();
    await wait(1500);
    await expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    await expect(screen.queryByRole('tooltip')).toBeNull();
  },
  render: () => <DisablesLater />,
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
    <TooltipTrigger isOpen onOpenChange={args.onOpenChange}>
      <Button variant="outline">Save</Button>
      <Tooltip>Save your changes</Tooltip>
    </TooltipTrigger>
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
    <TooltipTrigger>
      <Focusable>
        <a href="#shortcuts">Shortcuts</a>
      </Focusable>
      <Tooltip>Every keyboard shortcut</Tooltip>
    </TooltipTrigger>
  ),
};
