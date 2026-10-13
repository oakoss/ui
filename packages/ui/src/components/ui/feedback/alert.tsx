import type { ComponentProps, ReactNode } from 'react';

import { tv, type VariantProps } from 'tailwind-variants/lite';

import * as Icon from '#/components/icons';
import { cn } from '#/lib/cx';

const styles = tv({
  base: [
    '@container/alert grid w-full auto-rows-min items-start gap-x-2.5 gap-y-0.5 rounded-lg border border-(--alert-border) bg-(--alert-bg) px-4 py-3 text-start text-sm text-(--alert-fg)',
    '[&_a]:underline [&_a]:underline-offset-3',
  ],
  variants: {
    intent: {
      destructive:
        '[--alert-bg:var(--color-destructive-subtle)] [--alert-border:var(--color-destructive-border)] [--alert-fg:var(--color-destructive-text)] [--alert-muted:var(--color-destructive-text)]',
      info: '[--alert-bg:var(--color-info-subtle)] [--alert-border:var(--color-info-border)] [--alert-fg:var(--color-info-text)] [--alert-muted:var(--color-info-text)]',
      neutral:
        '[--alert-bg:var(--color-card)] [--alert-border:var(--color-border)] [--alert-fg:var(--color-card-foreground)] [--alert-muted:var(--color-muted-foreground)]',
      success:
        '[--alert-bg:var(--color-success-subtle)] [--alert-border:var(--color-success-border)] [--alert-fg:var(--color-success-text)] [--alert-muted:var(--color-success-text)]',
      warning:
        '[--alert-bg:var(--color-warning-subtle)] [--alert-border:var(--color-warning-border)] [--alert-fg:var(--color-warning-text)] [--alert-muted:var(--color-warning-text)]',
    },
    withIcon: { false: 'grid-cols-1', true: 'grid-cols-[auto_minmax(0,1fr)]' },
  },
});

type Intent = NonNullable<VariantProps<typeof styles>['intent']>;

const defaultIcons: Record<Intent, ReactNode> = {
  destructive: <Icon.CircleAlert />,
  info: <Icon.Info />,
  neutral: null,
  success: <Icon.CircleCheck />,
  warning: <Icon.TriangleAlert />,
};

// Static by default. role="alert" interrupts, and is announced even when it
// mounts with its text; role="status" waits its turn, and is announced only
// when its content changes while it's mounted.
export type AlertProps = {
  // Replaces the intent's icon; a value that renders nothing shows none.
  icon?: ReactNode;
  intent?: Intent;
  role?: 'alert' | 'status';
} & Omit<ComponentProps<'div'>, 'role'>;

export function Alert({
  children,
  className,
  icon,
  intent = 'neutral',
  ...props
}: AlertProps) {
  const shown = icon === undefined ? defaultIcons[intent] : icon;
  const isWithIcon =
    shown !== null &&
    shown !== undefined &&
    typeof shown !== 'boolean' &&
    shown !== '';
  return (
    <div
      data-slot="alert"
      {...props}
      className={cn(styles({ intent, withIcon: isWithIcon }), className)}
      data-intent={intent}
    >
      {isWithIcon ? (
        <span
          aria-hidden
          className="flex h-lh items-center [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          data-slot="alert-icon"
        >
          {shown}
        </span>
      ) : null}
      {children}
    </div>
  );
}

// Sits after the text on a wide alert and below it on a narrow one. Negative
// column lines count from the text column, so they hold with or without an
// icon.
export function AlertAction({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '-col-start-2 mt-1.5 flex flex-wrap items-center gap-2 justify-self-start @md/alert:-col-start-1 @md/alert:row-span-2 @md/alert:row-start-1 @md/alert:ms-2 @md/alert:mt-0 @md/alert:justify-self-end',
        className,
      )}
      data-slot="alert-action"
      {...props}
    />
  );
}

export function AlertDescription({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        '-col-start-2 text-pretty text-(--alert-muted) [&_p:not(:last-child)]:mb-4',
        className,
      )}
      data-slot="alert-description"
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('-col-start-2 font-medium', className)}
      data-slot="alert-title"
      {...props}
    />
  );
}
