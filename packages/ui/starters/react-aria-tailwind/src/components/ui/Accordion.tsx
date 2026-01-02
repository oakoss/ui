'use client';

import {
  Button as ButtonPrimitive,
  composeRenderProps,
  Disclosure as AccordionItemPrimitive,
  DisclosureGroup as AccordionPrimitive,
  type DisclosureGroupProps as AccordionPrimitiveProps,
  DisclosurePanel as AccordionContentPrimitive,
  type DisclosurePanelProps as AccordionContentPrimitiveProps,
  type DisclosureProps as AccordionItemPrimitiveProps,
  Heading as HeadingPrimitive,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { Icons } from '@/starters/react-aria-tailwind/src/components/ui/icons';
import { focusRing } from '@/starters/react-aria-tailwind/src/lib/utils';

const accordionItemStyles = tv({
  base: 'border-b last:border-b-0',
});

const accordionTriggerStyles = tv({
  extend: focusRing,
  base: [
    'flex flex-1 items-start justify-between gap-4',
    'rounded-md py-4 text-left text-sm font-medium',
    'cursor-default transition-all outline-none',
    'hover:underline',
    'disabled:pointer-events-none disabled:opacity-50',
    '[&[data-expanded]>svg]:rotate-180',
  ],
});

const accordionPanelStyles = tv({
  base: [
    'overflow-hidden text-sm',
    'h-(--disclosure-panel-height)',
    'transition-[height] duration-200 ease-out',
  ],
});

// Accordion (DisclosureGroup)
type AccordionProps = AccordionPrimitiveProps;

function Accordion({ className, ...props }: AccordionProps) {
  return (
    <AccordionPrimitive
      className={className}
      data-slot="accordion"
      {...props}
    />
  );
}

// AccordionItem (Disclosure)
type AccordionItemProps = AccordionItemPrimitiveProps;

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionItemPrimitive
      className={composeRenderProps(className, (className, renderProps) =>
        accordionItemStyles({ ...renderProps, className }),
      )}
      data-slot="accordion-item"
      {...props}
    />
  );
}

// AccordionTrigger
type AccordionTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  return (
    <HeadingPrimitive className="flex">
      <ButtonPrimitive
        className={composeRenderProps(className, (className, renderProps) =>
          accordionTriggerStyles({ ...renderProps, className }),
        )}
        data-slot="accordion-trigger"
        slot="trigger"
      >
        {children}
        <Icons.ChevronDown
          aria-hidden
          className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200"
        />
      </ButtonPrimitive>
    </HeadingPrimitive>
  );
}

// AccordionContent (DisclosurePanel)
type AccordionContentProps = AccordionContentPrimitiveProps;

function AccordionContent({
  children,
  className,
  ...props
}: AccordionContentProps) {
  return (
    <AccordionContentPrimitive
      className={composeRenderProps(className, (className, renderProps) =>
        accordionPanelStyles({ ...renderProps, className }),
      )}
      data-slot="accordion-content"
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </AccordionContentPrimitive>
  );
}

export {
  Accordion,
  AccordionContent,
  AccordionItem,
  accordionItemStyles,
  accordionPanelStyles,
  AccordionTrigger,
  accordionTriggerStyles,
};
export type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionProps,
  AccordionTriggerProps,
};
