import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from '@oakoss/ui/components/ui/inputs/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@oakoss/ui/components/ui/layout/accordion';
import { expect, userEvent } from 'storybook/test';

import { part } from '../parts';

const meta = {
  component: Accordion,
  render: (args) => (
    <Accordion {...args} className="w-96">
      <AccordionItem id="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>Orders ship within two days.</AccordionContent>
      </AccordionItem>
      <AccordionItem id="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionContent>Return anything within 30 days.</AccordionContent>
      </AccordionItem>
      <AccordionItem id="warranty">
        <AccordionTrigger>Warranty</AccordionTrigger>
        <AccordionContent>
          Every product carries a one-year warranty.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  title: 'Layout/Accordion',
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

// The chevron is an SVG, which part() doesn't return.
function chevron() {
  const icon = document.querySelector('[data-slot=accordion-trigger-icon]');
  if (!icon) throw new Error('No chevron');
  return icon;
}

async function settle() {
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished),
  );
}

// Each trigger is a button in a level-3 heading, and opening it shows its
// panel.
export const Default: Story = {
  play: async ({ canvas }) => {
    const shipping = canvas.getByRole('button', { name: 'Shipping' });
    await expect(
      canvas.getByRole('heading', { level: 3, name: 'Shipping' }),
    ).toContainElement(shipping);
    await expect(shipping).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(shipping);
    await expect(shipping).toHaveAttribute('aria-expanded', 'true');
    await settle();
    await expect(
      canvas.getByText('Orders ship within two days.'),
    ).toBeVisible();
  },
};

export const Keyboard: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(
      canvas.getByRole('button', { name: 'Shipping' }),
    ).toHaveAttribute('aria-expanded', 'true');
  },
};

// One item is open at a time by default.
export const Single: Story = {
  args: { defaultExpandedKeys: ['shipping'] },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Returns' }));
    await expect(
      canvas.getByRole('button', { name: 'Shipping' }),
    ).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Multiple: Story = {
  args: { allowsMultipleExpanded: true, defaultExpandedKeys: ['shipping'] },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Returns' }));
    for (const name of ['Shipping', 'Returns']) {
      await expect(canvas.getByRole('button', { name })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    }
  },
};

export const HeadingLevel: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Shipping' }),
    ).toBeVisible();
  },
  render: (args) => (
    <Accordion {...args} className="w-96">
      <AccordionItem>
        <AccordionTrigger headingLevel={2}>Shipping</AccordionTrigger>
        <AccordionContent>Orders ship within two days.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// The chevron is decorative and turns over when its item opens.
export const Chevron: Story = {
  args: { defaultExpandedKeys: ['shipping'] },
  play: async () => {
    await settle();
    const [open, closed] = [
      ...document.querySelectorAll('[data-slot=accordion-trigger-icon]'),
    ];
    await expect(open).toHaveAttribute('aria-hidden', 'true');
    await expect(getComputedStyle(open ?? document.body).rotate).toBe('180deg');
    await expect(getComputedStyle(closed ?? document.body).rotate).not.toBe(
      '180deg',
    );
  },
};

// A trigger is a 44px target and shows the focus outline.
export const TargetAndFocus: Story = {
  play: async () => {
    await expect(
      part('accordion-trigger').getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(44);
    await userEvent.tab();
    await expect(getComputedStyle(part('accordion-trigger')).outlineStyle).toBe(
      'solid',
    );
  },
};

// Right to left, the label starts at the right and the chevron sits at the
// row's other end.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    const button = part('accordion-trigger');
    await expect(getComputedStyle(button).textAlign).toBe('start');
    const row = button.getBoundingClientRect();
    const icon = chevron().getBoundingClientRect();
    await expect(Math.round(icon.left - row.left)).toBeLessThanOrEqual(1);
  },
};

// The panel animates its height, then is hidden until found, so the
// browser's find-in-page can still open it.
export const Collapse: Story = {
  args: { defaultExpandedKeys: ['shipping'] },
  play: async ({ canvas }) => {
    const panel = part('accordion-content');
    await userEvent.click(canvas.getByRole('button', { name: 'Shipping' }));
    await expect(
      panel
        .getAnimations()
        .map((animation) =>
          animation instanceof CSSTransition
            ? animation.transitionProperty
            : '',
        ),
    ).toContain('height');
    // Clipped while it shrinks, so its content doesn't spill over the rows
    // below.
    await expect(getComputedStyle(panel).overflowY).toBe('clip');
    await settle();
    await expect(panel).toHaveAttribute('hidden', 'until-found');
    panel.dispatchEvent(new Event('beforematch'));
    await expect(
      canvas.getByRole('button', { name: 'Shipping' }),
    ).toHaveAttribute('aria-expanded', 'true');
  },
};

// Once open, the panel stops clipping, so a control at its edge shows its
// whole focus outline, however it was focused.
export const ContentFocus: Story = {
  args: { defaultExpandedKeys: ['shipping'] },
  play: async ({ canvas }) => {
    const field = canvas.getByRole('textbox', { name: 'Order number' });
    await userEvent.click(field);
    await expect(getComputedStyle(field).outlineStyle).toBe('solid');
    await expect(getComputedStyle(part('accordion-content')).overflowY).toBe(
      'visible',
    );
  },
  render: (args) => (
    <Accordion {...args} className="w-96">
      <AccordionItem id="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>
          <Input aria-label="Order number" />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
