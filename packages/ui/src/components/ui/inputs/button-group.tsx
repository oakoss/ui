import { type ComponentProps, use } from 'react';
import {
  Group as AriaGroup,
  type GroupProps as AriaGroupProps,
  SeparatorContext,
} from 'react-aria-components';

import {
  ButtonStyleContext,
  type ButtonStyleProps,
} from '#/components/ui/inputs/button';
import {
  Separator,
  type SeparatorProps,
} from '#/components/ui/layout/separator';
import { cn, cx } from '#/lib/cx';
import { joined } from '#/lib/recipes';

export type ButtonGroupProps = {
  orientation?: 'horizontal' | 'vertical';
  // The Buttons inside take these unless they set their own. An icon size goes
  // on each icon Button, whose type then requires a name.
  size?: Exclude<ButtonStyleProps['size'], 'icon-lg' | 'icon-sm' | 'icon'>;
  variant?: ButtonStyleProps['variant'];
} & Omit<AriaGroupProps, 'role'>;

// A named group is announced as one; an unnamed one only lays its children
// out, so it adds nothing to the accessibility tree. Its children sit too
// close for 44px hit areas, so those are off. A nested group inherits the
// size and variant it doesn't set.
export function ButtonGroup({
  className,
  orientation = 'horizontal',
  size,
  variant,
  ...props
}: ButtonGroupProps) {
  const outer = use(ButtonStyleContext);
  const isNamed =
    (props['aria-label'] ?? '').trim() !== '' ||
    (props['aria-labelledby'] ?? '').trim() !== '';
  return (
    <ButtonStyleContext
      value={{ size: size ?? outer.size, variant: variant ?? outer.variant }}
    >
      <SeparatorContext
        value={{
          orientation: orientation === 'horizontal' ? 'vertical' : 'horizontal',
        }}
      >
        <AriaGroup
          data-slot="button-group"
          {...props}
          className={cx(
            [
              'flex w-fit items-stretch *:after:min-h-0 *:after:min-w-0 has-[>[data-slot=button-group]]:gap-2 orientation-vertical:flex-col',
              joined,
            ],
            className,
          )}
          data-orientation={orientation}
          role={isNamed ? 'group' : 'presentation'}
        />
      </SeparatorContext>
    </ButtonStyleContext>
  );
}

// Takes the group's orientation turned across it, and sits over the joined
// edges its neighbors overlap, though under a focused child's outline.
export function ButtonGroupSeparator({ className, ...props }: SeparatorProps) {
  return (
    <Separator
      data-slot="button-group-separator"
      {...props}
      className={cn('relative z-1 border-input', className)}
    />
  );
}

export function ButtonGroupText({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="button-group-text"
      {...props}
      className={cn(
        "flex items-center gap-2 rounded-control border border-input bg-muted px-2.5 text-sm font-medium [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
    />
  );
}
