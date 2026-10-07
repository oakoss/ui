import type { Meta, StoryObj } from '@storybook/react-vite';

import { Dialog, DialogTitle } from '@oakoss/ui/components/ui/overlays/dialog';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { closed, visible } from './dialog-demo';
import {
  PopoverDemo,
  type PopoverDemoProps,
  settledPopover,
} from './popover-demo';

const meta = {
  args: { defaultOpen: true },
  render: (args) => <PopoverDemo {...args} />,
  title: 'Overlays/Popover',
} satisfies Meta<PopoverDemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

// The title names the popover's dialog, and like Dialog the description isn't
// linked, so a long popover isn't read in full on open. The panel sits 8px
// below the trigger on the popover layer.
export const Default: Story = {
  play: async () => {
    const { box, dialog, panel, trigger } = await settledPopover();
    await expect(dialog).not.toHaveAttribute('aria-describedby');
    await expect(screen.getByText('Set the layer’s size.')).toBeVisible();
    await expect(dialog).toHaveAttribute('data-slot', 'popover');
    await expect(panel).toHaveAttribute('data-placement', 'bottom');
    await expect(Math.round(box.top - trigger.bottom)).toBe(8);
    await expect(getComputedStyle(panel).zIndex).toBe('1400');
    await expect(box.width).toBe(288);
  },
};

export const EscapeRestoresFocus: Story = {
  args: { defaultOpen: false },
  play: async () => {
    const trigger = screen.getByRole('button', { name: 'Open settings' });
    await userEvent.click(trigger);
    await settledPopover();
    await userEvent.keyboard('{Escape}');
    await closed();
    await waitFor(async () => {
      await expect(trigger).toHaveFocus();
    });
  },
};

export const OutsideClickDismisses: Story = {
  play: async () => {
    await settledPopover();
    await userEvent.click(document.body, { skipHover: true });
    await closed();
  },
};

// A consumer's z-index class wins over the layer token.
export const ZIndexOverride: Story = {
  args: { className: 'z-(--z-toast)' },
  play: async () => {
    const { panel } = await settledPopover();
    await expect(getComputedStyle(panel).zIndex).toBe('1350');
  },
};

// A consumer's inline z-index still wins over the class.
export const StyleZIndex: Story = {
  args: { style: { zIndex: 1350 } },
  play: async () => {
    const { panel } = await settledPopover();
    await expect(getComputedStyle(panel).zIndex).toBe('1350');
  },
};

// A consumer's offset wins over the arrow's.
export const Offset: Story = {
  args: { offset: 20, showArrow: true },
  play: async () => {
    const { box, trigger } = await settledPopover();
    await expect(Math.round(box.top - trigger.bottom)).toBe(20);
  },
};

// Opened from an open Dialog, the popover stacks above it and stays reachable
// while React Aria hides the dialog behind it.
export const InsideDialog: Story = {
  play: async () => {
    await screen.findByRole('dialog', { name: 'Layers' });
    await userEvent.click(
      screen.getByRole('button', { name: 'Open settings' }),
    );
    const { dialog, panel } = await settledPopover();
    await expect(panel.closest('[inert], [aria-hidden=true]')).toBeNull();
    await expect(getComputedStyle(panel).zIndex).toBe('1400');
    await expect(
      screen.getByText('Layers').closest('[inert], [aria-hidden=true]'),
    ).not.toBeNull();
    await waitFor(async () => {
      await expect(dialog.contains(document.activeElement)).toBe(true);
    });
  },
  render: (args) => (
    <Dialog defaultOpen showCloseButton={false}>
      <DialogTitle>Layers</DialogTitle>
      <PopoverDemo {...args} defaultOpen={false} />
    </Dialog>
  ),
};

export const LabelWithoutTitle: Story = {
  args: { 'aria-label': 'Layer size' },
  play: async () => {
    await visible(await screen.findByRole('dialog', { name: 'Layer size' }));
  },
};

// `aria-describedby` reaches the dialog, so a popover can opt in to being
// described.
export const DescribedBy: Story = {
  args: {
    'aria-describedby': 'layer-size-description',
    descriptionId: 'layer-size-description',
  },
  play: async () => {
    const { dialog } = await settledPopover();
    await expect(dialog).toHaveAccessibleDescription('Set the layer’s size.');
  },
};
