import type { ComponentProps } from 'react';

import { tv } from 'tailwind-variants/lite';

import * as Icon from '#/components/icons';
import { cn } from '#/lib/cx';

const icon = tv({
  base: 'animate-spin',
  variants: { size: { lg: 'size-6', md: 'size-4', sm: 'size-3' } },
});

export type SpinnerProps = { label?: string; size?: 'lg' | 'md' | 'sm' } & Omit<
  ComponentProps<'span'>,
  'aria-label' | 'children' | 'role'
>;

// An indeterminate progress bar, so screen readers announce the label rather
// than an unnamed image. A span, not React Aria's ProgressBar div, so it can
// sit inside text and buttons.
export function Spinner({
  className,
  label,
  size = 'md',
  ...props
}: SpinnerProps) {
  return (
    <span
      aria-label={named(label)}
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        className,
      )}
      data-size={size}
      data-slot="spinner"
      role="progressbar"
      {...props}
    >
      <Icon.Loader aria-hidden className={cn(icon({ size }))} />
    </span>
  );
}

// An empty label gets the default too: the spinner has no other name.
function named(label: string | undefined, fallback = 'Loading') {
  return label === undefined || label === '' ? fallback : label;
}
