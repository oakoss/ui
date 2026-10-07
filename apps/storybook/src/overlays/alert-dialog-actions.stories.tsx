import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';
import { expect, fn, screen, userEvent, waitFor } from 'storybook/test';

import {
  AlertDemo,
  type AlertDemoProps,
  openAlert,
  work,
} from './alert-dialog-demo';
import { closed, dialogParts } from './dialog-demo';

const meta = {
  args: { onError: fn<(error: unknown) => void>() },
  render: (args) => <AlertDemo {...args} />,
  title: 'Overlays/Alert Dialog/Actions',
} satisfies Meta<AlertDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

async function pressDelete() {
  const action = screen.getByRole('button', { name: 'Delete' });
  await userEvent.click(action);
  return action;
}

// After a failure the dialog is still open: its exit never starts, and Cancel
// still closes it.
async function stillOpen() {
  const dialog = screen.getByRole('alertdialog');
  await expect(dialogParts(dialog, 'alert-dialog').content).not.toHaveAttribute(
    'data-exiting',
  );
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  await closed('alertdialog');
}

// Without onError, a failure goes to reportError, which dispatches an error
// event on window.
export const DefaultReportsError: Story = {
  args: { onError: undefined },
  play: async () => {
    const reported: unknown[] = [];
    const listener = (event: ErrorEvent) => {
      event.preventDefault();
      reported.push(event.error);
    };
    addEventListener('error', listener);
    try {
      await openAlert();
      await pressDelete();
      await waitFor(async () => {
        await expect(reported).toHaveLength(1);
      });
      await expect(reported[0]).toHaveProperty('message', 'Unreported failure');
    } finally {
      removeEventListener('error', listener);
    }
    await stillOpen();
  },
  render: (args) => (
    <AlertDemo
      {...args}
      onAction={() => {
        throw new Error('Unreported failure');
      }}
    />
  ),
};

// Without onAction, or with a synchronous one, the action closes at once.
export const SyncAction: Story = {
  play: async ({ canvas }) => {
    await openAlert();
    await pressDelete();
    await closed('alertdialog');
    await expect(canvas.getByText('Deleted 1 time')).toBeVisible();
  },
  render: function Render(args) {
    const [count, setCount] = useState(0);
    return (
      <>
        <AlertDemo {...args} onAction={() => setCount((value) => value + 1)} />
        <p>Deleted {count} time</p>
      </>
    );
  },
};

// While the promise is pending the action shows its pending state, Cancel is
// disabled and Escape doesn't dismiss; it closes once the promise resolves.
export const AsyncAction: Story = {
  play: async () => {
    work.current = Promise.withResolvers<null>();
    await openAlert();
    const action = await pressDelete();
    await expect(action).toHaveAttribute('data-pending');
    await expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    work.current.resolve(null);
    await closed('alertdialog');
  },
  render: (args) => (
    <AlertDemo {...args} onAction={() => work.current.promise} />
  ),
};

// Even with isDismissable, a click outside doesn't close a pending dialog.
export const OutsideClickWhilePending: Story = {
  args: { isDismissable: true },
  play: async () => {
    work.current = Promise.withResolvers<null>();
    const { content, overlay } = dialogParts(await openAlert(), 'alert-dialog');
    await pressDelete();
    await userEvent.click(overlay, { skipHover: true });
    await expect(content).not.toHaveAttribute('data-exiting');
    work.current.resolve(null);
    await closed('alertdialog');
  },
  render: (args) => (
    <AlertDemo {...args} onAction={() => work.current.promise} />
  ),
};

// A rejected promise leaves the dialog open, out of its pending state, and
// hands the error to onError.
export const FailedAction: Story = {
  play: async ({ args }) => {
    work.current = Promise.withResolvers<null>();
    await openAlert();
    const action = await pressDelete();
    await expect(action).toHaveAttribute('data-pending');
    const error = new Error('Network error');
    work.current.reject(error);
    await waitFor(async () => {
      await expect(action).not.toHaveAttribute('data-pending');
    });
    await expect(args.onError).toHaveBeenCalledWith(error);
    await stillOpen();
  },
  render: (args) => (
    <AlertDemo {...args} onAction={() => work.current.promise} />
  ),
};

// A synchronous throw takes the same path as a rejection.
export const ThrowingAction: Story = {
  play: async ({ args }) => {
    await openAlert();
    await pressDelete();
    await expect(args.onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid state' }),
    );
    await stillOpen();
  },
  render: (args) => (
    <AlertDemo
      {...args}
      onAction={() => {
        throw new Error('Invalid state');
      }}
    />
  ),
};

// A promise-like value that isn't a native Promise also holds the dialog open
// until it settles.
export const ThenableAction: Story = {
  play: async () => {
    work.current = Promise.withResolvers<null>();
    await openAlert();
    const action = await pressDelete();
    await expect(action).toHaveAttribute('data-pending');
    work.current.resolve(null);
    await closed('alertdialog');
  },
  render: (args) => (
    <AlertDemo
      {...args}
      onAction={() => ({
        // oxlint-disable-next-line unicorn/no-thenable -- the thenable is the case under test
        then: (resolve: (value: null) => void) =>
          void work.current.promise.then(resolve),
      })}
    />
  ),
};

// A function with a then method is a thenable too.
export const CallableThenableAction: Story = {
  play: ThenableAction.play,
  render: (args) => (
    <AlertDemo
      {...args}
      onAction={() =>
        Object.assign(() => undefined, {
          // oxlint-disable-next-line unicorn/no-thenable -- the thenable is the case under test
          then: (resolve: (value: null) => void) =>
            void work.current.promise.then(resolve),
        })
      }
    />
  ),
};
