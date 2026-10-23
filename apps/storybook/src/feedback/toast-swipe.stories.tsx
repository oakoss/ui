import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { Demo, gone, resetDemoStore } from './toast-demo';
import { pointer, showOne, sprangBack, swipe } from './toast-swipe-demo';

const meta = {
  beforeEach: resetDemoStore,
  component: Demo,
  title: 'Feedback/Toast/Swipe',
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

// The toast follows the finger toward the stack's side, and past 45px it
// leaves that way, closed by the user.
export const SwipeCloses: Story = {
  play: async () => {
    const { onClose, toast } = await showOne();
    const box = toast.getBoundingClientRect();
    pointer('pointerdown', toast, box.left + 10, box.top + 10, 'touch');
    pointer('pointermove', toast, box.left + 10, box.top + 40, 'touch');
    await expect(toast).toHaveAttribute('data-swiping');
    await expect(getComputedStyle(toast).transform).toBe(
      'matrix(1, 0, 0, 1, 0, 30)',
    );
    pointer('pointermove', toast, box.left + 10, box.top + 70, 'touch');
    pointer('pointerup', toast, box.left + 10, box.top + 70, 'touch');
    await expect(toast).not.toHaveAttribute('data-swiping');
    // On past where the finger let go.
    await expect(toast.style.getPropertyValue('--toast-swipe')).toBe(
      'translate(0, calc(60px + 100%))',
    );
    await gone('Saved');
    await expect(onClose).toHaveBeenCalledWith('user');
  },
};

// Toward the edge the stack is aligned to.
export const SwipeTowardAlignedEdge: Story = {
  play: async () => {
    const { toast } = await showOne();
    await swipe(toast, [60, 0]);
    await expect(toast.style.getPropertyValue('--toast-swipe')).toBe(
      'translate(calc(60px + 100%), 0)',
    );
    await gone('Saved');
  },
};

export const StartAligned: Story = {
  args: { placement: 'bottom start' },
  play: async () => {
    const { toast } = await showOne();
    await swipe(toast, [60, 0]);
    await sprangBack(toast);
    await swipe(toast, [-60, 0]);
    await gone('Saved');
  },
};

// In a right-to-left locale, start is the right edge.
export const StartAlignedRightToLeft: Story = {
  args: { placement: 'bottom start' },
  globals: { locale: 'ar-EG' },
  play: async () => {
    const { toast } = await showOne();
    await swipe(toast, [-60, 0]);
    await sprangBack(toast);
    await swipe(toast, [60, 0]);
    await gone('Saved');
  },
};

export const TopSwipesUp: Story = {
  args: { placement: 'top end' },
  play: async () => {
    const { toast } = await showOne();
    await swipe(toast, [0, 60]);
    await sprangBack(toast);
    await swipe(toast, [0, -60]);
    await gone('Saved');
  },
};

// A centered stack has no near inline edge, so it swipes only toward its side.
export const CenteredSwipesOnlyToSide: Story = {
  args: { placement: 'bottom center' },
  play: async () => {
    const { toast } = await showOne();
    await swipe(toast, [100, 0], { ms: 10 });
    await sprangBack(toast);
    await swipe(toast, [-100, 0], { ms: 10 });
    await sprangBack(toast);
    await swipe(toast, [0, 60]);
    await gone('Saved');
  },
};

// A pull away from the edges springs back, however hard.
export const AwayFromEdgesStays: Story = {
  play: async () => {
    const { onClose, toast } = await showOne();
    await swipe(toast, [0, -150], { ms: 10 });
    await sprangBack(toast);
    await swipe(toast, [-150, 0], { ms: 10 });
    await sprangBack(toast);
    await expect(onClose).not.toHaveBeenCalled();
  },
};

// Short of 45px, a slow swipe springs back and a quick flick closes.
export const FlickCloses: Story = {
  play: async () => {
    const { toast } = await showOne();
    await swipe(toast, [0, 30], { ms: 400 });
    await sprangBack(toast);
    await swipe(toast, [0, 30]);
    await gone('Saved');
  },
};

// A cancelled pointer, as when the browser takes over a gesture, springs back.
export const CancelSpringsBack: Story = {
  play: async () => {
    const { toast } = await showOne();
    await swipe(toast, [0, 100], { end: 'pointercancel' });
    await sprangBack(toast);
  },
};

// A mouse drag selects text rather than swiping.
export const MouseDoesNotSwipe: Story = {
  play: async () => {
    const { toast } = await showOne();
    await swipe(toast, [0, 100], { pointerType: 'mouse' });
    await expect(toast).not.toHaveAttribute('data-swiping');
    await sprangBack(toast);
  },
};

// A swipe that starts on a control leaves the toast in place, even on a
// pending button, which lets pointer events through.
export const ControlDoesNotSwipe: Story = {
  play: async () => {
    const { onClose, toast } = await showOne({ hasAction: true });
    const undo = screen.getByRole('button', { name: 'Undo' });
    await swipe(undo, [0, 100]);
    await userEvent.click(undo);
    await waitFor(async () => {
      await expect(undo).toHaveAttribute('data-pending');
    });
    await swipe(undo, [0, 100]);
    await expect(toast).not.toHaveAttribute('data-swiping');
    await expect(getComputedStyle(toast).transform).toBe('none');
    await expect(onClose).not.toHaveBeenCalledWith('user');
  },
};

// The toast swipes again after springing back.
export const SwipesAgain: Story = {
  play: async () => {
    const { toast } = await showOne();
    await swipe(toast, [0, 20], { ms: 400 });
    await sprangBack(toast);
    await swipe(toast, [0, 60]);
    await waitFor(async () => {
      await expect(toast).toHaveAttribute('data-exiting');
    });
  },
};
