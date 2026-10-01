import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants';

import { cx } from '#/lib/cx';

export const buttonStyles = tv({
  base: 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  defaultVariants: { intent: 'primary', size: 'md' },
  variants: {
    intent: {
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline:
        'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    },
    size: {
      icon: 'size-9',
      lg: 'h-10 px-6',
      md: 'h-9 px-4',
      sm: 'h-8 px-3 text-xs',
    },
  },
});

export type ButtonProps = AriaButtonProps & VariantProps<typeof buttonStyles>;

export function Button({ className, intent, size, ...props }: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={cx(buttonStyles({ intent, size }), className)}
    />
  );
}
