import type { Meta, StoryObj } from '@storybook/react-vite';

import { buttonStyles } from '@oakoss/ui/components/ui/inputs/button';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@oakoss/ui/components/ui/layout/collapsible';
import { expect, userEvent } from 'storybook/test';

import { part } from '../parts';

const meta = {
  component: Collapsible,
  render: (args) => (
    <Collapsible {...args} className="w-80">
      <CollapsibleTrigger className={buttonStyles({ variant: 'outline' })}>
        Order details
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="py-2 text-sm">Ships in two days.</p>
      </CollapsibleContent>
    </Collapsible>
  ),
  title: 'Layout/Collapsible',
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

async function settle() {
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished),
  );
}

// The trigger takes any look and opens the panel, which animates its height.
export const Default: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Order details' });
    await expect(getComputedStyle(trigger).borderTopWidth).toBe('1px');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = part('collapsible-content');
    await expect(
      panel
        .getAnimations()
        .map((animation) =>
          animation instanceof CSSTransition
            ? animation.transitionProperty
            : '',
        ),
    ).toContain('height');
    await expect(getComputedStyle(panel).overflowY).toBe('clip');
    await settle();
    await expect(canvas.getByText('Ships in two days.')).toBeVisible();
  },
};

// Once open, the panel stops clipping, so a control at its edge shows its
// whole focus outline, however it was focused.
export const ContentFocus: Story = {
  args: { defaultExpanded: true },
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Order number' });
    await userEvent.click(field);
    await expect(getComputedStyle(field).outlineStyle).toBe('solid');
    await expect(getComputedStyle(part('collapsible-content')).overflowY).toBe(
      'visible',
    );
  },
  render: (args) => (
    <Collapsible {...args} className="w-80">
      <CollapsibleTrigger>Order details</CollapsibleTrigger>
      <CollapsibleContent className="italic">
        <Input aria-label="Order number" />
      </CollapsibleContent>
    </Collapsible>
  ),
};

export const ContentClassName: Story = {
  play: async () => {
    await expect(part('collapsible-content')).toHaveClass('italic');
  },
  render: ContentFocus.render,
};

// Closed, the panel takes no space and is hidden until found.
export const Closed: Story = {
  play: async () => {
    const panel = part('collapsible-content');
    await expect(panel).toHaveAttribute('hidden', 'until-found');
    await expect(panel.getBoundingClientRect().height).toBe(0);
  },
};

// Without a look of its own, the trigger still shows the focus outline.
export const FocusRing: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(
      getComputedStyle(canvas.getByRole('button', { name: 'Toggle' }))
        .outlineStyle,
    ).toBe('solid');
  },
  render: (args) => (
    <Collapsible {...args}>
      <CollapsibleTrigger>Toggle</CollapsibleTrigger>
      <CollapsibleContent>Hidden text.</CollapsibleContent>
    </Collapsible>
  ),
};
