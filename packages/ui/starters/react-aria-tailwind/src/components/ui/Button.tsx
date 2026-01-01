'use client';

import {
  Button as RACButton,
  type ButtonProps as RACButtonProps,
  composeRenderProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants';

import { focusRing } from '@/starters/react-aria-tailwind/src/lib/utils';

const buttonVariants = tv({
  extend: focusRing,
  base: [
    'inline-flex items-center justify-center gap-2',
    'rounded-md text-sm font-medium',
    'transition-colors',
    'disabled:pointer-events-none disabled:opacity-50',
    'forced-colors:disabled:text-[GrayText]',
    '[-webkit-tap-highlight-color:transparent]',
  ],
  variants: {
    variant: {
      primary:
        'bg-primary text-primary-foreground pressed:bg-primary/90 hover:bg-primary/90',
      secondary:
        'bg-secondary text-secondary-foreground pressed:bg-secondary/80 hover:bg-secondary/80',
      destructive:
        'bg-destructive text-destructive-foreground pressed:bg-destructive/90 hover:bg-destructive/90',
      outline:
        'border border-input bg-background pressed:bg-accent pressed:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
      ghost:
        'pressed:bg-accent pressed:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 pressed:underline hover:underline',
    },
    size: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4',
      lg: 'h-11 px-8',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

type ButtonVariants = VariantProps<typeof buttonVariants>;

type ButtonProps = {} & RACButtonProps & ButtonVariants;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <RACButton
      className={composeRenderProps(className, (className, renderProps) =>
        buttonVariants({ ...renderProps, variant, size, className }),
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
