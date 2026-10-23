import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, waitFor } from 'storybook/test';

import { finished } from '#/overlays/overlay-test';

import { Demo, demoStore, gone, resetDemoStore } from './toast-demo';
import { pointer, showOne, sprangBack } from './toast-swipe-demo';

const meta = {
  beforeEach: resetDemoStore,
  component: Demo,
  title: 'Feedback/Toast/Swipe/States',
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

// Only the finger that started the swipe moves the toast; a second one, or
// another touch landing, does nothing.
export const OtherPointersIgnored: Story = {
  play: async () => {
    const { onClose, toast } = await showOne();
    const box = toast.getBoundingClientRect();
    const [x, y] = [box.left + 10, box.top + 10];
    const stray = { isPrimary: false, pointerId: 6 };
    pointer('pointerdown', toast, x, y, 'touch', stray);
    pointer('pointermove', toast, x, y + 100, 'touch', stray);
    await expect(toast).not.toHaveAttribute('data-swiping');
    pointer('pointerup', toast, x, y + 100, 'touch', stray);
    pointer('pointerdown', toast, x, y, 'touch');
    pointer('pointermove', toast, x, y + 5, 'touch');
    const other = { isPrimary: false, pointerId: 8 };
    pointer('pointerdown', toast, x + 20, y, 'touch', other);
    pointer('pointermove', toast, x + 20, y + 200, 'touch', other);
    pointer('pointerup', toast, x + 20, y + 200, 'touch', other);
    await expect(getComputedStyle(toast).transform).toBe(
      'matrix(1, 0, 0, 1, 0, 5)',
    );
    pointer('pointerdown', toast, x, y, 'touch', { pointerId: 9 });
    pointer('pointermove', toast, x, y + 200, 'touch', { pointerId: 9 });
    await expect(getComputedStyle(toast).transform).toBe(
      'matrix(1, 0, 0, 1, 0, 5)',
    );
    pointer('pointerup', toast, x, y + 5, 'touch');
    await sprangBack(toast);
    pointer('pointerup', toast, x, y + 200, 'touch', { pointerId: 9 });
    await sprangBack(toast);
    await expect(onClose).not.toHaveBeenCalled();
  },
};

// A toast pushed out of sight mid-swipe springs back and stays.
export const HiddenMidSwipe: Story = {
  args: { visible: 1 },
  play: async () => {
    const { onClose, toast } = await showOne();
    const box = toast.getBoundingClientRect();
    const [x, y] = [box.left + 10, box.top + 10];
    pointer('pointerdown', toast, x, y, 'touch');
    pointer('pointermove', toast, x, y + 30, 'touch');
    demoStore.show('Newer', { duration: Infinity });
    await waitFor(async () => {
      await expect(toast).toHaveAttribute('aria-hidden', 'true');
    });
    await expect(toast).not.toHaveAttribute('data-swiping');
    pointer('pointerup', toast, x, y + 100, 'touch');
    await finished(toast);
    await expect(toast).not.toHaveAttribute('data-exiting');
    await expect(onClose).not.toHaveBeenCalled();
  },
};

// A toast closed mid-swipe still fades out.
export const ClosedMidSwipe: Story = {
  play: async () => {
    const { toast } = await showOne();
    const box = toast.getBoundingClientRect();
    pointer('pointerdown', toast, box.left + 10, box.top + 10, 'touch');
    pointer('pointermove', toast, box.left + 10, box.top + 40, 'touch');
    demoStore.dismiss();
    await waitFor(async () => {
      await expect(toast).toHaveAttribute('data-exiting');
    });
    await expect(toast).not.toHaveAttribute('data-swiping');
    await expect(
      toast
        .getAnimations()
        .map((animation) =>
          animation instanceof CSSTransition
            ? animation.transitionProperty
            : '',
        ),
    ).toContain('opacity');
    // A closing toast takes no new swipe.
    pointer('pointerdown', toast, box.left + 10, box.top + 10, 'touch');
    pointer('pointermove', toast, box.left + 10, box.top + 60, 'touch');
    await expect(toast).not.toHaveAttribute('data-swiping');
    pointer('pointerup', toast, box.left + 10, box.top + 60, 'touch');
    await gone('Saved');
  },
};
