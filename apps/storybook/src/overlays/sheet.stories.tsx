import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, screen, userEvent } from 'storybook/test';

import { closed } from './dialog-demo';
import {
  expectEdge,
  settledPanel,
  SheetDemo,
  type SheetDemoProps,
} from './sheet-demo';

const meta = {
  args: { defaultOpen: true },
  render: (args) => <SheetDemo {...args} />,
  title: 'Overlays/Sheet',
} satisfies Meta<SheetDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// The default side, end, is the right edge in a left-to-right page.
export const Default: Story = {
  play: async () => {
    const { box, panel } = await expectEdge('right');
    const { dialog, overlay } = await settledPanel();
    await expect(panel).toHaveAttribute('data-side', 'end');
    await expect(overlay).toHaveAttribute('data-side', 'end');
    await expect(Math.round(box.height)).toBe(innerHeight);
    await expect(box.width).toBe(384);
    await expect(screen.getByRole('button', { name: 'Close' })).toBeVisible();
    await expect(dialog).toHaveAttribute('data-slot', 'sheet');
    await expect(screen.getByRole('button', { name: 'Done' })).toHaveAttribute(
      'data-slot',
      'sheet-close',
    );
    // SheetBody scrolls between the header and footer; the panel doesn't.
    const body = dialog.querySelector('[data-slot=dialog-body]');
    if (!(body instanceof HTMLElement)) throw new Error('No body');
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    await expect(panel.scrollHeight).toBe(panel.clientHeight);
    const slots = [...dialog.querySelectorAll<HTMLElement>('[data-slot]')].map(
      (element) => element.dataset.slot,
    );
    await expect(slots).toEqual(
      expect.arrayContaining([
        'sheet-header',
        'sheet-title',
        'sheet-description',
        'dialog-body',
        'sheet-footer',
        'sheet-close',
      ]),
    );
  },
};

export const EscapeAndClose: Story = {
  args: { defaultOpen: false },
  play: async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Open filters' }));
    await screen.findByRole('dialog', { name: 'Filters' });
    await userEvent.keyboard('{Escape}');
    await closed();
    await userEvent.click(screen.getByRole('button', { name: 'Open filters' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Done' }));
    await closed();
  },
};

export const OutsideClickDismisses: Story = {
  play: async () => {
    const { overlay } = await settledPanel();
    await userEvent.click(overlay, { skipHover: true });
    await closed();
  },
};

export const NotDismissable: Story = {
  args: { isDismissable: false },
  play: async () => {
    const { dialog, overlay, panel } = await settledPanel();
    await userEvent.click(overlay, { skipHover: true });
    // Longer than the slide-out, which keeps a closing panel visible.
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 400);
    });
    await expect(panel).not.toHaveAttribute('data-exiting');
    await expect(dialog).toBeInTheDocument();
  },
};

export const CloseLabel: Story = {
  args: { closeLabel: 'Fermer' },
  play: async () => {
    await settledPanel();
    await expect(
      screen.getByRole('button', { name: 'Fermer' }),
    ).toHaveAttribute('data-slot', 'sheet-close');
  },
};

export const WithoutCloseButton: Story = {
  args: { showCloseButton: false },
  play: async () => {
    await settledPanel();
    await expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    await expect(screen.getByRole('button', { name: 'Done' })).toBeVisible();
  },
};

// Windows High Contrast drops the shadow, so the inner edge is a border it
// repaints in a system color.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const { panel } = await settledPanel();
    const style = getComputedStyle(panel);
    await expect(style.borderLeftWidth).toBe('1px');
    await expect(style.borderLeftColor).not.toBe('rgba(0, 0, 0, 0)');
  },
  tags: ['forced-colors'],
};
