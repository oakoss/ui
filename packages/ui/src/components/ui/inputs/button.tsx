import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';

import { cx } from '#/lib/cx';
import { focusRing, targetSize } from '#/lib/recipes';

const buttonStyles = tv({
  base: [
    focusRing,
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50',
  ],
  defaultVariants: { intent: 'primary', size: 'md', targetSize: true },
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
    // Turn off where buttons sit closer than the hit area reaches (button
    // groups, toolbars), or neighbors take each other's clicks.
    targetSize: { false: '', true: targetSize },
  },
});

export type ButtonProps = AriaButtonProps & VariantProps<typeof buttonStyles>;

export function Button({
  className,
  intent,
  size,
  targetSize,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={cx(buttonStyles({ intent, size, targetSize }), className)}
    />
  );
}
