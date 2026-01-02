'use client';

import {
  Separator as SeparatorPrimitive,
  type SeparatorProps as SeparatorPrimitiveProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants';

const separatorVariants = tv({
  base: 'shrink-0 bg-border',
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'w-px self-stretch',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

type SeparatorVariants = VariantProps<typeof separatorVariants>;

type SeparatorProps = SeparatorPrimitiveProps & SeparatorVariants;

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive
      className={separatorVariants({ orientation, className })}
      data-slot="separator"
      orientation={orientation}
      {...props}
    />
  );
}

export { Separator, separatorVariants };
export type { SeparatorProps };
