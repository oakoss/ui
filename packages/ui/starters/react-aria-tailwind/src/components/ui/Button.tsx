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
    'relative inline-flex shrink-0 items-center justify-center gap-2',
    'whitespace-nowrap rounded-md text-sm font-medium',
    'transition-colors cursor-default',
    'disabled:pointer-events-none disabled:opacity-50',
    'forced-colors:disabled:text-[GrayText]',
    '[-webkit-tap-highlight-color:transparent]',
    // SVG icon handling
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    '[&_svg:not([class*=size-])]:size-4',
  ],
  variants: {
    variant: {
      default:
        'bg-primary text-primary-foreground shadow-sm pressed:bg-primary/90 hover:bg-primary/90',
      secondary:
        'bg-secondary text-secondary-foreground shadow-sm pressed:bg-secondary/80 hover:bg-secondary/80',
      destructive:
        'bg-destructive text-destructive-foreground shadow-sm pressed:bg-destructive/90 hover:bg-destructive/90',
      outline:
        'border border-input bg-background shadow-xs pressed:bg-accent pressed:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
      ghost:
        'pressed:bg-accent pressed:text-accent-foreground hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 pressed:underline hover:underline',
    },
    size: {
      default: 'h-9 px-4 py-2 has-[>svg]:px-3',
      sm: 'h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5',
      lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
      icon: 'size-9',
      'icon-sm': 'size-8',
      'icon-lg': 'size-10',
    },
    isPending: {
      true: 'cursor-default opacity-50',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type ButtonVariants = VariantProps<typeof buttonVariants>;

type ButtonProps = {
  /** Icon to display before the button content */
  iconLeft?: React.ReactNode;
  /** Icon to display after the button content */
  iconRight?: React.ReactNode;
} & RACButtonProps &
  ButtonVariants;

/**
 * Spinner component for loading state
 */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`size-4 animate-spin ${className ?? ''}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"
      />
    </svg>
  );
}

function Button({
  className,
  variant,
  size,
  iconLeft,
  iconRight,
  children,
  ...props
}: ButtonProps) {
  return (
    <RACButton
      className={composeRenderProps(className, (className, renderProps) =>
        buttonVariants({ ...renderProps, variant, size, className }),
      )}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      {...props}
    >
      {composeRenderProps(children, (children, { isPending }) => (
        <>
          {isPending ? (
            <Spinner
              className={
                children || iconLeft || iconRight ? 'absolute' : undefined
              }
            />
          ) : (
            iconLeft
          )}
          <span
            className={
              isPending && !size?.startsWith('icon') ? 'opacity-0' : undefined
            }
          >
            {children}
          </span>
          {!isPending && iconRight}
        </>
      ))}
    </RACButton>
  );
}

export { Button, buttonVariants, Spinner };
export type { ButtonProps };
