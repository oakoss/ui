import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  HoverCard,
  HoverCardTrigger,
} from '@oakoss/ui/components/ui/overlays/hover-card';
import { useEffect, useState } from 'react';
import { Link } from 'react-aria-components';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import { slowTimeout, wait } from './overlay-test';

type CallbackDemoProps = {
  // Disables the trigger and swaps onOpenChange in one render, this long after
  // the card opens.
  disableAfter?: number;
  // Disables the trigger on close, from inside onOpenChange.
  disableOnClose?: boolean;
  onOpenChange: (version: number, isOpen: boolean) => void;
};

function CallbackDemo({
  disableAfter,
  disableOnClose = false,
  onOpenChange,
}: CallbackDemoProps) {
  const [isDisabled, setIsDisabled] = useState(false);
  const [version, setVersion] = useState(0);
  const [isShown, setIsShown] = useState(false);
  useEffect(() => {
    const timer =
      disableAfter === undefined || !isShown
        ? undefined
        : setTimeout(() => {
            setIsDisabled(true);
            setVersion(1);
          }, disableAfter);
    return () => {
      clearTimeout(timer);
    };
  }, [disableAfter, isShown]);
  return (
    <div className="grid min-h-80 place-items-center">
      <HoverCardTrigger
        isDisabled={isDisabled}
        onOpenChange={(isOpen) => {
          setIsShown(isOpen);
          onOpenChange(version, isOpen);
          if (disableOnClose && !isOpen) setIsDisabled(true);
        }}
      >
        <Link href="#ada">@ada</Link>
        <HoverCard aria-label="Ada Lovelace">
          Wrote the first program.
        </HoverCard>
      </HoverCardTrigger>
    </div>
  );
}

const meta = {
  args: { onOpenChange: fn<(version: number, isOpen: boolean) => void>() },
  render: (args) => <CallbackDemo {...args} />,
  title: 'Overlays/HoverCard/Callbacks',
} satisfies Meta<CallbackDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// The close from disabling goes to the onOpenChange of the render that
// disabled it, not an earlier one.
export const DisableReportsToCurrentCallback: Story = {
  args: { disableAfter: 300 },
  play: async ({ args }) => {
    await userEvent.tab();
    await screen.findByRole('dialog', undefined, { timeout: slowTimeout });
    await waitFor(
      async () => {
        await expect(args.onOpenChange).toHaveBeenLastCalledWith(1, false);
      },
      { timeout: slowTimeout },
    );
  },
};

// A handler that disables the trigger on close hears the close once.
export const DisableOnCloseReportsOnce: Story = {
  args: { disableOnClose: true },
  play: async ({ args }) => {
    await userEvent.tab();
    await screen.findByRole('dialog', undefined, { timeout: slowTimeout });
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(screen.queryByRole('dialog')).toBeNull();
    });
    await wait(200);
    const closes = args.onOpenChange.mock.calls.filter(([, isOpen]) => !isOpen);
    await expect(closes).toHaveLength(1);
  },
};
