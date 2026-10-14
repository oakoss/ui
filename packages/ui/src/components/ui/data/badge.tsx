import type { ComponentProps } from 'react';

import { tv, type VariantProps } from 'tailwind-variants/lite';

import { cn } from '#/lib/cx';
import { focusRing, stateLayer, targetSize } from '#/lib/recipes';

const defaults = {
  intent: 'primary',
  interactive: false,
  targetSize: false,
  variant: 'solid',
} as const;

// Hover, press and focus styles apply only through badgeStyles: hover: falls
// back to :hover on a plain span, which would make a static badge look
// clickable.
const styles = tv({
  base: 'inline-flex h-badge w-fit shrink-0 items-center justify-center gap-1 rounded-badge border border-transparent px-2 text-xs font-medium whitespace-nowrap tabular-nums has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&>svg]:pointer-events-none [&>svg]:size-3',
  compoundVariants: [
    {
      className:
        'hover:bg-(--badge-hover) not-data-rac:active:bg-(--badge-hover) pressed:bg-(--badge-hover)',
      interactive: true,
      variant: 'solid',
    },
    { className: stateLayer, interactive: true, variant: ['outline', 'soft'] },
  ],
  defaultVariants: defaults,
  variants: {
    intent: {
      destructive:
        '[--badge-bg:var(--color-destructive)] [--badge-border:var(--color-destructive-border)] [--badge-fg:var(--color-destructive-foreground)] [--badge-hover:var(--color-destructive-hover)] [--badge-subtle:var(--color-destructive-subtle)] [--badge-text:var(--color-destructive-text)]',
      info: '[--badge-bg:var(--color-info)] [--badge-border:var(--color-info-border)] [--badge-fg:var(--color-info-foreground)] [--badge-hover:var(--color-info-hover)] [--badge-subtle:var(--color-info-subtle)] [--badge-text:var(--color-info-text)]',
      neutral:
        '[--badge-bg:var(--color-foreground)] [--badge-border:var(--color-border)] [--badge-fg:var(--color-background)] [--badge-hover:color-mix(in_oklab,var(--color-foreground)_90%,transparent)] [--badge-subtle:var(--color-secondary)] [--badge-text:var(--color-foreground)]',
      primary:
        '[--badge-bg:var(--color-primary)] [--badge-border:var(--color-primary-border)] [--badge-fg:var(--color-primary-foreground)] [--badge-hover:var(--color-primary-hover)] [--badge-subtle:var(--color-primary-subtle)] [--badge-text:var(--color-primary-text)]',
      success:
        '[--badge-bg:var(--color-success)] [--badge-border:var(--color-success-border)] [--badge-fg:var(--color-success-foreground)] [--badge-hover:var(--color-success-hover)] [--badge-subtle:var(--color-success-subtle)] [--badge-text:var(--color-success-text)]',
      warning:
        '[--badge-bg:var(--color-warning)] [--badge-border:var(--color-warning-border)] [--badge-fg:var(--color-warning-foreground)] [--badge-hover:var(--color-warning-hover)] [--badge-subtle:var(--color-warning-subtle)] [--badge-text:var(--color-warning-text)]',
    },
    interactive: {
      false: '',
      true: [
        focusRing,
        'cursor-pointer transition-colors disabled:pointer-events-none disabled:opacity-50 forced-colors:disabled:text-[GrayText] forced-colors:disabled:opacity-100',
      ],
    },
    targetSize: { false: '', true: targetSize },
    variant: {
      outline: 'border-(--badge-border) text-(--badge-text)',
      soft: 'bg-(--badge-subtle) text-(--badge-text)',
      solid: 'bg-(--badge-bg) text-(--badge-fg)',
    },
  },
});

export type BadgeProps = BadgeStyleProps & ComponentProps<'span'>;

export type BadgeStyleProps = Pick<
  VariantProps<typeof styles>,
  'intent' | 'variant'
>;

export function Badge({ className, intent, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      {...props}
      className={cn(styles({ intent, variant }), className)}
      data-intent={intent ?? defaults.intent}
      data-variant={variant ?? defaults.variant}
    />
  );
}

// For a badge that's a link or button: React Aria's Link or Button with these
// styles, which add hover, press, focus and a 44×44 pointer target. Turn the
// target off where badges sit closer than that.
export function badgeStyles({
  className,
  targetSize = true,
  ...props
}: {
  className?: string;
  targetSize?: boolean;
} & BadgeStyleProps = {}): string {
  return cn(styles({ ...props, interactive: true, targetSize }), className);
}
