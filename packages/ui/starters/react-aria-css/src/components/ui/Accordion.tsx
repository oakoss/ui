'use client';

import './Accordion.css';

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

import { Icons } from '@/starters/react-aria-css/src/components/ui/icons';

// Accordion (DisclosureGroup)
type AccordionProps = AccordionPrimitiveProps;

function Accordion({ className, ...props }: AccordionProps) {
  return (
    <AccordionPrimitive
      className={`accordion ${className ?? ''}`}
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
      className={composeRenderProps(className, (className) =>
        `accordion-item ${className ?? ''}`.trim(),
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
    <HeadingPrimitive className="accordion-heading">
      <ButtonPrimitive
        className={`accordion-trigger focus-ring ${className ?? ''}`}
        data-slot="accordion-trigger"
        slot="trigger"
      >
        {children}
        <Icons.ChevronDown aria-hidden className="accordion-chevron" />
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
      className={composeRenderProps(className, (className) =>
        `accordion-content ${className ?? ''}`.trim(),
      )}
      data-slot="accordion-content"
      {...props}
    >
      <div className="accordion-content-inner">{children}</div>
    </AccordionContentPrimitive>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
export type {
  AccordionContentProps,
  AccordionItemProps,
  AccordionProps,
  AccordionTriggerProps,
};
