import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, waitFor } from 'storybook/test';

import { part } from '#/helpers/parts';
import { parkPointer } from '#/helpers/pointer';
import { atViewportSize, atViewportWidth } from '#/helpers/viewport';
import { finished } from '#/overlays/overlay-test';

import { Demo, resetDemoStore } from './toast-demo';
import { showThree } from './toast-stack-demo';

const meta = {
  beforeEach: resetDemoStore,
  component: Demo,
  title: 'Feedback/Toast/Phone',
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

// Whether the toast shows whole inside the region.
function fits(toast: HTMLElement | undefined) {
  if (!toast) return false;
  const inner = toast.getBoundingClientRect();
  const outer = region().getBoundingClientRect();
  return inner.top >= outer.top - 1 && inner.bottom <= outer.bottom + 1;
}

function region() {
  return part('toast-viewport');
}

// Under the sm breakpoint the stack spans the screen; above it, it keeps its
// width in its corner.
export const FullWidthOnPhone: Story = {
  play: async () => {
    await showThree();
    await expect(region().getBoundingClientRect().width).toBe(384);
    await atViewportWidth(500, async () => {
      await waitFor(async () => {
        await expect(region().getBoundingClientRect().width).toBe(500);
      });
    });
  },
};

// Opens a stack taller than a 200px screen with the keyboard (F6), then
// checks it scrolls from its newest toast to its oldest.
async function scrollsFromNewest(side: 'bottom' | 'top') {
  await parkPointer();
  const toasts = await showThree();
  const [newest, , oldest] = toasts;
  await expect(region()).not.toHaveAttribute('data-scrollable');
  await userEvent.keyboard('{F6}');
  await waitFor(async () => {
    await expect(region()).toHaveAttribute('data-scrollable');
  });
  await Promise.all(toasts.map((toast) => finished(toast)));
  await expect(region()).toHaveFocus();
  await expect(region()).toHaveAttribute('tabindex', '0');
  // The ring sits inside the region's edge, which is the screen's.
  await expect(getComputedStyle(region()).outlineOffset).toBe('-3px');
  const box = region().getBoundingClientRect();
  await expect(box.top).toBeGreaterThanOrEqual(0);
  await expect(box.bottom).toBeLessThanOrEqual(200);
  await expect(fits(newest)).toBe(true);
  await expect(fits(oldest)).toBe(false);
  region().scrollTop = (side === 'top' ? 1 : -1) * region().scrollHeight;
  await waitFor(async () => {
    await expect(fits(oldest)).toBe(true);
  });
}

// An open stack taller than the screen scrolls, starting at the newest
// toast, and its oldest is reachable; the region is then a tab stop.
export const OverflowScrolls: Story = {
  play: async () => {
    await atViewportSize(400, 200, async () => {
      await scrollsFromNewest('bottom');
    });
  },
};

export const OverflowScrollsTop: Story = {
  args: { placement: 'top end' },
  play: async () => {
    await atViewportSize(400, 200, async () => {
      await scrollsFromNewest('top');
    });
  },
};

// A screen that shrinks under an open stack, as when a phone turns, makes it
// scroll; the region follows the visible viewport's height.
export const ShrinkAfterMountScrolls: Story = {
  play: async () => {
    await parkPointer();
    const toasts = await showThree();
    await userEvent.hover(region());
    await Promise.all(toasts.map((toast) => finished(toast)));
    await expect(region()).not.toHaveAttribute('data-scrollable');
    // The same width, so the toasts keep their heights.
    await atViewportSize(innerWidth, 200, async () => {
      await waitFor(async () => {
        await expect(region()).toHaveAttribute('data-scrollable');
      });
      await expect(region().style.getPropertyValue('--toaster-viewport')).toBe(
        '200px',
      );
      await expect(region().style.getPropertyValue('--toaster-bottom')).toBe(
        '0px',
      );
      await expect(region().getBoundingClientRect().height).toBe(200);
    });
  },
};

// Tabbing to a toast scrolls it into view.
export const TabScrollsToToast: Story = {
  play: async () => {
    await atViewportSize(400, 200, async () => {
      await parkPointer();
      const toasts = await showThree();
      const oldest = toasts.at(-1);
      region().focus();
      await waitFor(async () => {
        await expect(region()).toHaveAttribute('data-scrollable');
      });
      await Promise.all(toasts.map((toast) => finished(toast)));
      await expect(fits(oldest)).toBe(false);
      oldest?.focus();
      await waitFor(async () => {
        await expect(fits(oldest)).toBe(true);
      });
    });
  },
};

// While the stack scrolls, a vertical drag on a toast scrolls it rather than
// swiping; a horizontal swipe is still the toast's.
export const ScrollingStackPansVertically: Story = {
  play: async () => {
    await atViewportSize(400, 200, async () => {
      await parkPointer();
      const [newest] = await showThree();
      await userEvent.hover(region());
      await waitFor(async () => {
        await expect(region()).toHaveAttribute('data-scrollable');
      });
      await expect(newest && getComputedStyle(newest).touchAction).toBe(
        'pan-y pinch-zoom',
      );
      await expect(getComputedStyle(region()).overflowY).toBe('auto');
      await userEvent.unhover(region());
      await waitFor(async () => {
        await expect(region()).not.toHaveAttribute('data-scrollable');
      });
      await expect(newest && getComputedStyle(newest).touchAction).toBe(
        'pinch-zoom',
      );
      // Only an overflowing stack scrolls or clips its height, so a toast
      // swiped out past the region's edge can't make it scrollable, and one
      // sliding into place isn't cut off.
      await expect(getComputedStyle(region()).overflowY).toBe('visible');
      await expect(getComputedStyle(region()).overflowX).toBe('clip');
    });
  },
};
