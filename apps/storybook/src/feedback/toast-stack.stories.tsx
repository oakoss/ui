import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, spyOn, userEvent, waitFor } from 'storybook/test';

import { part } from '#/helpers/parts';

import { Demo, demoStore, resetDemoStore } from './toast-demo';
import { isCollapsed, isExpanded, showThree } from './toast-stack-demo';

const meta = {
  beforeEach: resetDemoStore,
  component: Demo,
  title: 'Feedback/Toast/Stack',
} satisfies Meta<typeof Demo>;

export default meta;

type Story = StoryObj<typeof meta>;

// Newest in front at the edge; the next two peek behind it, their content
// hidden, until the stack opens.
export const Collapsed: Story = {
  play: async () => {
    const toasts = await showThree();
    await isCollapsed(toasts);
    await expect(toasts[0]).not.toHaveAttribute('data-behind');
    await expect(toasts[1]).toHaveAttribute('data-behind');
    await expect(toasts[2]).toHaveAttribute('data-behind');
  },
};

// A taller toast behind the front one is clipped to the front toast's height
// until the stack opens.
export const TallerBehind: Story = {
  play: async () => {
    const toasts = await showThree('oldest');
    await isCollapsed(toasts);
    await userEvent.hover(part('toast-viewport'));
    await isExpanded(toasts);
  },
};

// Hovering opens the stack, and leaving closes it.
export const HoverExpands: Story = {
  play: async () => {
    const toasts = await showThree();
    await userEvent.hover(part('toast-viewport'));
    await isExpanded(toasts);
    await userEvent.unhover(part('toast-viewport'));
    await isCollapsed(toasts);
  },
};

// Keyboard focus inside the stack opens it; Escape on the region, which F6
// focuses, closes it again.
export const FocusExpands: Story = {
  play: async () => {
    const toasts = await showThree();
    part('toast-viewport').focus();
    await isExpanded(toasts);
    await userEvent.keyboard('{Escape}');
    await isCollapsed(toasts);
    await expect(part('toast-viewport')).toHaveFocus();
  },
};

// Escape closes it to the visible count even with focus still on the region.
export const EscapeHidesPastVisible: Story = {
  args: { visible: 2 },
  play: async () => {
    const toasts = await showThree();
    part('toast-viewport').focus();
    await waitFor(async () => {
      await expect(toasts[2]).not.toHaveAttribute('inert');
    });
    await userEvent.keyboard('{Escape}');
    await isCollapsed(toasts.slice(0, 2));
    await expect(toasts[2]).toHaveAttribute('inert');
  },
};

// A tap opens it on touch screens and pauses the timers; a tap outside
// closes it.
export const TapExpands: Story = {
  play: async () => {
    const pause = spyOn(demoStore, 'pause');
    const resume = spyOn(demoStore, 'resume');
    const toasts = await showThree();
    await userEvent.pointer({ keys: '[TouchA]', target: toasts[0] });
    await isExpanded(toasts);
    await expect(pause).toHaveBeenCalledWith('tap');
    await expect(resume).not.toHaveBeenCalled();
    await userEvent.pointer({ keys: '[TouchA]', target: document.body });
    await isCollapsed(toasts);
    await expect(resume).toHaveBeenCalledWith('tap');
  },
};

// isExpanded keeps the stack open without hover or focus, and the timers run.
export const AlwaysExpanded: Story = {
  args: { isExpanded: true },
  play: async () => {
    const pause = spyOn(demoStore, 'pause');
    const toasts = await showThree();
    await isExpanded(toasts);
    await expect(pause).not.toHaveBeenCalled();
  },
};

const spies: { visible?: ReturnType<typeof spyOn> } = {};

// Past `visible`, a toast waits behind the stack, out of sight and reach,
// its timer held, and moves up when a toast in front closes.
export const VisibleCount: Story = {
  args: { visible: 2 },
  // Spies before the Toaster mounts and hands the store its count.
  beforeEach: () => {
    spies.visible = spyOn(demoStore, 'setVisible');
  },
  play: async () => {
    await expect(spies.visible).toHaveBeenLastCalledWith(2);
    const toasts = await showThree();
    const [newest, middle, oldest] = toasts;
    await expect(newest).not.toHaveAttribute('aria-hidden');
    await expect(middle).not.toHaveAttribute('aria-hidden');
    await expect(oldest).toHaveAttribute('aria-hidden', 'true');
    await expect(oldest).toHaveAttribute('inert');
    demoStore.dismiss(demoStore.visibleToasts[0]?.key);
    await waitFor(async () => {
      await expect(oldest).not.toHaveAttribute('aria-hidden');
    });
    await expect(oldest).not.toHaveAttribute('inert');
  },
};
