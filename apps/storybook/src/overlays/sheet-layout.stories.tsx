import type { Meta, StoryObj } from '@storybook/react-vite';

import { I18nProvider } from 'react-aria-components';
import { expect, screen } from 'storybook/test';

import { visible } from './dialog-demo';
import {
  expectEdge,
  px,
  settledPanel,
  SheetDemo,
  type SheetDemoProps,
} from './sheet-demo';

const meta = {
  args: { defaultOpen: true },
  render: (args) => <SheetDemo {...args} />,
  title: 'Overlays/Sheet/Layout',
} satisfies Meta<SheetDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Start: Story = {
  args: { side: 'start' },
  play: async () => {
    await expectEdge('left');
  },
};

// In a right-to-left page, end is the left edge and start the right.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    await expectEdge('left');
  },
};

export const StartRightToLeft: Story = {
  args: { side: 'start' },
  globals: { locale: 'ar-EG' },
  play: async () => {
    await expectEdge('right');
  },
};

// The page's `dir` wins where React Aria's locale disagrees with it, as with
// no I18nProvider and a browser set to Arabic.
export const DirectionMismatch: Story = {
  play: async () => {
    await expectEdge('right');
  },
  render: (args) => (
    <I18nProvider locale="ar-EG">
      <SheetDemo {...args} />
    </I18nProvider>
  ),
};

export const Small: Story = {
  args: { size: 'sm' },
  play: async () => {
    const { box, panel } = await settledPanel();
    await expect(panel).toHaveAttribute('data-size', 'sm');
    await expect(box.width).toBe(320);
  },
};

export const Large: Story = {
  args: { size: 'lg' },
  play: async () => {
    const { box } = await settledPanel();
    await expect(box.width).toBe(512);
  },
};

// A bottom sheet spans the width, fits its content, and rounds its top
// corners.
export const Bottom: Story = {
  args: { rows: 3, side: 'bottom' },
  play: async () => {
    const { box, panel } = await expectEdge('bottom');
    const style = getComputedStyle(panel);
    await expect(box.top).toBeGreaterThan(0);
    await expect(box.width).toBe(innerWidth);
    await expect(style.borderTopLeftRadius).not.toBe('0px');
    await expect(style.borderBottomLeftRadius).toBe('0px');
  },
};

export const Top: Story = {
  args: { rows: 3, side: 'top' },
  play: async () => {
    const { box, panel } = await expectEdge('top');
    await expect(box.bottom).toBeLessThan(innerHeight);
    await expect(box.width).toBe(innerWidth);
    await expect(getComputedStyle(panel).borderBottomLeftRadius).not.toBe(
      '0px',
    );
  },
};

// Long content stops at the viewport and scrolls inside.
export const TallTop: Story = {
  args: { side: 'top' },
  play: async () => {
    const { box } = await settledPanel();
    await expect(Math.round(box.height)).toBe(innerHeight);
    await visible(screen.getByRole('button', { name: 'Done' }));
  },
};

export const TallBottom: Story = {
  args: { side: 'bottom' },
  play: async () => {
    const { box } = await settledPanel();
    await expect(Math.round(box.height)).toBe(innerHeight);
    await visible(screen.getByRole('button', { name: 'Done' }));
  },
};

// Without SheetBody, the footer still sits at the bottom of the panel.
export const FooterAtBottom: Story = {
  args: { rows: 3, withBody: false },
  play: async () => {
    const { box, panel } = await settledPanel();
    const done = screen.getByRole('button', { name: 'Done' });
    const style = getComputedStyle(panel);
    const inset = px(style.paddingBottom) + px(style.borderBottomWidth);
    await expect(
      Math.round(box.bottom - inset - done.getBoundingClientRect().bottom),
    ).toBe(0);
  },
};

// Below 31.25rem the body stops scrolling on its own and the panel scrolls
// instead, keeping its bottom padding.
export const ShortScreen: Story = {
  play: async () => {
    const { overlay, panel } = await settledPanel();
    overlay.style.setProperty('--visual-viewport-height', '400px');
    await expect(panel.getBoundingClientRect().height).toBe(400);
    panel.scrollTop = panel.scrollHeight;
    const done = screen.getByRole('button', { name: 'Done' });
    const gap =
      panel.getBoundingClientRect().bottom -
      done.getBoundingClientRect().bottom;
    await expect(gap).toBeGreaterThanOrEqual(
      px(getComputedStyle(panel).paddingBottom),
    );
  },
};

export const SlideIn: Story = {
  play: async () => {
    const { panel } = await settledPanel();
    const style = getComputedStyle(panel);
    await expect(style.transitionDuration).toBe('0.2s');
    await expect(style.transitionProperty).toMatch(/translate|transform/u);
  },
};
