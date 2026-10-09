import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  Disclosure as AriaDisclosure,
  DisclosurePanel as AriaDisclosurePanel,
  type DisclosurePanelProps as AriaDisclosurePanelProps,
  type DisclosureProps as AriaDisclosureProps,
} from 'react-aria-components';

import { cx } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';

export function Collapsible(props: AriaDisclosureProps) {
  return <AriaDisclosure data-slot="collapsible" {...props} />;
}

export function CollapsibleContent({
  className,
  ...props
}: AriaDisclosurePanelProps) {
  return (
    <AriaDisclosurePanel
      data-slot="collapsible-content"
      {...props}
      // Clips only while closed or animating: React Aria sets the height to
      // auto once open, and then focus outlines at the edge show whole.
      className={cx(
        "h-(--disclosure-panel-height) overflow-clip transition-[height] [&[style*='--disclosure-panel-height:_auto']]:overflow-visible",
        className,
      )}
    />
  );
}

// Unstyled beyond its focus ring, so it can take any look, such as
// buttonStyles({ variant: 'ghost' }).
export function CollapsibleTrigger({ className, ...props }: AriaButtonProps) {
  return (
    <AriaButton
      data-slot="collapsible-trigger"
      {...props}
      className={cx(focusRing, className)}
      slot="trigger"
    />
  );
}
