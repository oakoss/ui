import type { Ref } from 'react';

import {
  Input as AriaInput,
  type InputProps as AriaInputProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';

import { cx } from '#/lib/cx';
import { fieldControl } from '#/lib/recipes';

// WebKit's built-in search clear button and decoration are hidden; a field
// that needs a clear button renders its own.
const styles = tv({
  base: [
    fieldControl,
    'py-1 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden',
  ],
  defaultVariants: { size: 'md' },
  variants: {
    size: { lg: 'h-control-lg', md: 'h-control', sm: 'h-control-sm' },
  },
});

export type InputProps = {
  ref?: Ref<HTMLInputElement>;
  size?: InputSize;
} & Omit<AriaInputProps, 'size'>;

export type InputSize = NonNullable<VariantProps<typeof styles>['size']>;

export function Input({ className, size = 'md', ...props }: InputProps) {
  return (
    <AriaInput
      className={cx(styles({ size }), className)}
      data-size={size}
      data-slot="input"
      {...props}
    />
  );
}
