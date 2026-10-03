import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button, buttonStyles } from '@oakoss/ui/components/ui/inputs/button';
import { Link } from 'react-aria-components';
import { expect, fn, userEvent } from 'storybook/test';

const meta = {
  args: { children: 'Save', onPress: fn<() => void>() },
  component: Button,
  title: 'Inputs/Button/States',
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Pending: Story = {
  args: { isPending: true },
  play: async ({ args, canvas }) => {
    const button = canvas.getByRole('button', { name: /save/iu });
    const progress = canvas.getByRole('progressbar', { name: 'Pending' });
    await expect(button).toContainElement(progress);
    await expect(button).toHaveAttribute('data-pending');
    const label = canvas.getByText('Save');
    await expect(getComputedStyle(label).opacity).toBe('0');
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(button);
    await expect(args.onPress).not.toHaveBeenCalled();
    await expect(button).toHaveFocus();
  },
};

export const PendingLabel: Story = {
  args: { isPending: true, pendingLabel: 'Saving' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('progressbar', { name: 'Saving' }),
    ).toBeVisible();
  },
};

export const PendingKeepsWidth: Story = {
  args: { children: 'Save changes' },
  play: async ({ canvas }) => {
    const [idle, pending] = canvas
      .getAllByRole('button')
      .map((button) => button.getBoundingClientRect().width);
    await expect(pending).toBe(idle);
  },
  render: (args) => (
    <div className="flex gap-3">
      <Button {...args} />
      <Button {...args} isPending />
    </div>
  ),
};

// The loader is positioned against the button even without the hit-area
// recipe, which also sets `relative`.
export const PendingWithoutTargetSize: Story = {
  args: { isPending: true, targetSize: false },
  play: async ({ canvas }) => {
    const button = canvas
      .getByRole('button', { name: /save/iu })
      .getBoundingClientRect();
    const loader = canvas.getByRole('progressbar').getBoundingClientRect();
    await expect(loader.left).toBeGreaterThanOrEqual(button.left);
    await expect(loader.right).toBeLessThanOrEqual(button.right);
  },
};

export const PendingIgnoresHover: Story = {
  args: { isPending: true },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /save/iu });
    const rest = getComputedStyle(button).backgroundColor;
    await userEvent.hover(button);
    for (const animation of button.getAnimations()) animation.finish();
    await expect(getComputedStyle(button).backgroundColor).toBe(rest);
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Save' });
    await expect(button).toBeDisabled();
    await expect(getComputedStyle(button).opacity).toBe('0.5');
    await expect(getComputedStyle(button).pointerEvents).toBe('none');
  },
};

export const DisabledLink: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByText('Docs');
    await expect(getComputedStyle(link).opacity).toBe('0.5');
  },
  render: () => (
    <Link className={buttonStyles({ variant: 'outline' })} href="#" isDisabled>
      Docs
    </Link>
  ),
};
