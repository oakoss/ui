import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  HoverCard,
  HoverCardTrigger,
} from '@oakoss/ui/components/ui/overlays/hover-card';
import { useEffect, useState } from 'react';
import { Link } from 'react-aria-components';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { stayedOpen } from './dialog-demo';
import { hoverAt, hoverFresh, leave, slowTimeout, wait } from './overlay-test';

type ToggleDemoProps = {
  controlled?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  // A consumer that holds isOpen fixed and ignores onOpenChange.
  fixedOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

// Lets a play function disable the trigger without moving the pointer or
// focus, either of which would request a close on its own.
const toggle: { disable?: () => void } = {};

function disable() {
  if (!toggle.disable) throw new Error('ToggleDemo is not mounted');
  toggle.disable();
}

// A button outside the card toggles isDisabled while the story runs.
function ToggleDemo({
  controlled = false,
  defaultOpen,
  disabled = false,
  fixedOpen,
  onOpenChange,
}: ToggleDemoProps) {
  const [isDisabled, setIsDisabled] = useState(disabled);
  const [isOpen, setIsOpen] = useState(false);
  useDisableCue(setIsDisabled);
  let state: {
    defaultOpen?: boolean;
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
  } = { defaultOpen, onOpenChange };
  if (fixedOpen !== undefined) state = { isOpen: fixedOpen, onOpenChange };
  else if (controlled) {
    state = {
      isOpen,
      onOpenChange: (isNextOpen: boolean) => {
        setIsOpen(isNextOpen);
        onOpenChange?.(isNextOpen);
      },
    };
  }
  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-6">
      <HoverCardTrigger isDisabled={isDisabled} {...state}>
        <Link href="#ada">@ada</Link>
        <HoverCard aria-label="Ada Lovelace">
          Wrote the first program.
        </HoverCard>
      </HoverCardTrigger>
      <Button
        onPress={() => {
          setIsDisabled((value) => !value);
        }}
        variant="outline"
      >
        {isDisabled ? 'Enable' : 'Disable'}
      </Button>
    </div>
  );
}

function useDisableCue(setIsDisabled: (isDisabled: boolean) => void) {
  useEffect(() => {
    toggle.disable = () => {
      setIsDisabled(true);
    };
    return () => {
      toggle.disable = undefined;
    };
  }, [setIsDisabled]);
}

const meta = {
  args: { onOpenChange: fn<(isOpen: boolean) => void>() },
  render: (args) => <ToggleDemo {...args} />,
  title: 'Overlays/HoverCard/Disabled',
} satisfies Meta<ToggleDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

async function expectClosed() {
  await waitFor(async () => {
    await expect(screen.queryByRole('dialog')).toBeNull();
  });
  await expect(link()).toHaveAttribute('aria-expanded', 'false');
}

// Focus while disabled, then re-enabling, leaves the card closed.
async function focusThenEnable() {
  await userEvent.tab();
  await expect(link()).toHaveFocus();
  await wait(800);
  await userEvent.tab();
  await userEvent.click(screen.getByRole('button', { name: 'Enable' }));
  await wait(800);
  await expectClosed();
}

function link() {
  return screen.getByRole('link', { name: '@ada' });
}

export const ReenableAfterFocus: Story = {
  args: { disabled: true },
  play: async ({ args }) => {
    await focusThenEnable();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

export const ReenableAfterFocusControlled: Story = {
  args: { controlled: true, disabled: true },
  play: async ({ args }) => {
    await focusThenEnable();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

// Disabling an open card closes it and reports the close; re-enabling leaves
// it closed.
async function openThenDisable(onOpenChange: unknown) {
  await userEvent.tab();
  await screen.findByRole('dialog', undefined, { timeout: slowTimeout });
  await userEvent.click(screen.getByRole('button', { name: 'Disable' }));
  await expectClosed();
  await expect(onOpenChange).toHaveBeenLastCalledWith(false);
  await userEvent.click(screen.getByRole('button', { name: 'Enable' }));
  // Not even for a moment.
  await expect(screen.queryByRole('dialog')).toBeNull();
  await wait(800);
  await expectClosed();
}

// Opened by hover, disabled as the pointer moves to the toggle, re-enabled.
export const DisableWhileHovered: Story = {
  play: async ({ args }) => {
    await hoverFresh(link());
    await screen.findByRole('dialog', undefined, { timeout: slowTimeout });
    await userEvent.click(screen.getByRole('button', { name: 'Disable' }));
    await expectClosed();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await userEvent.click(screen.getByRole('button', { name: 'Enable' }));
    // Not even for a moment.
    await expect(screen.queryByRole('dialog')).toBeNull();
    await wait(800);
    await expectClosed();
    await leave(link(), 'dialog');
  },
};

// Disabling closes a card that opened warm and was staying open.
export const DisableWarmOpen: Story = {
  play: async ({ args }) => {
    await hoverFresh(link());
    await screen.findByRole('dialog', undefined, { timeout: slowTimeout });
    await leave(link(), 'dialog');
    await hoverAt(link());
    // Present at once: a cold open waits for the delay.
    await stayedOpen(screen.getByRole('dialog'));
    disable();
    await expectClosed();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    // A stuck card remounts mid-exit after unmounting.
    await wait(500);
    await expectClosed();
    await leave(link(), 'dialog');
  },
};

export const DisableWhileOpen: Story = {
  play: async ({ args }) => {
    await openThenDisable(args.onOpenChange);
  },
};

export const DisableWhileOpenControlled: Story = {
  args: { controlled: true },
  play: async ({ args }) => {
    await openThenDisable(args.onOpenChange);
  },
};

// Disabling a card that isn't open reports nothing.
export const DisableWhileClosed: Story = {
  play: async ({ args }) => {
    await userEvent.click(screen.getByRole('button', { name: 'Disable' }));
    await wait(100);
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

// A trigger mounted disabled ignores defaultOpen, reports nothing, and stays
// closed once enabled.
export const MountedDisabled: Story = {
  args: { defaultOpen: true, disabled: true },
  play: async ({ args }) => {
    await expectClosed();
    await userEvent.click(screen.getByRole('button', { name: 'Enable' }));
    await expect(screen.queryByRole('dialog')).toBeNull();
    await wait(800);
    await expectClosed();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
  },
};

// Mounted disabled with a controlled isOpen of true: hidden, nothing reported,
// shown once enabled.
export const MountedDisabledControlled: Story = {
  args: { disabled: true, fixedOpen: true },
  play: async ({ args }) => {
    await wait(100);
    await expectClosed();
    await expect(args.onOpenChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Enable' }));
    await screen.findByRole('dialog');
  },
};

// A controlled false wins over hover.
export const ControlledClosed: Story = {
  args: { fixedOpen: false },
  play: async () => {
    await hoverFresh(link());
    await wait(1000);
    await expectClosed();
    // The ignored hover still warmed React Aria up.
    await leave(link(), 'dialog');
  },
};

// A consumer that keeps isOpen true sees the card hidden while disabled and
// back once enabled.
export const ControlledOpenReenabled: Story = {
  args: { fixedOpen: true },
  play: async ({ args }) => {
    await screen.findByRole('dialog');
    await userEvent.click(screen.getByRole('button', { name: 'Disable' }));
    await expectClosed();
    await expect(args.onOpenChange).toHaveBeenLastCalledWith(false);
    await userEvent.click(screen.getByRole('button', { name: 'Enable' }));
    await screen.findByRole('dialog');
  },
};
