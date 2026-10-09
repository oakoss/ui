import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@oakoss/ui/components/ui/layout/accordion';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@oakoss/ui/components/ui/layout/collapsible';
import { Link } from 'react-aria-components';
import { expect, userEvent } from 'storybook/test';

import { part } from '../parts';

const meta = {
  args: { className: 'w-96' },
  component: Accordion,
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem id="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>Orders ship within two days.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  title: 'Layout/Accordion/States',
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

// Links in the content are underlined, so they don't rely on color.
export const ContentLinks: Story = {
  args: { defaultExpandedKeys: ['shipping'] },
  play: async ({ canvas }) => {
    await expect(
      getComputedStyle(canvas.getByRole('link', { name: 'tracking page' }))
        .textDecorationLine,
    ).toBe('underline');
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem id="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>
          See the <Link href="#tracking">tracking page</Link>.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// A Collapsible inside a section opens on its own, without joining the
// accordion and closing the section it sits in.
export const NestedCollapsible: Story = {
  args: { defaultExpandedKeys: ['shipping'] },
  play: async ({ canvas }) => {
    const more = canvas.getByRole('button', { name: 'More detail' });
    await userEvent.click(more);
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(
      canvas.getByRole('button', { name: 'Shipping' }),
    ).toHaveAttribute('aria-expanded', 'true');
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem id="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>
          <Collapsible>
            <CollapsibleTrigger>More detail</CollapsibleTrigger>
            <CollapsibleContent>Carriers and tracking.</CollapsibleContent>
          </Collapsible>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Hovered, a trigger underlines its label. Ends hovered so axe checks that
// state.
export const Hover: Story = {
  play: async () => {
    const trigger = part('accordion-trigger');
    trigger.dataset.hovered = 'true';
    await expect(getComputedStyle(trigger).textDecorationLine).toBe(
      'underline',
    );
  },
};

export const Disabled: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: 'Shipping' });
    await expect(trigger).toBeDisabled();
    await expect(getComputedStyle(trigger).opacity).toBe('0.5');
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem isDisabled>
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>Orders ship within two days.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Every part takes a consumer's className; the panel's can be a function.
export const ClassNames: Story = {
  play: async () => {
    await expect(part('accordion')).toHaveClass('w-96');
    await expect(part('accordion-item')).toHaveClass('px-2');
    await expect(part('accordion-trigger')).toHaveClass('tracking-wide');
    await expect(part('accordion-content')).toHaveClass('italic');
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem className="px-2">
        <AccordionTrigger className="tracking-wide">Shipping</AccordionTrigger>
        <AccordionContent
          className={({ isFocusVisibleWithin }) =>
            isFocusVisibleWithin ? 'not-italic' : 'italic'
          }
        >
          Orders ship within two days.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Forced colors draw the chevron in the trigger's text color, not a fixed
// gray.
export const ForcedColors: Story = {
  // In High Contrast the user's system colors set contrast, and axe's rule
  // misreads the forced colors.
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const chevron = document.querySelector(
      '[data-slot=accordion-trigger-icon]',
    );
    if (!chevron) throw new Error('No chevron');
    await expect(getComputedStyle(chevron).color).toBe(
      getComputedStyle(part('accordion-trigger')).color,
    );
  },
  tags: ['forced-colors'],
};
