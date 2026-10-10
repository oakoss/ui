import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icon from '@oakoss/ui/components/icons';
import { Spinner } from '@oakoss/ui/components/ui/feedback/spinner';
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

// React Aria adds the spinner to a named button's name while it's pending, by
// id, so an icon-only button still says what it is and that it's busy.
export const PendingIconOnly: Story = {
  args: {
    'aria-label': 'Close',
    children: <Icon.X />,
    isPending: true,
    size: 'icon',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Close Pending' }),
    ).toBeVisible();
  },
};

// A Spinner in the button's own content doesn't take the loader's id, so the
// button still names itself with its pending label.
export const PendingWithSpinnerContent: Story = {
  args: {
    'aria-label': 'Sync',
    children: <Spinner label="Syncing" />,
    isPending: true,
    size: 'icon',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Sync Pending' }),
    ).toBeVisible();
    const ids = canvas
      .getAllByRole('progressbar', { hidden: true })
      .map((element) => element.id)
      .filter(Boolean);
    await expect(new Set(ids).size).toBe(ids.length);
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

// In forced colors a disabled button, or a link styled as one, paints like a
// native disabled button: the system's disabled color, unfaded.
export const ForcedColorsDisabled: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const native = getComputedStyle(canvas.getByText('Native'));
    const live = getComputedStyle(canvas.getByText('Live'));
    await expect(native.color).not.toBe(live.color);
    for (const element of [
      canvas.getByRole('button', { name: 'Save' }),
      canvas.getByRole('link', { name: 'Docs' }),
    ]) {
      const style = getComputedStyle(element);
      await expect(style.color).toBe(native.color);
      await expect(style.borderTopColor).toBe(native.color);
      await expect(style.opacity).toBe('1');
    }
  },
  render: () => (
    <div className="flex gap-3">
      <Button isDisabled variant="outline">
        Save
      </Button>
      <Link
        className={buttonStyles({ variant: 'outline' })}
        href="#"
        isDisabled
      >
        Docs
      </Link>
      <Link className={buttonStyles({ variant: 'outline' })} href="#">
        Live
      </Link>
      <button disabled type="button">
        Native
      </button>
    </div>
  ),
  tags: ['forced-colors'],
};
