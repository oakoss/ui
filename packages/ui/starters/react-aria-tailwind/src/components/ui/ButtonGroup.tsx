'use client';

import {
  Group as GroupPrimitive,
  type GroupProps as GroupPrimitiveProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants';

import { Separator } from '@/starters/react-aria-tailwind/src/components/ui/Separator';

const buttonGroupVariants = tv({
  base: [
    'flex w-fit items-stretch',
    // Focus states
    '[&>*]:focus-visible:z-10 [&>*]:focus-visible:relative',
  ],
  variants: {
    orientation: {
      horizontal: [
        // Remove inner border-radius
        '[&>*:not(:first-child)]:rounded-l-none',
        '[&>*:not(:last-child)]:rounded-r-none',
        // Remove inner borders to prevent double borders
        '[&>*:not(:first-child)]:border-l-0',
      ],
      vertical: [
        'flex-col',
        // Remove inner border-radius
        '[&>*:not(:first-child)]:rounded-t-none',
        '[&>*:not(:last-child)]:rounded-b-none',
        // Remove inner borders to prevent double borders
        '[&>*:not(:first-child)]:border-t-0',
      ],
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

type ButtonGroupProps = {
  /** The orientation of the button group. @default "horizontal" */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
} & Omit<GroupPrimitiveProps, 'className'>;

function ButtonGroup({
  className,
  orientation = 'horizontal',
  ...props
}: ButtonGroupProps) {
  return (
    <GroupPrimitive
      className={
        buttonGroupVariants({ orientation }) +
        (className ? ` ${className}` : '')
      }
      data-orientation={orientation}
      data-slot="button-group"
      {...props}
    />
  );
}

type ButtonGroupSeparatorProps = React.ComponentProps<typeof Separator>;

function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: ButtonGroupSeparatorProps) {
  return (
    <Separator
      className={`bg-input relative !m-0 self-stretch ${orientation === 'vertical' ? 'h-auto' : ''} ${className ?? ''}`}
      data-slot="button-group-separator"
      orientation={orientation}
      {...props}
    />
  );
}

export { ButtonGroup, ButtonGroupSeparator, buttonGroupVariants };
export type { ButtonGroupProps, ButtonGroupSeparatorProps };
