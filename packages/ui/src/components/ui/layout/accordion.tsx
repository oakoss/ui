import type { ReactNode } from 'react';

import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  Disclosure as AriaDisclosure,
  DisclosureGroup as AriaDisclosureGroup,
  type DisclosureGroupProps as AriaDisclosureGroupProps,
  DisclosurePanel as AriaDisclosurePanel,
  type DisclosurePanelProps as AriaDisclosurePanelProps,
  type DisclosureProps as AriaDisclosureProps,
  Heading as AriaHeading,
  DisclosureGroupStateContext,
} from 'react-aria-components';

import * as Icon from '#/components/icons';
import { cx } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';

export type AccordionTriggerProps = {
  children: ReactNode;
  // Each trigger sits in a heading; match it to the page's outline.
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
} & Omit<AriaButtonProps, 'children'>;

export function Accordion({ className, ...props }: AriaDisclosureGroupProps) {
  return (
    <AriaDisclosureGroup
      data-slot="accordion"
      {...props}
      className={cx('flex w-full flex-col', className)}
    />
  );
}

export function AccordionContent({
  children,
  className,
  ...props
}: AriaDisclosurePanelProps) {
  return (
    <AriaDisclosurePanel
      data-slot="accordion-content"
      {...props}
      // Clips only while closed or animating: React Aria sets the height to
      // auto once open, and then focus outlines at the edge show whole.
      className={cx(
        "h-(--disclosure-panel-height) overflow-clip text-sm transition-[height] [&[style*='--disclosure-panel-height:_auto']]:overflow-visible",
        className,
      )}
    >
      <div className="pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4">
        {/* A Collapsible inside would otherwise join this accordion and close
            its own section when opened. */}
        <DisclosureGroupStateContext value={null}>
          {children}
        </DisclosureGroupStateContext>
      </div>
    </AriaDisclosurePanel>
  );
}

export function AccordionItem({ className, ...props }: AriaDisclosureProps) {
  return (
    <AriaDisclosure
      data-slot="accordion-item"
      {...props}
      className={cx('not-last:border-b', className)}
    />
  );
}

export function AccordionTrigger({
  children,
  className,
  headingLevel = 3,
  ...props
}: AccordionTriggerProps) {
  return (
    <AriaHeading className="flex" level={headingLevel}>
      <AriaButton
        data-slot="accordion-trigger"
        {...props}
        className={cx(
          [
            focusRing,
            'group/accordion-trigger flex min-h-11 flex-1 items-center justify-between gap-4 rounded-control py-2.5 text-start text-sm font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-50',
          ],
          className,
        )}
        slot="trigger"
      >
        {children}
        {/* One chevron that turns over; a vertical one needs no mirroring. */}
        <Icon.ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform group-aria-expanded/accordion-trigger:rotate-180 forced-colors:text-current"
          data-slot="accordion-trigger-icon"
        />
      </AriaButton>
    </AriaHeading>
  );
}
