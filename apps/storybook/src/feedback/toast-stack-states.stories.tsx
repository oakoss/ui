import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';

import { part } from '#/helpers/parts';

import { Demo, demoStore, resetDemoStore } from './toast-demo';
import {
  forever,
  isCollapsed,
  isExpanded,
  showThree,
  toastTitled,
} from './toast-stack-demo';

const meta = {
  beforeEach: resetDemoStore,
  component: Demo,
  title: 'Feedback/Toast/Stack states',
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

// After Escape closes it, moving into a toast or hovering again reopens it.
export const ReopensAfterEscape: Story = {
  play: async () => {
    const toasts = await showThree();
    part('toast-viewport').focus();
    await userEvent.keyboard('{Escape}');
    await isCollapsed(toasts);
    await userEvent.tab();
    await isExpanded(toasts);
    part('toast-viewport').focus();
    await userEvent.keyboard('{Escape}');
    await isCollapsed(toasts);
    part('toast-viewport').blur();
    await userEvent.hover(part('toast-viewport'));
    await isExpanded(toasts);
    // With focus still on the region, leaving and hovering again reopens it.
    part('toast-viewport').focus();
    await userEvent.keyboard('{Escape}');
    await isCollapsed(toasts);
    await userEvent.unhover(part('toast-viewport'));
    await userEvent.hover(part('toast-viewport'));
    await isExpanded(toasts);
  },
};

// Escape on a focused toast closes it, and focus moves to the next one
// rather than falling out of the stack.
export const CloseMovesFocus: Story = {
  args: { visible: 2 },
  play: async () => {
    const toasts = await showThree();
    toasts[0]?.focus();
    await userEvent.keyboard('{Escape}');
    await waitFor(async () => {
      await expect(document.activeElement).toBe(toasts[1]);
    });
  },
};

// A toast arriving while focus is in the stack doesn't hide the focused one.
export const FocusedStaysShown: Story = {
  args: { visible: 2 },
  play: async () => {
    const toasts = await showThree();
    toasts[1]?.focus();
    demoStore.show('Arrived', forever);
    await waitFor(() => toastTitled('Arrived'));
    await expect(toasts[1]).not.toHaveAttribute('inert');
    await expect(toasts[1]).toHaveFocus();
  },
};

// A toast that grows while the stack is open pushes the older ones along.
export const GrowingToast: Story = {
  args: { isExpanded: true },
  play: async () => {
    const toasts = await showThree('oldest');
    const before = toasts[0]?.offsetHeight ?? 0;
    demoStore.show('Newest', {
      ...forever,
      description: 'Now it has a description.',
      id: demoStore.visibleToasts[0]?.key,
    });
    await waitFor(async () => {
      await expect(toasts[0]?.offsetHeight).toBeGreaterThan(before);
    });
    await isExpanded(toasts);
  },
};

// A tap on a toast's button presses it without holding the stack open: the
// button takes focus, and the stack stays open only while it has focus.
export const TapOnButton: Story = {
  play: async () => {
    const pause = spyOn(demoStore, 'pause');
    const toasts = await showThree();
    const close = within(toasts[0] ?? document.body).getByRole('button', {
      name: 'Close',
    });
    await userEvent.pointer({ keys: '[TouchA]', target: close });
    await expect(pause).not.toHaveBeenCalledWith('expanded');
  },
};

// A tap on a pending action, which stops handling presses, still doesn't
// hold the stack open.
export const TapOnPendingAction: Story = {
  play: async () => {
    const pause = spyOn(demoStore, 'pause');
    demoStore.show('Archiving', {
      action: {
        label: 'Undo',
        onPress: () => Promise.withResolvers<undefined>().promise,
      },
    });
    const undo = await waitFor(() =>
      within(toastTitled('Archiving')).getByRole('button', { name: 'Undo' }),
    );
    await userEvent.pointer({ keys: '[TouchA]', target: undo });
    await waitFor(async () => {
      await expect(undo).toHaveAttribute('data-pending', 'true');
    });
    await userEvent.pointer({ keys: '[TouchA]', target: undo });
    await expect(pause).not.toHaveBeenCalledWith('expanded');
  },
};

// A tapped stack that empties releases its pause.
export const TapReleasedOnEmpty: Story = {
  play: async () => {
    const resume = spyOn(demoStore, 'resume');
    const toasts = await showThree();
    await userEvent.pointer({ keys: '[TouchA]', target: toasts[0] });
    await isExpanded(toasts);
    // Mounting the region resumes it too, so only later calls count.
    resume.mockClear();
    demoStore.dismiss();
    await waitFor(async () => {
      await expect(document.querySelector('[data-slot=toast]')).toBeNull();
    });
    await expect(resume).toHaveBeenCalledWith('expanded');
  },
};
