import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button, buttonStyles } from '@oakoss/ui/components/ui/inputs/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from '@oakoss/ui/components/ui/inputs/button-group';
import { Toggle } from '@oakoss/ui/components/ui/inputs/toggle';
import {
  Dialog,
  DialogTrigger,
} from '@oakoss/ui/components/ui/overlays/dialog';
import {
  Popover,
  PopoverTrigger,
} from '@oakoss/ui/components/ui/overlays/popover';
import { expect, screen, userEvent } from 'storybook/test';

import { whilePressed } from '../press';

const meta = {
  args: { variant: 'outline' },
  component: ButtonGroup,
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Archive</Button>
      <Button>Report</Button>
      <Button>Snooze</Button>
    </ButtonGroup>
  ),
  title: 'Inputs/ButtonGroup/States',
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

// In a vertical group the separator turns horizontal, a visible line across
// the group between stacked Buttons.
export const VerticalSeparator: Story = {
  args: { orientation: 'vertical' },
  play: async ({ canvas }) => {
    const separator = canvas.getByRole('separator');
    await expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    await expect(getComputedStyle(separator).borderTopWidth).toBe('1px');
    const box = separator.getBoundingClientRect();
    const group = separator.parentElement?.getBoundingClientRect();
    await expect(box.width).toBe(group?.width);
    await expect(
      document.elementFromPoint(box.left + box.width / 2, box.top),
    ).toBe(separator);
  },
  render: (args) => (
    <ButtonGroup {...args} variant="solid">
      <Button>Save</Button>
      <ButtonGroupSeparator />
      <Button>Publish</Button>
    </ButtonGroup>
  ),
};

// A pressed Button keeps its size, so it doesn't pull away from its
// neighbors.
export const Press: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Report' });
    const rest = button.getBoundingClientRect().width;
    button.dataset.pressed = 'true';
    await Promise.all(button.getAnimations().map((a) => a.finished));
    await expect(button.getBoundingClientRect().width).toBe(rest);
  },
};

// A plain link styled as a button keeps its size under a real press too,
// where Button's own :active scale would pull it from its neighbors.
export const PressLink: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByText('Docs');
    const rest = link.getBoundingClientRect().width;
    const [isActive, width] = await whilePressed(link, () => [
      link.matches(':active'),
      link.getBoundingClientRect().width,
    ]);
    await expect(isActive).toBe(true);
    await expect(width).toBe(rest);
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Save</Button>
      <a
        className={buttonStyles({ targetSize: false, variant: 'outline' })}
        href="#docs"
        onClick={(event) => {
          event.preventDefault();
        }}
      >
        Docs
      </a>
    </ButtonGroup>
  ),
};

// The focused child rises over its neighbors, so its whole outline shows.
export const FocusRaise: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.tab();
    const report = canvas.getByRole('button', { name: 'Report' });
    await expect(report).toHaveFocus();
    await expect(getComputedStyle(report).zIndex).toBe('10');
  },
};

// A popover opened from the group keeps Button's own defaults: the group
// styles its Buttons, not an overlay's.
export const OverlayInside: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'More' }));
    const inside = await screen.findByRole('button', { name: 'Delete' });
    await expect(inside).toHaveAttribute('data-variant', 'solid');
    await expect(inside).toHaveAttribute('data-size', 'md');
  },
  render: (args) => (
    <ButtonGroup {...args} size="sm">
      <Button>Save</Button>
      <PopoverTrigger>
        <Button>More</Button>
        <Popover aria-label="More actions">
          <Button>Delete</Button>
        </Popover>
      </PopoverTrigger>
    </ButtonGroup>
  ),
};

export const DialogInside: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Share' }));
    const inside = await screen.findByRole('button', { name: 'Copy link' });
    await expect(inside).toHaveAttribute('data-variant', 'solid');
    await expect(inside).toHaveAttribute('data-size', 'md');
    const close = screen.getByRole('button', { name: 'Close' });
    await expect(close).toHaveAttribute('data-variant', 'ghost');
    await expect(close).toHaveAttribute('data-size', 'icon-sm');
  },
  render: (args) => (
    <ButtonGroup {...args} size="sm">
      <Button>Save</Button>
      <DialogTrigger>
        <Button>Share</Button>
        <Dialog aria-label="Share">
          <Button>Copy link</Button>
        </Dialog>
      </DialogTrigger>
    </ButtonGroup>
  ),
};

// A child that isn't a Button, such as a Toggle, has no 44px hit area either.
export const ToggleInside: Story = {
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Bold' });
    const area = getComputedStyle(toggle, '::after');
    await expect(area.minHeight).toBe('0px');
    await expect(area.minWidth).toBe('0px');
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Undo</Button>
      <Toggle variant="outline">Bold</Toggle>
    </ButtonGroup>
  ),
};
