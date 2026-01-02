'use client';

import {
  Separator as RACSeparator,
  type SeparatorProps as RACSeparatorProps,
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

type SeparatorProps = RACSeparatorProps & SeparatorVariants;

function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: SeparatorProps) {
  return (
    <RACSeparator
      className={separatorVariants({ orientation, className })}
      data-slot="separator"
      orientation={orientation}
      {...props}
    />
  );
}

export { Separator, separatorVariants };
export type { SeparatorProps };
