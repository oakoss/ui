import {
  Input as AriaInput,
  type InputProps as AriaInputProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';

import { cx } from '#/lib/cx';
import { fieldControl } from '#/lib/recipes';

const styles = tv({
  base: [fieldControl, 'py-1'],
  defaultVariants: { size: 'md' },
  variants: {
    size: { lg: 'h-control-lg', md: 'h-control', sm: 'h-control-sm' },
  },
});

export type InputProps = { size?: InputSize } & Omit<AriaInputProps, 'size'>;

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
